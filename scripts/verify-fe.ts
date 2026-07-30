/**
 * Frontend verification master — FE-2 / FE-3.3 / FE-4 / FE-5.1 / FE-5.2 / FE-5.3.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const scripts = [
  "scripts/verify-fe-2.ts",
  "scripts/verify-fe-3.3-component-verification.ts",
  "scripts/verify-fe-4.ts",
  "scripts/verify-fe-5.1.ts",
  "scripts/verify-fe-5.2.ts",
  "scripts/verify-fe-5.3.ts",
];

const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

let failed = false;
for (const rel of scripts) {
  console.log(`\n>>> ${rel}`);
  const result = spawnSync(process.execPath, [tsxCli, rel], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    failed = true;
    break;
  }
}

if (failed) {
  console.error("\nFrontend verification suite FAILED");
  process.exit(1);
}

console.log(
  "\nFrontend verification suite COMPLETE — FE-2 / FE-3 / FE-4 / FE-5.1 / FE-5.2 / FE-5.3 passed",
);
