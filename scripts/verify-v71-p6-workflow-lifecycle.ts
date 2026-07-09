/**
 * V71 P6 — Workflow Lifecycle Management Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowLifecyclePass,
  buildWorkflowLifecycle,
  computeDeclarativeLifecycleTerminal,
  formatWorkflowLifecycleSummary,
  getLifecycleStateById,
  getLifecycleStateByOrchestrationRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByOrchestrationRef,
  isWorkflowLifecycleRefsAligned,
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  runWorkflowLifecycle,
  SUPPORT_POLICY_CATALOG,
  V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION,
  V71_WORKFLOW_LIFECYCLE_VERSION,
} from "../lib/orchestration/v71/lifecycle.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p6-workflow-lifecycle";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/lifecycle.management.ts",
    "lib/orchestration/v71/lifecycle.states.ts",
    "lib/orchestration/v71/lifecycle.builder.ts",
    "lib/orchestration/v71/lifecycle.entry.ts",
    "docs/V71-P6-WORKFLOW-LIFECYCLE-MANAGEMENT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow lifecycle module structure");
}

function testInventories() {
  check(LIFECYCLE_STATE_CATALOG.length >= 6, "lifecycle state catalog");
  check(LIFECYCLE_TRANSITION_CATALOG.length >= 6, "lifecycle transition catalog");
  check(SUPPORT_POLICY_CATALOG.length >= 6, "support policy catalog");
  check(isWorkflowLifecycleRefsAligned(), "workflow lifecycle refs aligned");
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

  const archived = getLifecycleStateByOrchestrationRef("ORC-008");
  check(archived?.archived === true, "ORC-008 archived");
  check(archived?.active === false, "ORC-008 not active");

  const state = getLifecycleStateById("ORC-LCS-007");
  check(state?.deprecated === true, "ORC-LCS-007 deprecated");

  const transitions = getTransitionsByOrchestrationRef("ORC-001");
  check(transitions.length >= 2, "ORC-001 transitions");

  const policy = getSupportPolicyById("ORC-LCS-SUP-001");
  check(policy?.policyKind === "lts-orchestration", "ORC-LCS-SUP-001 policy kind");

  check(
    computeDeclarativeLifecycleTerminal({ archived: true, endOfLife: "2025-06-01" }),
    "terminal archived lifecycle",
  );
  check(
    !computeDeclarativeLifecycleTerminal({ archived: false, endOfLife: "n/a" }),
    "non-terminal active lifecycle",
  );

  console.log("✓ lifecycle queries");
}

function testReport() {
  const incomplete = runWorkflowLifecycle({
    deploymentId: DEPLOYMENT_ID,
    signals: { workflowGovernanceReady: false },
  });
  check(!incomplete.lifecycleReady, "incomplete governance not ready");

  const ready = buildWorkflowLifecycle({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_WORKFLOW_LIFECYCLE_VERSION, "lifecycle version");
  check(ready.freezeVersion === V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION, "freeze version");
  check(ready.workflowGovernanceReady, "P5 workflow governance ready");
  check(ready.states.catalogComplete, "states complete");
  check(ready.transitions.catalogComplete, "transitions complete");
  check(ready.supportPolicies.catalogComplete, "support policies complete");
  check(ready.lifecycleReady, "lifecycle ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertWorkflowLifecyclePass(ready);

  console.log("✓ workflow lifecycle report");
  console.log(formatWorkflowLifecycleSummary(ready));
  console.log("\n✅ V71 P6 Workflow Lifecycle Management — verify PASS");
}

function main() {
  console.log("V71 P6 Workflow Lifecycle Management Verification\n");
  checkModuleStructure();
  testInventories();
  testStateFields();
  testLifecycleQueries();
  testReport();
}

main();
