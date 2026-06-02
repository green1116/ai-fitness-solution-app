/**
 * V4-A5-A2 Human-in-the-Loop Command Control — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import { buildAutonomousChangeManagementRuntime } from "../lib/operations/change";
import { buildAutonomousIncidentManagementRuntime } from "../lib/operations/incident";
import { buildAutonomousRecoveryOrchestrationRuntime } from "../lib/operations/recovery";
import { buildAutonomousOperationsCenterRuntime } from "../lib/operations/center";
import { buildAutonomousCommandRuntime } from "../lib/operations/command";
import {
  HUMAN_IN_THE_LOOP_COMMAND_VERSION,
  buildHumanInTheLoopCommandRuntime,
  buildCommandApprovalQueue,
  reviewCommand,
  approveCommand,
  rejectCommand,
  overrideCommand,
  suspendCommand,
  cancelCommand,
  escalateCommand,
  requestCommandRollback,
  confirmCommand,
  createEmptyReviewTrail,
} from "../lib/operations/command/hitl";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-command-hitl";
  const governance = buildOperationalGovernanceRuntime({ deploymentId });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId,
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const change = buildAutonomousChangeManagementRuntime({
    deploymentId,
    autonomous: governance.governanceAutonomous,
    execution,
  });

  const incident = buildAutonomousIncidentManagementRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    observability: governance.governanceFederationObservability,
    execution,
    change,
  });

  const recovery = buildAutonomousRecoveryOrchestrationRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
    execution,
    change,
    incident,
  });

  const operations = buildAutonomousOperationsCenterRuntime({
    deploymentId,
    execution,
    change,
    incident,
    recovery,
  });

  const command = buildAutonomousCommandRuntime({
    deploymentId,
    operations,
    execution,
    change,
    incident,
    recovery,
  });

  const runtime = buildHumanInTheLoopCommandRuntime({
    deploymentId,
    command,
    defaultReviewer: "verify-operator",
  });

  assert(runtime.version === HUMAN_IN_THE_LOOP_COMMAND_VERSION, "hitl version");
  assert(runtime.flags.queue, "queue flag");
  assert(runtime.flags.review, "review flag");
  assert(runtime.flags.audit, "audit flag");
  assert(runtime.reviewTrail.records.length > 0, "review trail");
  assert(runtime.bridgeEligibleIntentIds.length > 0, "bridge eligible intents");
  assert(runtime.queue.entries.length > 0, "approval queue");

  const queue = buildCommandApprovalQueue({ deploymentId, command });
  assert(queue.queueId.includes(deploymentId), "buildCommandApprovalQueue");

  const sampleIntent = command.intents[0]!;
  let trail = createEmptyReviewTrail(deploymentId);
  let reviewCase = reviewCommand({
    deploymentId,
    intent: sampleIntent,
    command,
    reviewer: "verify-operator",
  });
  assert(reviewCase.intentId === sampleIntent.intentId, "reviewCommand");

  const approved = approveCommand({ reviewCase, trail, operator: "verify-operator" });
  reviewCase = approved.reviewCase;
  trail = approved.trail;

  const rejected = rejectCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[1]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    reason: "test-reject",
  });
  trail = rejected.trail;

  const overrideResult = overrideCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[2]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    originalDecision: "pending",
    newDecision: "approved",
    reason: "test-override",
  });
  trail = overrideResult.trail;

  const suspended = suspendCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[3]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    reason: "test-suspend",
  });
  trail = suspended.trail;

  const cancelled = cancelCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[4]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    reason: "test-cancel",
  });
  trail = cancelled.trail;

  const escalated = escalateCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[5]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    fromLevel: 2,
    toLevel: 5,
    reason: "test-escalate",
  });
  trail = escalated.trail;

  const rollback = requestCommandRollback({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[6]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
    reason: "test-rollback",
  });
  trail = rollback.trail;

  const confirmed = confirmCommand({
    reviewCase: reviewCommand({ deploymentId, intent: command.intents[7]!, command, reviewer: "verify-operator" }),
    trail,
    operator: "verify-operator",
  });
  trail = confirmed.trail;

  assert(trail.records.length >= 7, "all hitl actions recorded");

  console.log("Human-in-the-Loop Command Control");
  console.log("PASS");
  console.log(`version=${runtime.version}`);
  console.log(`status=${runtime.status}`);
  console.log(`summary=${runtime.summary.text}`);
  console.log(`queue=${runtime.queue.entries.length}`);
  console.log(`pending=${runtime.queue.pendingCount}`);
  console.log(`approved=${runtime.queue.approvedCount}`);
  console.log(`rejected=${runtime.queue.rejectedCount}`);
  console.log(`reviewCases=${runtime.reviewCases.length}`);
  console.log(`overrides=${runtime.overrides.length}`);
  console.log(`cancellations=${runtime.cancellations.length}`);
  console.log(`suspensions=${runtime.suspensions.length}`);
  console.log(`escalations=${runtime.escalations.length}`);
  console.log(`rollbackRequests=${runtime.rollbackRequests.length}`);
  console.log(`bridgeEligible=${runtime.bridgeEligibleIntentIds.length}`);
  console.log(`blocked=${runtime.blockedIntentIds.length}`);
  console.log(`auditRecords=${runtime.reviewTrail.records.length}`);
}

main();
