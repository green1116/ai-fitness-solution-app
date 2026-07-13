/**
 * E01-P4 — AI Bid Strategy verification
 * OpportunityProfile → BidStrategy lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runTenderIntakeKernelOrThrow } from "../lib/tender-intelligence/v101/intake";
import { runUnderstandingKernelOrThrow } from "../lib/tender-intelligence/v101/understanding";
import { runIntelligenceKernelOrThrow } from "../lib/tender-intelligence/v101/intelligence";
import {
  assertStrategyKernelPass,
  BID_POSTURES,
  buildBidStrategy,
  buildStrategyKernel,
  formatStrategyKernelSummary,
  PRICING_STANCES,
  PROPOSAL_EMPHASES,
  runStrategyKernel,
  runStrategyKernelOrThrow,
  STRATEGY_LIFECYCLE_STAGES,
  validateBidStrategy,
  validateOpportunityProfileInput,
  V101_BID_STRATEGY_FREEZE_VERSION,
  V101_BID_STRATEGY_VERSION,
} from "../lib/tender-intelligence/v101/strategy";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p4-strategy";

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
    "lib/tender-intelligence/v101/strategy/strategy.types.ts",
    "lib/tender-intelligence/v101/strategy/strategy.schema.ts",
    "lib/tender-intelligence/v101/strategy/strategy.builder.ts",
    "lib/tender-intelligence/v101/strategy/strategy.entry.ts",
    "lib/tender-intelligence/v101/strategy/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(STRATEGY_LIFECYCLE_STAGES.length === 2, "lifecycle stages");
  check(BID_POSTURES.length === 4, "bid postures");
  check(PRICING_STANCES.length === 4, "pricing stances");
  check(PROPOSAL_EMPHASES.length === 5, "proposal emphases");

  const badOpportunity = validateOpportunityProfileInput({ id: "x" });
  check(!badOpportunity.ok, "incomplete opportunity rejected");

  console.log("✓ schema guards");
}

function testStrategyBuild() {
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

  const intelligence = runIntelligenceKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream-intelligence`,
    requirementIndex: understanding.requirementIndex,
    estimatedValueHint: 2_800_000,
  });

  const opportunity = intelligence.opportunity;
  check(validateOpportunityProfileInput(opportunity).ok, "opportunity valid");

  const strategy = buildBidStrategy({
    opportunity,
    preferredEmphasis: ["compliance", "commercial"],
  });
  check(strategy.opportunityId === opportunity.id, "strategy links opportunity");
  check(strategy.emphasis.includes("compliance"), "preferred emphasis applied");
  check(strategy.workstreams.length >= 2, "workstreams");
  check(strategy.riskBuffers.length >= 1, "risk buffers");
  check(strategy.goNoGoScore >= 0 && strategy.goNoGoScore <= 100, "goNoGoScore");
  check(strategy.confidence >= 0 && strategy.confidence <= 1, "confidence");
  check(validateBidStrategy(strategy).ok, "strategy schema");

  console.log("✓ opportunity → bid strategy");
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

  const intelligence = runIntelligenceKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-kernel-intelligence`,
    requirementIndex: understanding.requirementIndex,
    estimatedValueHint: 2_800_000,
  });

  const result = runStrategyKernel({
    deploymentId: DEPLOYMENT_ID,
    opportunity: intelligence.opportunity,
  });

  check(result.version === V101_BID_STRATEGY_VERSION, "version");
  check(result.freezeVersion === V101_BID_STRATEGY_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "strategy", "lifecycle at strategy");
  check(result.lifecycle.transitions.length >= 1, "transitions");
  check(result.strategy !== null, "strategy present");
  check(result.strategy!.workspaceId === intelligence.opportunity.workspaceId, "workspace link");

  assertStrategyKernelPass(result);

  const forced = runStrategyKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    opportunity: intelligence.opportunity,
    preferredEmphasis: ["delivery", "differentiation"],
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.strategy.emphasis.includes("delivery"), "orThrow emphasis");

  const fromBuilder = buildStrategyKernel({
    deploymentId: `${DEPLOYMENT_ID}-builder`,
    opportunity: intelligence.opportunity,
  });
  check(fromBuilder.strategy?.posture !== undefined, "builder posture");

  console.log("✓ strategy kernel");
  console.log(formatStrategyKernelSummary(result));
}

function main() {
  console.log("E01-P4 — AI Bid Strategy Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testStrategyBuild();
  testKernel();
  console.log("\nPASS — V101 P4 strategy (OpportunityProfile → BidStrategy)");
}

main();
