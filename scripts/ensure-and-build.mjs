// scripts/ensure-and-build.mjs
import { existsSync } from "fs";
import { spawnSync } from "child_process";
const srcExists = existsSync("./src");

if (srcExists) {
  console.log("src found — running tsc -b");
  const tsc = spawnSync("npx", ["tsc", "-b"], { stdio: "inherit" });
  if (tsc.status !== 0) process.exit(tsc.status);
} else {
  console.log("src not found — skipping tsc step");
}

console.log("Running vite build");
const vite = spawnSync("npx", ["vite", "build"], { stdio: "inherit" });
process.exit(vite.status ?? 0);
