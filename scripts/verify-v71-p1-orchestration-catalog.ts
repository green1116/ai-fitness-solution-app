/**
 * V71 P1 — Orchestration Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertOrchestrationCatalogPass,
  buildOrchestrationCatalog,
  formatOrchestrationCatalogSummary,
  getOrchestrationById,
  getOrchestrationsByAction,
  getOrchestrationsByTrigger,
  ORCHESTRATION_CATALOG,
  runOrchestrationCatalog,
  V71_ORCHESTRATION_FREEZE_VERSION,
  V71_ORCHESTRATION_VERSION,
} from "../lib/orchestration/v71/orchestration.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p1-orchestration-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/orchestration.types.ts",
    "lib/orchestration/v71/orchestration.catalog.ts",
    "lib/orchestration/v71/orchestration.builder.ts",
    "lib/orchestration/v71/orchestration.entry.ts",
    "docs/V71-P1-ORCHESTRATION-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 orchestration catalog module structure");
}

function testCatalogFields() {
  check(ORCHESTRATION_CATALOG.length >= 6, "orchestration catalog entries");
  for (const entry of ORCHESTRATION_CATALOG) {
    check(entry.orchestration.length > 0, `${entry.id} orchestration`);
    check(entry.workflow.length > 0, `${entry.id} workflow`);
    check(entry.trigger.length > 0, `${entry.id} trigger`);
    check(entry.action.length > 0, `${entry.id} action`);
    check(entry.step.length > 0, `${entry.id} step`);
    check(entry.owner.length > 0, `${entry.id} owner`);
    check(entry.status.length > 0, `${entry.id} status`);
    check(entry.input.length > 0, `${entry.id} input`);
    check(entry.output.length > 0, `${entry.id} output`);
    check(entry.retry.maxAttempts >= 0, `${entry.id} retry.maxAttempts`);
    check(entry.retry.backoff.length > 0, `${entry.id} retry.backoff`);
    check(entry.retry.interval.length >= 0, `${entry.id} retry.interval`);
    check(entry.timeout.length > 0, `${entry.id} timeout`);
  }
  console.log("✓ orchestration catalog field coverage");
}

function testCatalogQueries() {
  const orc = getOrchestrationById("ORC-001");
  check(orc?.trigger === "gate-pass", "ORC-001 gate-pass trigger");
  check(orc?.input === "v70-delivery-freeze-1", "ORC-001 upstream delivery freeze input");

  const event = getOrchestrationsByTrigger("event");
  check(event.length >= 2, "event trigger orchestrations");

  const signoff = getOrchestrationsByAction("signoff-freeze");
  check(signoff.length >= 1, "signoff-freeze action orchestrations");

  console.log("✓ orchestration catalog queries");
}

function testReport() {
  const incomplete = runOrchestrationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { catalogComplete: false },
  });
  check(!incomplete.catalogReady, "incomplete catalog not ready");

  const ready = buildOrchestrationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_ORCHESTRATION_VERSION, "orchestration version");
  check(ready.freezeVersion === V71_ORCHESTRATION_FREEZE_VERSION, "freeze version declared");
  check(ready.manifest.catalogComplete, "manifest complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertOrchestrationCatalogPass(ready);

  console.log("✓ orchestration catalog report");
  console.log(formatOrchestrationCatalogSummary(ready));
  console.log("\n✅ V71 P1 Orchestration Catalog — verify PASS");
}

function main() {
  console.log("V71 P1 Orchestration Catalog Verification\n");
  checkModuleStructure();
  testCatalogFields();
  testCatalogQueries();
  testReport();
}

main();
