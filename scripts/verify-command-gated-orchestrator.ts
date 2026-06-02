/**
 * V4-A5-A5 Gated Bridge Orchestrator — verification
 */
import { buildCommandPlatformStack } from "../lib/operations/command/api/stack";
import {
  GATED_BRIDGE_ORCHESTRATOR_VERSION,
  buildGatedBridgeOrchestrator,
  buildOrchestrationPlan,
  evaluateOrchestrationReadiness,
  orchestrateCommandFlow,
  orchestrateAdmittedIntents,
  orchestrateBridgeDispatch,
  auditOrchestration,
} from "../lib/operations/command/gated-orchestrator";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function verifyMode(deploymentId: string, mode: "dry-run" | "orchestration-only" | "live-ready" | "rollback-aware") {
  const runtime = buildGatedBridgeOrchestrator({ deploymentId: `${deploymentId}-${mode}`, mode });
  assert(runtime.orchestrator.mode === mode, `${mode} mode`);
  assert(runtime.flags.plan, `${mode} plan flag`);
  assert(runtime.flags.audit, `${mode} audit flag`);
  return runtime;
}

function main() {
  const deploymentId = "v4-verify-command-gated-orchestrator";
  const stack = buildCommandPlatformStack(deploymentId);

  const runtime = buildGatedBridgeOrchestrator({ deploymentId, stack, mode: "orchestration-only" });

  assert(runtime.version === GATED_BRIDGE_ORCHESTRATOR_VERSION, "orchestrator version");
  assert(runtime.orchestrator.platformVersion === "V4-A5-A5", "platform version");
  assert(runtime.orchestrator.plan.admittedIntentIds.length > 0, "admitted intents");
  assert(runtime.orchestrator.plan.blockedIntentIds.length > 0, "blocked intents");
  assert(runtime.orchestrator.decisions.length > 0, "decisions");
  assert(runtime.orchestrator.readinessProfiles.length === stack.command.intents.length, "readiness");
  assert(runtime.orchestrator.audit.length > 0, "audit");
  assert(runtime.flags.orchestration, "orchestration flag");

  const admitted = orchestrateAdmittedIntents({
    deploymentId,
    stack,
    mode: "orchestration-only",
  });
  assert(admitted.admittedIntentIds.length === stack.coordination.admittedIntentIds.length, "orchestrateAdmittedIntents");

  const dispatch = orchestrateBridgeDispatch({
    stack,
    admittedIntentIds: admitted.admittedIntentIds,
  });
  assert(dispatch.filteredPlans.length <= stack.bridge.plans.length, "filtered plans");
  assert(
    dispatch.filteredPlans.every((p) => admitted.admittedIntentIds.includes(p.intentId)),
    "only admitted plans",
  );

  const blockedIntent = stack.coordination.blockedIntentIds[0];
  if (blockedIntent) {
    assert(
      !dispatch.filteredPlans.some((p) => p.intentId === blockedIntent),
      "blocked intent excluded from bridge",
    );
  }

  const flow = orchestrateCommandFlow({ deploymentId, stack, mode: "orchestration-only" });
  assert(flow.plan.steps.length === stack.command.intents.length, "orchestrateCommandFlow");

  const readiness = evaluateOrchestrationReadiness({
    deploymentId,
    intentId: admitted.admittedIntentIds[0]!,
    stack,
    mode: "orchestration-only",
    admitted: true,
  });
  assert(readiness.admitted, "evaluateOrchestrationReadiness");

  const plan = buildOrchestrationPlan({
    deploymentId,
    stack,
    mode: "orchestration-only",
    admittedIntentIds: admitted.admittedIntentIds,
    blockedIntentIds: admitted.blockedIntentIds,
    readinessByIntent: new Map(admitted.readinessProfiles.map((p) => [p.intentId, p.liveReady])),
    dispatchedIntentIds: dispatch.dispatchedIntentIds,
  });
  assert(plan.planId.includes(deploymentId), "buildOrchestrationPlan");

  const audit = auditOrchestration({
    deploymentId,
    plan,
    readinessProfiles: admitted.readinessProfiles,
    dispatch,
    gateState: stack.coordination.gate.state,
  });
  assert(audit.length > 0, "auditOrchestration");

  verifyMode(deploymentId, "dry-run");
  verifyMode(deploymentId, "live-ready");
  verifyMode(deploymentId, "rollback-aware");

  console.log("Gated Bridge Orchestrator");
  console.log("PASS");
  console.log(`version=${runtime.version}`);
  console.log(`status=${runtime.status}`);
  console.log(`mode=${runtime.orchestrator.mode}`);
  console.log(`summary=${runtime.summary.text}`);
  console.log(`gateState=${runtime.orchestrator.gate.state}`);
  console.log(`admitted=${runtime.orchestrator.plan.admittedIntentIds.length}`);
  console.log(`blocked=${runtime.orchestrator.plan.blockedIntentIds.length}`);
  console.log(`dispatched=${runtime.orchestrator.result.dispatchedCount}`);
  console.log(`ready=${runtime.orchestrator.result.readyCount}`);
  console.log(`filteredPlans=${runtime.orchestrator.bridge.filteredPlans}`);
  console.log(`filteredDispatches=${runtime.orchestrator.bridge.filteredDispatches}`);
  console.log(`auditRecords=${runtime.orchestrator.audit.length}`);
  console.log(`rollback=${runtime.flags.rollback}`);
}

main();
