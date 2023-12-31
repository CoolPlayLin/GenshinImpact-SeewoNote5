import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm", "cjs"],
  target: "node18",
  splitting: true,
  outDir: "dist",
  clean: true
});
