/**
 * V2.9 Tender Runtime Workflow 冒烟验证
 */
import { runTenderRuntimeWorkflow } from "../lib/tender/runtime/workflow";
import { buildTenderRuntimeDecision } from "../lib/tender/runtime/decision";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testWorkflowExecution() {
  const result = await runTenderRuntimeWorkflow({
    rawText: `
      招标文件技术要求：
      1. 跑步机最大速度不低于 20km/h，额定功率 ≥ 3HP
      2. 投标人须具备 ISO9001 质量管理体系认证
      评分标准：技术参数响应完整性占 30 分
    `,
    sourceName: "test-tender.txt",
    options: { runCompliance: true, runSku: true },
  });

  assert(result.ok, "workflow ok");
  if (!result.ok) return;

  assert(result.steps.length >= 6, "steps executed");
  assert(result.decision.action != null, "decision action");
  assert(result.recommendations.length >= 0, "recommendations");
  assert(result.scoringImpact.narrative.length > 0, "scoring impact");
  assert(result.evidence != null, "evidence runtime");
  assert(result.query != null, "query");

  const completed = result.steps.filter((s) => s.status === "completed");
  console.log("✓ workflow execution");
  console.log("  workflowId:", result.workflowId);
  console.log("  status:", result.status);
  console.log("  decision:", result.decision.action);
  console.log("  steps completed:", completed.map((s) => s.stepId).join(" → "));
  console.log("  recommendations:", result.recommendations.length);
}

function testUnifiedDecisionMerge() {
  const decision = buildTenderRuntimeDecision({
    evidenceDecision: {
      action: "warn",
      passed: true,
      title: "evidence warn",
      message: "",
      reasons: ["部分证据不足"],
      suggestedNextSteps: ["补证据"],
      meta: {
        totalRequirements: 10,
        fullyEvidencedCount: 6,
        partiallyEvidencedCount: 2,
        unsupportedCount: 2,
        riskyCount: 0,
        mandatoryUnsupportedCount: 0,
        documentsCount: 5,
        linksCount: 8,
        coverageRatio: 0.6,
      },
    },
    gate: {
      action: "block",
      passed: false,
      decisionLevel: "hold",
      decisionLabel: "暂缓投",
      title: "gate block",
      message: "",
      reasons: ["高风险过多"],
      suggestedNextSteps: ["降风险"],
      meta: {
        highRiskCount: 5,
        missingAttachmentCount: 0,
        evidenceWeakCount: 0,
        severeWeaknessCount: 0,
        scoreRatio: 0.5,
      },
    },
    steps: [],
  });

  assert(decision.action === "block", "block wins over warn");
  assert(decision.sources.evidence === "warn", "sources preserved");
  assert(decision.sources.gate === "block", "gate source");
  console.log("✓ unified decision merge (block > warn)");
}

async function main() {
  await testWorkflowExecution();
  testUnifiedDecisionMerge();
  console.log("\nAll tender runtime workflow checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
