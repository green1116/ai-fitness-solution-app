/**
 * WP-RUNTIME-OPS-TENANT-RETRY-UX-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkControl() {
  const src = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(src.includes("failureClass"), "reads failureClass");
  assert(src.includes('failureClass === "RETRYABLE"'), "Retry only RETRYABLE");
  assert(src.includes('failureClass === "TERMINAL"'), "TERMINAL non-retryable");
  assert(src.includes("Retry"), "Retry button");
  assert(src.includes("isRetryableFailed"), "retry helper");
  assert(src.includes("isTerminalFailed"), "terminal helper");
  assert(src.includes("failedFailureClass"), "shows failureClass on FAILED");
  assert(src.includes("type=\"submit\""), "Retry re-submits form");
  assert(!src.includes("setInterval"), "no auto-retry interval");
  assert(!src.includes("setTimeout"), "no auto-retry timeout");
  assert(src.includes("EXECUTE"), "EXECUTE retained");
  assert(src.includes("REVIEW"), "REVIEW retained");
  assert(src.includes("RECOVER"), "RECOVER retained");
  assert(!src.includes("@/lib/prisma"), "no prisma");
  console.log("✓ TenantOpsReviewActionControl retry UX");
}

function checkFrozen() {
  const files = [
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/runtime-ops/tenant-ops-execute.ts",
    "lib/runtime-ops/tenant-ops-action.ts",
    "lib/runtime-ops/tenant-ops-recovery.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("isRetryableFailed"), `${file} untouched by retry UX`);
  }
  console.log("✓ action cores / frozen untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-RETRY-UX-1 ===\n");
  checkControl();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
