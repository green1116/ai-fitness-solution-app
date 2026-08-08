/**
 * Pilot regression suite — runs P1–P18 verify scripts sequentially.
 * Usage: npx tsx scripts/verify-pilot-regression.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { listRegressionSuiteCatalog } from "../lib/pilot/v80";

function main() {
  console.log("=== Pilot Regression Suite (P1–P18) ===\n");
  const catalog = listRegressionSuiteCatalog();
  const missing = catalog.filter((e) => !e.present);
  if (missing.length > 0) {
    console.error("Missing scripts:");
    for (const m of missing) console.error(` - ${m.script}`);
    process.exit(1);
  }

  const failed: string[] = [];
  for (const entry of catalog) {
    const scriptPath = path.join(process.cwd(), entry.script);
    if (!existsSync(scriptPath)) {
      failed.push(entry.pilot);
      continue;
    }
    console.log(`--- ${entry.pilot}: ${entry.script} ---`);
    const result = spawnSync("npx", ["tsx", entry.script], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    if (result.status !== 0) {
      failed.push(entry.pilot);
      console.error(`FAIL ${entry.pilot} (exit ${result.status})\n`);
    } else {
      console.log(`PASS ${entry.pilot}\n`);
    }
  }

  if (failed.length > 0) {
    console.error(`\n=== REGRESSION FAILED: ${failed.join(", ")} ===`);
    process.exit(1);
  }

  console.log("=== ALL P1–P18 REGRESSION CHECKS PASSED ===");
}

main();
