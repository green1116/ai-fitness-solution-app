/**
 * V3.0 Tender Orchestration 冒烟验证
 */
import { runTenderOrchestration } from "../lib/tender/orchestration";
import {
  buildDecisionRoute,
  adjustRouteForReadiness,
} from "../lib/tender/orchestration/routing/buildDecisionRoute";
import { buildEscalation } from "../lib/tender/orchestration/escalation/buildEscalation";
import { buildFinalRuntimeOutcome } from "../lib/tender/orchestration/outcome/buildFinalRuntimeOutcome";
import type { RuntimeDecision } from "../lib/tender/runtime/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const sampleDecision: RuntimeDecision = {
  action: "warn",
  passed: true,
  status: "caution",
  title: "test",
  message: "test message",
  reasons: ["部分证据不足"],
  suggestedNextSteps: ["补证据"],
  sources: { evidence: "warn", gate: "allow" },
  meta: {
    workflowStepsCompleted: 8,
    workflowStepsFailed: 0,
    evidenceCoverageRatio: 0.65,
    scoreRatio: 0.72,
    unsupportedCount: 2,
    gateEvidenceWeakCount: 1,
    mandatoryUnsupportedCount: 0,
  },
};

async function testFullOrchestration() {
  const result = await runTenderOrchestration({
    rawText: `
      技术要求：跑步机最大速度 ≥ 20km/h，功率 ≥ 3HP
      资质要求：ISO9001 认证
      评分：技术参数完整性 30 分
    `,
    planId: "plan-test-001",
    options: { runCompliance: true, runSku: true },
  });

  assert(result.ok, "orchestration ok");
  if (!result.ok) return;

  assert(result.version === "3.0", "version 3.0");
  assert(result.phases.length === 6, "6 phases");
  assert(result.outcome.verdict != null, "verdict");
  assert(result.route.target != null, "route");
  assert(result.readiness.checklist.length >= 4, "checklist");
  assert(result.escalation.level != null, "escalation");
  assert(result.workflow.ok, "nested workflow");

  console.log("✓ full orchestration");
  console.log("  orchestrationId:", result.orchestrationId);
  console.log("  verdict:", result.outcome.verdict);
  console.log("  route:", result.route.target);
  console.log("  readiness:", result.readiness.score, result.readiness.grade);
  console.log("  escalation:", result.escalation.level);
  console.log(
    "  phases:",
    result.phases.map((p) => p.phaseId).join(" → "),
  );
}

function testDecisionRoutingAndOutcome() {
  const route = buildDecisionRoute({ decision: sampleDecision });
  assert(route.target === "review", "warn → review");

  const readiness = {
    ready: false,
    score: 55,
    grade: "D" as const,
    blockers: ["证据覆盖率过低"],
    warnings: [],
    checklist: [],
  };
  const adjusted = adjustRouteForReadiness(
    { ...route, target: "proceed", routeId: "x", label: "x", reason: "x", triggeredBy: "unified", priority: 1 },
    readiness,
  );
  assert(adjusted.target === "hold", "not ready → hold");

  const escalation = buildEscalation({
    decision: sampleDecision,
    route,
    readiness,
  });
  assert(escalation.level === "advisory", "warn escalation");

  const outcome = buildFinalRuntimeOutcome({
    decision: sampleDecision,
    route,
    escalation,
    readiness,
  });
  assert(
    ["submit", "conditional_submit", "defer", "abort"].includes(outcome.verdict),
    "valid verdict",
  );
  console.log("✓ routing + escalation + outcome unit");
}

async function main() {
  testDecisionRoutingAndOutcome();
  await testFullOrchestration();
  console.log("\nAll tender orchestration checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
