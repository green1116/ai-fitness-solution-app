/**
 * E01-P3 — Tender Intelligence verification
 * RequirementIndex → TenderAnalysis → OpportunityProfile lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runTenderIntakeKernelOrThrow } from "../lib/tender-intelligence/v101/intake";
import { runUnderstandingKernelOrThrow } from "../lib/tender-intelligence/v101/understanding";
import {
  assertIntelligenceKernelPass,
  buildIntelligenceKernel,
  buildOpportunityProfile,
  buildTenderAnalysis,
  FIT_SCORE_BANDS,
  formatIntelligenceKernelSummary,
  INTELLIGENCE_LIFECYCLE_STAGES,
  OPPORTUNITY_TIERS,
  runIntelligenceKernel,
  runIntelligenceKernelOrThrow,
  validateOpportunityProfile,
  validateRequirementIndexInput,
  validateTenderAnalysis,
  V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
  V101_TENDER_INTELLIGENCE_VERSION,
} from "../lib/tender-intelligence/v101/intelligence";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p3-intelligence";

const SAMPLE_TENDER = `
项目名称：星河科技园企业健身中心建设项目
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区

一、项目目标
建设面积约 1200 平方米的企业健身中心，服务园区 200 名员工。

二、技术标准与功能需求
1. 有氧区配置跑步机不少于 8 台，力量区器械满足国标要求。
2. 场地面积不小于 1000 ㎡，净高不低于 3.2m。
3. 设备需符合 GB/T 22517 相关标准，提供 2 年质保。

三、商务与预算
项目预算限价 280 万元，投标截止 2026-08-01。

四、评标办法
技术标 60 分，商务标 40 分。

五、交付成果
提交方案书、设备清单、预算书及施工组织方案。
`.trim();

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-intelligence/v101/intelligence/intelligence.types.ts",
    "lib/tender-intelligence/v101/intelligence/intelligence.schema.ts",
    "lib/tender-intelligence/v101/intelligence/intelligence.builder.ts",
    "lib/tender-intelligence/v101/intelligence/intelligence.entry.ts",
    "lib/tender-intelligence/v101/intelligence/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(INTELLIGENCE_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(OPPORTUNITY_TIERS.length === 4, "opportunity tiers");
  check(FIT_SCORE_BANDS.length === 4, "fit bands");

  const badIndex = validateRequirementIndexInput({ id: "x" });
  check(!badIndex.ok, "incomplete requirement index rejected");

  console.log("✓ schema guards");
}

function testAnalysisAndOpportunity() {
  const intake = runTenderIntakeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream-intake`,
    projectHint: "星河科技园企业健身中心",
    source: { kind: "paste", rawText: SAMPLE_TENDER },
  });

  const understanding = runUnderstandingKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream-understanding`,
    workspace: intake.workspace,
    rawText: SAMPLE_TENDER,
  });

  const requirementIndex = understanding.requirementIndex;
  check(validateRequirementIndexInput(requirementIndex).ok, "requirement index valid");

  const analysis = buildTenderAnalysis({ requirementIndex });
  check(analysis.requirementIndexId === requirementIndex.id, "analysis links index");
  check(analysis.signalCount >= 1, "signals");
  check(analysis.riskCount >= 1, "risks");
  check(analysis.mustCoverage >= 0 && analysis.mustCoverage <= 1, "mustCoverage");
  check(validateTenderAnalysis(analysis).ok, "analysis schema");

  const opportunity = buildOpportunityProfile({
    requirementIndex,
    analysis,
    estimatedValueHint: 2_800_000,
  });
  check(opportunity.analysisId === analysis.id, "opportunity links analysis");
  check(opportunity.fitScore >= 0 && opportunity.fitScore <= 100, "fitScore");
  check(opportunity.winProbability >= 0 && opportunity.winProbability <= 1, "winProbability");
  check(opportunity.strengths.length >= 1, "strengths");
  check(opportunity.gaps.length >= 1, "gaps");
  check(opportunity.recommendedActions.length >= 1, "actions");
  check(validateOpportunityProfile(opportunity).ok, "opportunity schema");

  console.log("✓ requirements → analysis → opportunity");
}

function testKernel() {
  const intake = runTenderIntakeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-kernel-intake`,
    projectHint: "星河科技园企业健身中心",
    source: { kind: "paste", rawText: SAMPLE_TENDER },
  });

  const understanding = runUnderstandingKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-kernel-understanding`,
    workspace: intake.workspace,
    rawText: SAMPLE_TENDER,
  });

  const result = runIntelligenceKernel({
    deploymentId: DEPLOYMENT_ID,
    requirementIndex: understanding.requirementIndex,
    estimatedValueHint: 2_800_000,
  });

  check(result.version === V101_TENDER_INTELLIGENCE_VERSION, "version");
  check(result.freezeVersion === V101_TENDER_INTELLIGENCE_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "opportunity", "lifecycle at opportunity");
  check(result.lifecycle.transitions.length >= 2, "transitions");
  check(result.analysis !== null, "analysis present");
  check(result.opportunity !== null, "opportunity present");
  check(result.opportunity!.estimatedValueHint === 2_800_000, "value hint");

  assertIntelligenceKernelPass(result);

  const forced = runIntelligenceKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    requirementIndex: understanding.requirementIndex,
  });
  check(forced.ready === true, "orThrow ready");

  const fromBuilder = buildIntelligenceKernel({
    deploymentId: `${DEPLOYMENT_ID}-builder`,
    requirementIndex: understanding.requirementIndex,
  });
  check(fromBuilder.opportunity?.tier !== undefined, "builder tier");

  console.log("✓ intelligence kernel");
  console.log(formatIntelligenceKernelSummary(result));
}

function main() {
  console.log("E01-P3 — Tender Intelligence Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testAnalysisAndOpportunity();
  testKernel();
  console.log("\nPASS — V101 P3 intelligence (RequirementIndex → Analysis → Opportunity)");
}

main();
