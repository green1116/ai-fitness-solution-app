/**
 * V67 P2 — Incident Lifecycle & State Machine Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CANONICAL_ESCALATION_PATH,
  CANONICAL_RESOLUTION_PATH,
  INCIDENT_STATE_CATALOG,
  TRANSITION_RULE_CATALOG,
  V67_INCIDENT_LIFECYCLE_ARTIFACT_SURFACE,
  V67_INCIDENT_LIFECYCLE_VERSION,
  applyLifecycleAction,
  assertIncidentLifecyclePass,
  buildIncidentLifecycleReport,
  buildIncidentStateManifest,
  buildTransitionRuleManifest,
  formatIncidentLifecycleSummary,
  getAllowedNextStates,
  isValidIncidentTransition,
  runIncidentLifecycle,
  simulateLifecyclePath,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p2-incident-lifecycle";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/incident/incident.ts",
    "lib/monitoring/v67/incident/lifecycle.types.ts",
    "lib/monitoring/v67/incident/lifecycle.surface.ts",
    "lib/monitoring/v67/incident/lifecycle.states.ts",
    "lib/monitoring/v67/incident/lifecycle.transitions.ts",
    "lib/monitoring/v67/incident/lifecycle.machine.ts",
    "lib/monitoring/v67/incident/lifecycle.builder.ts",
    "lib/monitoring/v67/incident/lifecycle.entry.ts",
    "docs/monitoring/V67-INCIDENT-LIFECYCLE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 incident lifecycle module structure");
}

function testInventories() {
  check(INCIDENT_STATE_CATALOG.length >= 7, "incident state catalog");
  check(TRANSITION_RULE_CATALOG.length >= 10, "transition rule catalog");
  console.log("✓ state & transition inventories");
}

function testStateMachine() {
  check(isValidIncidentTransition("open", "acknowledged"), "open -> acknowledged");
  check(isValidIncidentTransition("resolved", "postmortem"), "resolved -> postmortem");
  check(!isValidIncidentTransition("closed", "open"), "closed -> open blocked");

  const fromOpen = getAllowedNextStates("open");
  check(fromOpen.includes("acknowledged"), "open allows acknowledge");
  check(fromOpen.includes("escalated"), "open allows escalate");

  check(
    applyLifecycleAction({ current: "open", action: "acknowledge" }) === "acknowledged",
    "acknowledge action",
  );
  check(
    applyLifecycleAction({ current: "closed", action: "acknowledge" }) === null,
    "closed blocks acknowledge",
  );

  const resolution = simulateLifecyclePath(CANONICAL_RESOLUTION_PATH);
  check(resolution.valid, "canonical resolution path");
  check(resolution.path[resolution.path.length - 1] === "closed", "resolution ends closed");

  const escalation = simulateLifecyclePath(CANONICAL_ESCALATION_PATH);
  check(escalation.valid, "canonical escalation path");
  check(escalation.path.includes("escalated"), "escalation path includes escalated");

  console.log("✓ state machine transitions");
}

function testManifests() {
  const states = buildIncidentStateManifest();
  check(states.machineComplete, "state machine complete");

  const rules = buildTransitionRuleManifest();
  check(rules.rulesComplete, "transition rules complete");
  console.log("✓ state & transition manifests");
}

function testReport() {
  const incomplete = runIncidentLifecycle({
    deploymentId: DEPLOYMENT_ID,
    signals: { foundationReady: false },
  });
  check(!incomplete.lifecycleReady, "incomplete foundation not ready");

  const ready = buildIncidentLifecycleReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_INCIDENT_LIFECYCLE_VERSION, "lifecycle version");
  check(ready.foundationReady, "foundation ready");
  check(ready.stateMachine.machineComplete, "state machine complete");
  check(ready.transitionRules.rulesComplete, "rules complete");
  check(ready.sampleLifecycle.length >= 3, "sample lifecycle");
  check(ready.lifecycleReady, "lifecycle ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIncidentLifecyclePass(ready);

  check(
    V67_INCIDENT_LIFECYCLE_ARTIFACT_SURFACE.verifyLifecycle.includes("verify:v67-p2"),
    "artifact surface verify script",
  );

  console.log("✓ incident lifecycle report");
  console.log(formatIncidentLifecycleSummary(ready));
  console.log("\n✅ V67 P2 Incident Lifecycle & State Machine — verify PASS");
}

function main() {
  console.log("V67 P2 Incident Lifecycle & State Machine Verification\n");
  checkModuleStructure();
  testInventories();
  testStateMachine();
  testManifests();
  testReport();
}

main();
