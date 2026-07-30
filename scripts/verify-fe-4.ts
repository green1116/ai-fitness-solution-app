/**
 * FE-4 master runner — child packages then consolidation.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const scripts = [
  "scripts/verify-fe-4.1-state.ts",
  "scripts/verify-fe-4.2-adapter.ts",
  "scripts/verify-fe-4.3-security.ts",
  "scripts/verify-fe-4.4-performance.ts",
  "scripts/verify-fe-4.5.ts",
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
  console.error("\nFE-4 verification suite FAILED");
  process.exit(1);
}

console.log("\nFE-4 verification suite COMPLETE — FE-4.1…FE-4.5 passed");
