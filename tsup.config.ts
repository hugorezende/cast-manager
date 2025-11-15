import { defineConfig } from "tsup";

export default defineConfig([
  // Main library build
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    external: ["react", "@angular/core"],
  },
  // React integration build
  {
    entry: ["src/react/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist/react",
    external: ["react", "@angular/core"],
  },
  // Angular integration build
  {
    entry: ["src/angular/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist/angular",
    external: ["react", "@angular/core"],
  },
]);
