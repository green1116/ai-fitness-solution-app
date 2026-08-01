/**
 * AE-1 — Application Assembly verification runner.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  assertApplicationAssemblyGate,
  runApplicationAssemblyGate,
} from "../lib/application/ae1/verify/application.assembly.gate";

const root = path.resolve(__dirname, "..");
const report = runApplicationAssemblyGate(root);

console.log("=== AE-1 Application Assembly ===");
console.log(
  `assembly=${report.assemblyId} gate=${report.gateId} base=${report.baseFreezeRef}`,
);
console.log(
  `summary: surfaces=${report.summary.surfaces} packages=${report.summary.packages} domains=${report.summary.domains} slots=${report.summary.slots} invariants=${report.summary.invariants} tsc=${report.summary.tscPassed}`,
);
console.log("");

for (const row of report.checks) {
  console.log(`${row.status} [${row.source}] ${row.id} — ${row.title}`);
  console.log(`  evidence: ${row.evidence}`);
}

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
});
const porcelain = status.stdout ?? "";
const forbiddenTouched = porcelain
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => {
    // Only flag modifications to frozen upstream — not pre-existing untracked worktrees.
    if (/^\?\?/.test(line)) return false;
    return /lib\/frontend|lib\/backend|lib\/data|lib\/integration|lib\/delivery|lib\/implementation|lib\/closure|lib\/product|docs\/product-definition/.test(
      line,
    );
  });


console.log("");
if (forbiddenTouched.length > 0) {
  console.log(
    "FAIL No Product Definition / Governance / PI / Runtime redesign — unexpected diffs:",
  );
  for (const line of forbiddenTouched) console.log(`  ${line}`);
  process.exit(1);
}
console.log(
  "PASS No Product Definition / Governance / PI / Runtime redesign in this assembly step",
);

console.log("");
console.log(
  report.passed
    ? "AE-1 Application Assembly COMPLETE — registry composition only; verification PASS"
    : "AE-1 Application Assembly FAILED",
);

assertApplicationAssemblyGate(report);
