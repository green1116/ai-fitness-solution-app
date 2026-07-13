/**
 * E01-P5 — AI Proposal Intelligence verification
 * BidStrategy + RequirementIndex → ProposalBlueprint lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runTenderIntakeKernelOrThrow } from "../lib/tender-intelligence/v101/intake";
import { runUnderstandingKernelOrThrow } from "../lib/tender-intelligence/v101/understanding";
import { runIntelligenceKernelOrThrow } from "../lib/tender-intelligence/v101/intelligence";
import { runStrategyKernelOrThrow } from "../lib/tender-intelligence/v101/strategy";
import {
  assertProposalKernelPass,
  buildProposalBlueprint,
  buildProposalKernel,
  formatProposalKernelSummary,
  PROPOSAL_CHAPTER_KINDS,
  PROPOSAL_LIFECYCLE_STAGES,
  runProposalKernel,
  runProposalKernelOrThrow,
  validateBidStrategyInput,
  validateProposalBlueprint,
  validateRequirementIndexInput,
  V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
  V101_PROPOSAL_INTELLIGENCE_VERSION,
} from "../lib/tender-intelligence/v101/proposal";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p5-proposal";

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
    "lib/tender-intelligence/v101/proposal/proposal.types.ts",
    "lib/tender-intelligence/v101/proposal/proposal.schema.ts",
    "lib/tender-intelligence/v101/proposal/proposal.builder.ts",
    "lib/tender-intelligence/v101/proposal/proposal.entry.ts",
    "lib/tender-intelligence/v101/proposal/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(PROPOSAL_LIFECYCLE_STAGES.length === 2, "lifecycle stages");
  check(PROPOSAL_CHAPTER_KINDS.length === 8, "chapter kinds");

  const badStrategy = validateBidStrategyInput({ id: "x" });
  check(!badStrategy.ok, "incomplete strategy rejected");

  const badIndex = validateRequirementIndexInput({ id: "x" });
  check(!badIndex.ok, "incomplete requirement index rejected");

  console.log("✓ schema guards");
}

function buildUpstream() {
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

  const strategy = runStrategyKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream-strategy`,
    opportunity: intelligence.opportunity,
    preferredEmphasis: ["compliance", "commercial"],
  });

  return {
    requirementIndex: understanding.requirementIndex,
    strategy: strategy.strategy,
  };
}

function testBlueprintBuild() {
  const { requirementIndex, strategy } = buildUpstream();

  check(validateBidStrategyInput(strategy).ok, "strategy valid");
  check(validateRequirementIndexInput(requirementIndex).ok, "requirement index valid");

  const blueprint = buildProposalBlueprint({
    strategy,
    requirementIndex,
    titleHint: "星河科技园投标方案蓝图",
  });

  check(blueprint.strategyId === strategy.id, "blueprint links strategy");
  check(blueprint.requirementIndexId === requirementIndex.id, "blueprint links index");
  check(blueprint.chapterCount === PROPOSAL_CHAPTER_KINDS.length, "chapter count");
  check(blueprint.coverageCount === requirementIndex.entryCount, "coverage count");
  check(blueprint.coverageRatio >= 0 && blueprint.coverageRatio <= 1, "coverage ratio");
  check(blueprint.narrativeArc.length >= 2, "narrative arc");
  check(blueprint.evidenceNeeds.length >= 1, "evidence needs");
  check(validateProposalBlueprint(blueprint).ok, "blueprint schema");

  console.log("✓ strategy + requirements → proposal blueprint");
}

function testKernel() {
  const { requirementIndex, strategy } = buildUpstream();

  const result = runProposalKernel({
    deploymentId: DEPLOYMENT_ID,
    strategy,
    requirementIndex,
    titleHint: "星河科技园投标方案蓝图",
  });

  check(result.version === V101_PROPOSAL_INTELLIGENCE_VERSION, "version");
  check(result.freezeVersion === V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "blueprint", "lifecycle at blueprint");
  check(result.lifecycle.transitions.length >= 1, "transitions");
  check(result.blueprint !== null, "blueprint present");
  check(result.blueprint!.title.includes("星河"), "title hint");

  assertProposalKernelPass(result);

  const forced = runProposalKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    strategy,
    requirementIndex,
  });
  check(forced.ready === true, "orThrow ready");

  const fromBuilder = buildProposalKernel({
    deploymentId: `${DEPLOYMENT_ID}-builder`,
    strategy,
    requirementIndex,
  });
  check(fromBuilder.blueprint?.chapterCount === 8, "builder chapters");

  console.log("✓ proposal kernel");
  console.log(formatProposalKernelSummary(result));
}

function main() {
  console.log("E01-P5 — AI Proposal Intelligence Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testBlueprintBuild();
  testKernel();
  console.log("\nPASS — V101 P5 proposal (BidStrategy + RequirementIndex → ProposalBlueprint)");
}

main();
