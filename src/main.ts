import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import prompts from "prompts";
import { platform } from "node:os";
import { sha256 } from "js-sha256";

if (platform() !== "win32") {
  throw Error("仅支持Windows系统");
}

async function replaceMan(
  photoPath: string,
  photoContent: Buffer
): Promise<boolean> {
  try {
    writeFileSync(photoPath, photoContent);
    console.log(`成功替换 ${photoPath}`);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ROOT_FOLDERS = [
    join("C:", "Program Files (x86)", "Seewo", "EasiNote5"),
    join("C:", "Users", env.USERNAME, "AppData", "Roaming", "Seewo"),
  ].filter((folder) => {
    return existsSync(folder);
  });
  const photoContent = readFileSync(
    join(__dirname, "..", "public", "Photo.jpg")
  );
  let mainFolder: string;
  let ROOT_FOLDER: string[];
  let photoFile: string;

  if (ROOT_FOLDERS.length === 0) {
    throw Error("无法找到希沃白板 5 的根文件夹");
  } else if (ROOT_FOLDERS.length === 1) {
    ROOT_FOLDER = ROOT_FOLDERS;
  } else {
    ROOT_FOLDER = (
      await prompts({
        type: "multiselect",
        name: "rootFolder",
        message: "找到多个根文件夹，请选择要希沃白板 5 的根文件夹",
        choices: ROOT_FOLDERS.map((folder) => {
          return {
            title: folder,
            value: folder,
          };
        }),
      })
    ).rootFolder;
  }
  for (const folder of ROOT_FOLDER) {
    const files = readdirSync(folder);
    const mainFolders = files.filter((file) => {
      return file.includes("EasiNote5");
    });
    if (mainFolders.length === 0) {
      throw Error("无法找到希沃白板 5 的主文件夹");
    } else {
      if (mainFolders.length === 1) {
        mainFolder = join(folder, mainFolders[0]);
      } else {
        mainFolder = join(
          folder,
          (
            await prompts({
              type: "select",
              name: "mainFolder",
              message: "找到多个文件夹，请选择希沃白板 5 的主文件夹",
              choices: mainFolders.map((mainFolder) => {
                return {
                  title: mainFolder,
                  value: mainFolder,
                };
              }),
            })
          ).mainFolder as string
        );
      }
    }
  }
  const mode = (
    await prompts({
      type: "select",
      name: "mode",
      choices: [
        {
          title: "单次替换",
          value: "single",
        },
        {
          title: "循环替换",
          value: "loop",
        },
        {
          title: "侦察替换",
          value: "detect",
        },
        {
          title: "退出",
          value: "exit",
        },
      ],
      message: "请选择替换模式",
    })
  ).mode as string;

  const photoFolderMain = join(mainFolder, "Main", "Resources", "Startup");
  const photoFolderUser = join(mainFolder, "Resources", "Banner");
  let photoFolder: string;
  if (existsSync(photoFolderMain)) {
    photoFolder = photoFolderMain;
  } else if (existsSync(photoFolderUser)) {
    photoFolder = photoFolderUser;
  } else {
    throw Error(`无法找到希沃白板 5 的图片文件夹`);
  }
  const photoFiles = readdirSync(photoFolder).filter((photo) => {
    return photo.endsWith(".png");
  });
  if (photoFiles.length === 0) {
    throw Error("无法找到希沃白板 5 的图片文件");
  } else {
    if (photoFiles.length === 1) {
      photoFile = join(photoFolder, photoFiles[0]);
    } else {
      photoFile = join(
        photoFolder,
        (
          await prompts({
            type: "select",
            name: "photoFile",
            message: "找到多个图片文件，请选择要原神的图片文件",
            choices: photoFiles.map((photoFile) => {
              return {
                title: photoFile,
                value: photoFile,
              };
            }),
          })
        ).photoFile as string
      );
    }

    switch (mode) {
      case "single":
        const result = await replaceMan(photoFile, photoContent);
        if (result) {
          console.log("原神，启动！");
        }
        break;
      case "loop":
        while (true) {
          const result = await replaceMan(photoFile, photoContent);
          if (result) {
            console.log("原神，启动！");
          }
          await setTimeout(() => {}, 5000);
        }
        break;
      case "detect":
        const photoSha256 = sha256(photoContent);
        while (true) {
          try {
            if (sha256(readFileSync(photoFile)) !== photoSha256) {
              console.log("侦测到图片 Sha256 发生改变，重新替换");
              const result = await replaceMan(photoFile, photoContent);
              if (result) {
                console.log("原神，启动！");
              }
            }
          } catch (error) {
            console.log(`替换图片或侦察时遇到错误 ${error}`);
          }
          await setTimeout(() => {}, 5000);
        }
    }
  }
}

main();
