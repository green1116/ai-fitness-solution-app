/**
 * V73 P6 — Knowledge Lifecycle Management Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeLifecyclePass,
  buildKnowledgeLifecycle,
  computeDeclarativeLifecycleTerminal,
  formatKnowledgeLifecycleSummary,
  getLifecycleStateById,
  getLifecycleStateByKnowledgeRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByKnowledgeRef,
  isKnowledgeLifecycleRefsAligned,
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  runKnowledgeLifecycle,
  SUPPORT_POLICY_CATALOG,
  V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  V73_KNOWLEDGE_LIFECYCLE_VERSION,
} from "../lib/knowledge/v73/lifecycle.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p6-knowledge-lifecycle";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/lifecycle.management.ts",
    "lib/knowledge/v73/lifecycle.states.ts",
    "lib/knowledge/v73/lifecycle.builder.ts",
    "lib/knowledge/v73/lifecycle.entry.ts",
    "docs/V73-P6-KNOWLEDGE-LIFECYCLE-MANAGEMENT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge lifecycle module structure");
}

function testInventories() {
  check(LIFECYCLE_STATE_CATALOG.length >= 6, "lifecycle state catalog");
  check(LIFECYCLE_TRANSITION_CATALOG.length >= 6, "lifecycle transition catalog");
  check(SUPPORT_POLICY_CATALOG.length >= 6, "support policy catalog");
  check(isKnowledgeLifecycleRefsAligned(), "knowledge lifecycle refs aligned");
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

  const archived = getLifecycleStateByKnowledgeRef("KNW-008");
  check(archived?.archived === true, "KNW-008 archived");
  check(archived?.active === false, "KNW-008 not active");

  const state = getLifecycleStateById("KNW-LCS-007");
  check(state?.deprecated === true, "KNW-LCS-007 deprecated");

  const transitions = getTransitionsByKnowledgeRef("KNW-001");
  check(transitions.length >= 2, "KNW-001 transitions");

  const policy = getSupportPolicyById("KNW-LCS-SUP-001");
  check(policy?.policyKind === "lts-document", "KNW-LCS-SUP-001 policy kind");

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
  const incomplete = runKnowledgeLifecycle({
    deploymentId: DEPLOYMENT_ID,
    signals: { knowledgeGovernanceReady: false },
  });
  check(!incomplete.lifecycleReady, "incomplete governance not ready");

  const ready = buildKnowledgeLifecycle({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_LIFECYCLE_VERSION, "lifecycle version");
  check(ready.freezeVersion === V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION, "freeze version");
  check(ready.knowledgeGovernanceReady, "P5 knowledge governance ready");
  check(ready.states.catalogComplete, "states complete");
  check(ready.transitions.catalogComplete, "transitions complete");
  check(ready.supportPolicies.catalogComplete, "support policies complete");
  check(ready.lifecycleReady, "lifecycle ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgeLifecyclePass(ready);

  console.log("✓ knowledge lifecycle report");
  console.log(formatKnowledgeLifecycleSummary(ready));
  console.log("\n✅ V73 P6 Knowledge Lifecycle Management — verify PASS");
}

function main() {
  console.log("V73 P6 Knowledge Lifecycle Management Verification\n");
  checkModuleStructure();
  testInventories();
  testStateFields();
  testLifecycleQueries();
  testReport();
}

main();
