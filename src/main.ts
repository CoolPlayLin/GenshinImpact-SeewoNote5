import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import prompts from "prompts";
import { platform } from "node:os";

if (platform() !== "win32") {
  throw Error("仅支持Windows系统");
}

async function replaceMan(
  photoPath: string,
  photoContent: Buffer,
): Promise<boolean> {
  let photoFile: string;

  const photoFiles = readdirSync(photoPath).filter((photo) => {
    return photo.endsWith(".png");
  });
  if (photoFiles.length === 0) {
    throw Error("无法找到希沃白板 5 的图片文件");
  } else {
    if (photoFiles.length === 1) {
      photoFile = join(photoPath, photoFiles[0]);
    } else {
      photoFile = join(
        photoPath,
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
        ).photoFile as string,
      );
    }
    writeFileSync(photoFile, photoContent);
    console.log(`成功替换 ${photoFile}`);
    return true;
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
    join(__dirname, "..", "public", "Photo.jpg"),
  );
  let mainFolder: string;
  let ROOT_FOLDER: string;

  if (ROOT_FOLDERS.length === 0) {
    throw Error("无法找到希沃白板 5 的根文件夹");
  } else if (ROOT_FOLDERS.length === 1) {
    ROOT_FOLDER = ROOT_FOLDERS[0];
  } else {
    ROOT_FOLDER = (
      await prompts({
        type: "select",
        name: "rootFolder",
        message: "找到多个根文件夹，请选择要希沃白板 5 的根文件夹",
        choices: ROOT_FOLDERS.map((folder) => {
          return {
            title: folder,
            value: folder,
          };
        }),
      })
    ).rootFolder as string;
  }
  const files = readdirSync(ROOT_FOLDER);
  const mainFolders = files.filter((file) => {
    return file.includes("EasiNote5");
  });
  if (mainFolders.length === 0) {
    throw Error("无法找到希沃白板 5 的主文件夹");
  } else {
    if (mainFolders.length === 1) {
      mainFolder = join(ROOT_FOLDER, mainFolders[0]);
    } else {
      mainFolder = join(
        ROOT_FOLDER,
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
        ).mainFolder as string,
      );
    }
  }
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
  const result = await replaceMan(photoFolder, photoContent);
  if (result) {
    console.log("原神，启动！");
  }
}

main();
