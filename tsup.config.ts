import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm", "cjs"],
  target: "es2017",
  splitting: true,
  sourcemap: true,
  outDir: "dist",
});
