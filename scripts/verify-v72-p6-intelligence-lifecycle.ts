/**
 * V72 P6 — Intelligence Lifecycle Management Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceLifecyclePass,
  buildIntelligenceLifecycle,
  computeDeclarativeLifecycleTerminal,
  formatIntelligenceLifecycleSummary,
  getLifecycleStateById,
  getLifecycleStateByIntelligenceRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByIntelligenceRef,
  isIntelligenceLifecycleRefsAligned,
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  runIntelligenceLifecycle,
  SUPPORT_POLICY_CATALOG,
  V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  V72_INTELLIGENCE_LIFECYCLE_VERSION,
} from "../lib/intelligence/v72/lifecycle.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p6-intelligence-lifecycle";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/lifecycle.management.ts",
    "lib/intelligence/v72/lifecycle.states.ts",
    "lib/intelligence/v72/lifecycle.builder.ts",
    "lib/intelligence/v72/lifecycle.entry.ts",
    "docs/V72-P6-INTELLIGENCE-LIFECYCLE-MANAGEMENT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence lifecycle module structure");
}

function testInventories() {
  check(LIFECYCLE_STATE_CATALOG.length >= 6, "lifecycle state catalog");
  check(LIFECYCLE_TRANSITION_CATALOG.length >= 6, "lifecycle transition catalog");
  check(SUPPORT_POLICY_CATALOG.length >= 6, "support policy catalog");
  check(isIntelligenceLifecycleRefsAligned(), "intelligence lifecycle refs aligned");
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

  const archived = getLifecycleStateByIntelligenceRef("INT-008");
  check(archived?.archived === true, "INT-008 archived");
  check(archived?.active === false, "INT-008 not active");

  const state = getLifecycleStateById("INT-LCS-007");
  check(state?.deprecated === true, "INT-LCS-007 deprecated");

  const transitions = getTransitionsByIntelligenceRef("INT-001");
  check(transitions.length >= 2, "INT-001 transitions");

  const policy = getSupportPolicyById("INT-LCS-SUP-001");
  check(policy?.policyKind === "lts-insight", "INT-LCS-SUP-001 policy kind");

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
  const incomplete = runIntelligenceLifecycle({
    deploymentId: DEPLOYMENT_ID,
    signals: { intelligenceGovernanceReady: false },
  });
  check(!incomplete.lifecycleReady, "incomplete governance not ready");

  const ready = buildIntelligenceLifecycle({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_LIFECYCLE_VERSION, "lifecycle version");
  check(ready.freezeVersion === V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION, "freeze version");
  check(ready.intelligenceGovernanceReady, "P5 intelligence governance ready");
  check(ready.states.catalogComplete, "states complete");
  check(ready.transitions.catalogComplete, "transitions complete");
  check(ready.supportPolicies.catalogComplete, "support policies complete");
  check(ready.lifecycleReady, "lifecycle ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligenceLifecyclePass(ready);

  console.log("✓ intelligence lifecycle report");
  console.log(formatIntelligenceLifecycleSummary(ready));
  console.log("\n✅ V72 P6 Intelligence Lifecycle Management — verify PASS");
}

function main() {
  console.log("V72 P6 Intelligence Lifecycle Management Verification\n");
  checkModuleStructure();
  testInventories();
  testStateFields();
  testLifecycleQueries();
  testReport();
}

main();
