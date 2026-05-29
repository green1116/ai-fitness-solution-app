/**
 * V4-A5-A4 Command Platform API — verification
 */
import { COMMAND_PLATFORM_API_VERSION, type CommandApiEnvelope } from "../lib/operations/command/api/types";
import {
  buildCommandApiHealth,
  buildCommandPlatformStack,
  getCommandAudit,
  getCommandQueue,
  getCommandSnapshot,
  getCommandSummary,
  postCommandAdmission,
  postCommandControl,
  postCommandDispatch,
  postCommandReview,
} from "../lib/operations/command/api/handlers";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertEnvelope(envelope: CommandApiEnvelope<unknown>, label: string) {
  assert(envelope.version === COMMAND_PLATFORM_API_VERSION, `${label} version`);
  assert(typeof envelope.platformStatus === "string", `${label} platformStatus`);
  assert(envelope.counts.commands > 0, `${label} command counts`);
  assert(envelope.counts.audit.total > 0, `${label} audit totals`);
  assert(Array.isArray(envelope.blockedSummary.intentIds), `${label} blocked summary`);
  assert(Array.isArray(envelope.admittedSummary.intentIds), `${label} admitted summary`);
  assert(Array.isArray(envelope.pendingSummary.intentIds), `${label} pending summary`);
}

function main() {
  const deploymentId = "v4-verify-command-api";
  const stack = buildCommandPlatformStack(deploymentId);

  const health = buildCommandApiHealth(stack);
  assertEnvelope(health, "health");

  const snapshot = getCommandSnapshot(deploymentId);
  assertEnvelope(snapshot, "snapshot");
  assert(snapshot.data.snapshot.intentCount > 0, "snapshot data");

  const summary = getCommandSummary(deploymentId);
  assertEnvelope(summary, "summary");

  const queue = getCommandQueue(deploymentId);
  assertEnvelope(queue, "queue");
  assert(queue.data.queue.entries.length >= 0, "queue data");

  const audit = getCommandAudit(deploymentId);
  assertEnvelope(audit, "audit");

  const dispatch = postCommandDispatch({ deploymentId, dryRun: true });
  assertEnvelope(dispatch, "dispatch");
  assert(dispatch.data.orchestrationOnly === true, "dispatch orchestration only");
  assert(dispatch.counts.bridgeReadiness.ready >= 0, "bridge readiness counts");

  const admissionAll = postCommandAdmission({ deploymentId });
  assertEnvelope(admissionAll, "admission-all");

  const intentId = stack.command.intents[0]!.intentId;
  const admissionOne = postCommandAdmission({ deploymentId, intentId });
  assertEnvelope(admissionOne, "admission-one");

  const review = postCommandReview({
    deploymentId,
    intentId,
    action: "approve",
    operator: "verify-operator",
    reason: "verify-approve",
  });
  assertEnvelope(review, "review");
  assert(review.data.ok === true, "review ok");

  const control = postCommandControl({
    deploymentId,
    intentId: stack.command.intents[1]!.intentId,
    action: "suspend",
    operator: "verify-operator",
    reason: "verify-suspend",
  });
  assertEnvelope(control, "control");

  console.log("Command Platform API");
  console.log("PASS");
  console.log(`version=${health.version}`);
  console.log(`platformStatus=${summary.platformStatus}`);
  console.log(`commands=${summary.counts.commands}`);
  console.log(`approvalsPending=${summary.counts.approvals.pending}`);
  console.log(`admitted=${summary.counts.admission.admitted}`);
  console.log(`blocked=${summary.counts.admission.blocked}`);
  console.log(`bridgeReady=${summary.counts.bridgeReadiness.ready}`);
  console.log(`auditTotal=${summary.counts.audit.total}`);
  console.log(`gateState=${snapshot.data.gate.state}`);
}

main();
