import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/main.ts"],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  failOnWarn: false
});
