/**
 * E04-P4 — Business Decision Runtime verification
 * Decision layer above E04 Process Orchestration
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildBusinessAgentFoundation } from "../lib/business-agent/e04/core/business-agent.lifecycle";
import {
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "../lib/business-agent/e04/core/business-agent.constants";
import { buildWorkflowRegistryManifest } from "../lib/business-agent/e04/workflow/workflow.registry";
import {
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
} from "../lib/business-agent/e04/workflow/workflow.constants";
import { buildProcessRegistryManifest } from "../lib/business-agent/e04/process/process.registry";
import {
  E04_PROCESS_ORCHESTRATION_ID,
  E04_PROCESS_VERSION,
} from "../lib/business-agent/e04/process/process.constants";
import {
  E04_DECISION_BASE,
  E04_DECISION_RUNTIME_ID,
  E04_DECISION_VERSION,
  DECISION_OUTCOMES,
} from "../lib/business-agent/e04/decision/decision.constants";
import {
  evaluateCondition,
  evaluatePolicyRule,
  selectOutcomeFromPolicies,
} from "../lib/business-agent/e04/decision/decision.policy";
import {
  DECISION_CATALOG,
  DECISION_POLICY_CATALOG,
  buildDecisionRegistryManifest,
  getDecisionById,
  getPolicyById,
  listPoliciesForDecision,
  listRequiredDecisions,
} from "../lib/business-agent/e04/decision/decision.registry";
import {
  appendDecisionTraceEvent,
  createDecisionRuntimeTrace,
} from "../lib/business-agent/e04/decision/decision.trace";
import {
  evaluateDecision,
  executeDecisionOrThrow,
} from "../lib/business-agent/e04/decision/decision.engine";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E04_P1 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/capability/capability.types.ts",
  "lib/business-agent/e04/capability/capability.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.context.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
] as const;

const FROZEN_E04_P2 = [
  "lib/business-agent/e04/workflow/workflow.types.ts",
  "lib/business-agent/e04/workflow/workflow.constants.ts",
  "lib/business-agent/e04/workflow/workflow.registry.ts",
  "lib/business-agent/e04/workflow/workflow.lifecycle.ts",
  "lib/business-agent/e04/workflow/workflow.executor.ts",
  "lib/business-agent/e04/workflow/workflow.trace.ts",
] as const;

const FROZEN_E04_P3 = [
  "lib/business-agent/e04/process/process.types.ts",
  "lib/business-agent/e04/process/process.constants.ts",
  "lib/business-agent/e04/process/process.registry.ts",
  "lib/business-agent/e04/process/process.lifecycle.ts",
  "lib/business-agent/e04/process/process.executor.ts",
  "lib/business-agent/e04/process/process.graph.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
  "lib/agent-platform/e03/runtime/agent.context.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/business-agent/e04/decision/decision.types.ts",
    "lib/business-agent/e04/decision/decision.constants.ts",
    "lib/business-agent/e04/decision/decision.registry.ts",
    "lib/business-agent/e04/decision/decision.policy.ts",
    "lib/business-agent/e04/decision/decision.engine.ts",
    "lib/business-agent/e04/decision/decision.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildBusinessAgentFoundation();
  check(foundation.ready === true, "E04 P1 ready");
  check(foundation.platformId === E04_BUSINESS_AGENT_PLATFORM_ID, "P1 id");
  check(foundation.version === E04_BUSINESS_AGENT_VERSION, "P1 version");

  const workflows = buildWorkflowRegistryManifest();
  check(workflows.catalogComplete === true, "P2 ready");
  check(workflows.runtimeId === E04_WORKFLOW_RUNTIME_ID, "P2 id");
  check(workflows.version === E04_WORKFLOW_VERSION, "P2 version");

  const processes = buildProcessRegistryManifest();
  check(processes.catalogComplete === true, "P3 ready");
  check(processes.orchestrationId === E04_PROCESS_ORCHESTRATION_ID, "P3 id");
  check(processes.version === E04_PROCESS_VERSION, "P3 version");

  check(
    E04_DECISION_BASE ===
      "enterprise-e04-p3-business-process-orchestration-v1",
    "decision base",
  );
  console.log("✓ E03 + E04 P1/P2/P3 unmodified / bases intact");
}

function testRegistryAndPolicy() {
  check(DECISION_OUTCOMES.length === 4, "outcomes");
  check(DECISION_CATALOG.length === 2, "decisions");
  check(DECISION_POLICY_CATALOG.length === 5, "policies");

  const manifest = buildDecisionRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E04_DECISION_RUNTIME_ID, "runtime id");
  check(manifest.version === E04_DECISION_VERSION, "version");
  check(manifest.base === E04_DECISION_BASE, "base");
  check(listRequiredDecisions().length === 1, "required");

  check(
    evaluateCondition(
      { field: "riskScore", op: "gte", value: 80, readOnly: true },
      { riskScore: 90 },
    ),
    "gte match",
  );

  const block = getPolicyById("e04.policy.compliance-block");
  check(Boolean(block), "compliance policy");
  const blocked = evaluatePolicyRule(block!, { compliancePass: false });
  check(blocked.matched === true, "block matched");
  check(blocked.outcome === "reject", "block reject");

  const tender = getDecisionById("e04.decision.tender-gate");
  check(Boolean(tender), "tender gate");
  const policies = listPoliciesForDecision(tender!);
  const selected = selectOutcomeFromPolicies(
    policies,
    { compliancePass: true, budgetOk: true, riskScore: 40 },
    tender!.defaultOutcome,
  );
  check(selected.outcome === "approve", "ready approve");

  console.log("✓ registry + policy");
}

function testTraceAndEngine() {
  const trace = createDecisionRuntimeTrace({
    executionId: "exec_x",
    decisionId: "e04.decision.tender-gate",
    taskId: "task_x",
  });
  const withEvent = appendDecisionTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const tender = getDecisionById("e04.decision.tender-gate");
  check(Boolean(tender), "tender present");

  const rejected = evaluateDecision(tender!, { compliancePass: false });
  check(rejected.outcome === "reject", "reject outcome");

  const deferred = evaluateDecision(tender!, {
    compliancePass: true,
    budgetOk: false,
    riskScore: 20,
  });
  check(deferred.outcome === "defer", "defer outcome");

  const approved = executeDecisionOrThrow(tender!, {
    facts: { compliancePass: true, budgetOk: true, riskScore: 35 },
    input: {
      goal: "星河科技园健身中心招采响应",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e04-p4" },
  });
  check(approved.result.success === true, "approve success");
  check(approved.result.outcome === "approve", "approve outcome");
  check(Boolean(approved.result.processInstanceId), "process ran");
  check(
    approved.result.processOutput?.processId ===
      "e04.process.enterprise-response",
    "process output",
  );
  check(approved.trace.eventCount >= 4, "trace events");
  check(approved.result.traceId === approved.trace.traceId, "trace linked");

  const escalated = executeDecisionOrThrow(tender!, {
    facts: { compliancePass: true, budgetOk: true, riskScore: 85 },
    input: { goal: "高风险升级响应" },
  });
  check(escalated.result.outcome === "escalate", "escalate");
  check(Boolean(escalated.result.processInstanceId), "escalate process");

  const deferredRun = executeDecisionOrThrow(tender!, {
    facts: { compliancePass: true, budgetOk: false, riskScore: 10 },
    input: { goal: "预算未齐" },
  });
  check(deferredRun.result.outcome === "defer", "defer no process");
  check(!deferredRun.result.processInstanceId, "process skipped");

  const intake = getDecisionById("e04.decision.intake-gate");
  check(Boolean(intake), "intake gate");
  const intakeRun = executeDecisionOrThrow(intake!, {
    facts: { hasBrief: true },
    input: { goal: "intake probe" },
  });
  check(intakeRun.result.outcome === "approve", "intake approve");
  check(Boolean(intakeRun.result.processInstanceId), "intake process");

  console.log("✓ decision engine → process/workflow bridge");
}

function main() {
  console.log("E04-P4 — Business Decision Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E04_P1,
    ...FROZEN_E04_P2,
    ...FROZEN_E04_P3,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndPolicy();
  testTraceAndEngine();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P4 business decision runtime");
}

main();
