/**
 * V70 P6 — Lifecycle Management Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertLifecycleManagementPass,
  buildLifecycleManagement,
  computeDeclarativeLifecycleTerminal,
  formatLifecycleManagementSummary,
  getLifecycleStateById,
  getLifecycleStateByReleaseRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByReleaseRef,
  isLifecycleManagementRefsAligned,
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  runLifecycleManagement,
  SUPPORT_POLICY_CATALOG,
  V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION,
  V70_LIFECYCLE_MANAGEMENT_VERSION,
} from "../lib/delivery/v70/lifecycle.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p6-lifecycle-management";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/lifecycle.management.ts",
    "lib/delivery/v70/lifecycle.states.ts",
    "lib/delivery/v70/lifecycle.builder.ts",
    "lib/delivery/v70/lifecycle.entry.ts",
    "docs/V70-P6-LIFECYCLE-MANAGEMENT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 lifecycle management module structure");
}

function testInventories() {
  check(LIFECYCLE_STATE_CATALOG.length >= 6, "lifecycle state catalog");
  check(LIFECYCLE_TRANSITION_CATALOG.length >= 6, "lifecycle transition catalog");
  check(SUPPORT_POLICY_CATALOG.length >= 6, "support policy catalog");
  check(isLifecycleManagementRefsAligned(), "lifecycle refs aligned");
  console.log("✓ states, transitions, support policies & alignment");
}

function testStateFields() {
  for (const state of LIFECYCLE_STATE_CATALOG) {
    check(state.retention.length > 0, `${state.id} retention`);
    check(state.endOfLife.length > 0, `${state.id} endOfLife`);
    check(state.supportPolicy.length > 0, `${state.id} supportPolicy`);
    const flags = [state.active, state.deprecated, state.maintenance, state.archived];
    check(flags.filter(Boolean).length === 1, `${state.id} exclusive state flags`);
  }

  for (const trn of LIFECYCLE_TRANSITION_CATALOG) {
    check(trn.trigger.length > 0, `${trn.id} trigger`);
    check(trn.retention.length > 0, `${trn.id} retention`);
    check(trn.fromState.length > 0, `${trn.id} fromState`);
    check(trn.toState.length > 0, `${trn.id} toState`);
  }

  console.log("✓ lifecycle field coverage");
}

function testLifecycleQueries() {
  const active = getLifecycleStatesByKind("active");
  check(active.length >= 3, "active lifecycle states");

  const archived = getLifecycleStateByReleaseRef("DLV-REL-008");
  check(archived?.archived === true, "DLV-REL-008 archived");
  check(archived?.active === false, "DLV-REL-008 not active");

  const state = getLifecycleStateById("DLV-LCS-007");
  check(state?.deprecated === true, "DLV-LCS-007 deprecated");

  const transitions = getTransitionsByReleaseRef("DLV-REL-003");
  check(transitions.length >= 2, "DLV-REL-003 transitions");

  const policy = getSupportPolicyById("DLV-LCS-SUP-001");
  check(policy?.policyKind === "lts-governance", "DLV-LCS-SUP-001 policy kind");

  check(
    computeDeclarativeLifecycleTerminal({ archived: true, endOfLife: "2025-01-01" }),
    "terminal archived lifecycle",
  );
  check(
    !computeDeclarativeLifecycleTerminal({ archived: false, endOfLife: "n/a" }),
    "non-terminal active lifecycle",
  );

  console.log("✓ lifecycle queries");
}

function testReport() {
  const incomplete = runLifecycleManagement({
    deploymentId: DEPLOYMENT_ID,
    signals: { upgradeGovernanceReady: false },
  });
  check(!incomplete.managementReady, "incomplete upgrade not ready");

  const ready = buildLifecycleManagement({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_LIFECYCLE_MANAGEMENT_VERSION, "lifecycle version");
  check(ready.freezeVersion === V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION, "freeze version");
  check(ready.upgradeGovernanceReady, "P5 upgrade governance ready");
  check(ready.states.catalogComplete, "states complete");
  check(ready.transitions.catalogComplete, "transitions complete");
  check(ready.supportPolicies.catalogComplete, "support policies complete");
  check(ready.managementReady, "management ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertLifecycleManagementPass(ready);

  console.log("✓ lifecycle management report");
  console.log(formatLifecycleManagementSummary(ready));
  console.log("\n✅ V70 P6 Lifecycle Management — verify PASS");
}

function main() {
  console.log("V70 P6 Lifecycle Management Verification\n");
  checkModuleStructure();
  testInventories();
  testStateFields();
  testLifecycleQueries();
  testReport();
}

main();
