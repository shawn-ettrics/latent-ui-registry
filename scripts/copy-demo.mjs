// Copy the prebuilt app demo (committed in ./demo) into dist/demo after the docs build.
import { cpSync, existsSync } from "node:fs";

if (!existsSync("demo/index.html")) { console.log("demo: none (skipped)"); process.exit(0); }
cpSync("demo", "dist/demo", { recursive: true });
console.log("demo: copied to dist/demo");
