/**
 * E02-P7 — Knowledge Delivery Intelligence verification
 * Memory Recommendation → Enterprise Knowledge Package lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runExtractionKernelOrThrow } from "../lib/tender-intelligence/v102/extraction";
import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import { runMemoryAgentKernelOrThrow } from "../lib/tender-intelligence/v102/memory-agent";
import { runRelationshipKernelOrThrow } from "../lib/tender-intelligence/v102/relationship";
import {
  assertKnowledgeDeliveryKernelPass,
  buildEnterpriseKnowledgePackage,
  formatKnowledgeDeliveryKernelSummary,
  KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES,
  KNOWLEDGE_PACKAGE_SECTION_KINDS,
  runKnowledgeDeliveryKernel,
  runKnowledgeDeliveryKernelOrThrow,
  validateEnterpriseKnowledgePackage,
  validateKnowledgeDeliveryKernelInput,
  validateMemoryRecommendationInput,
  V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  V102_KNOWLEDGE_DELIVERY_VERSION,
} from "../lib/tender-intelligence/v102/knowledge-delivery";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p7-delivery";

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
    "lib/tender-intelligence/v102/knowledge-delivery/delivery.types.ts",
    "lib/tender-intelligence/v102/knowledge-delivery/delivery.schema.ts",
    "lib/tender-intelligence/v102/knowledge-delivery/delivery.builder.ts",
    "lib/tender-intelligence/v102/knowledge-delivery/delivery.entry.ts",
    "lib/tender-intelligence/v102/knowledge-delivery/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(KNOWLEDGE_PACKAGE_SECTION_KINDS.length === 7, "section kinds");

  const badRec = validateMemoryRecommendationInput({ id: "x" });
  check(!badRec.ok, "incomplete recommendation rejected");

  const badInput = validateKnowledgeDeliveryKernelInput({
    recommendation: { id: "x" },
  });
  check(!badInput.ok, "bad kernel input rejected");

  console.log("✓ schema guards");
}

function testKnowledgeDeliveryKernel() {
  const extraction = runExtractionKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-extract`,
    rawText: SAMPLE_TENDER,
    projectHint: "星河科技园企业健身中心建设项目",
    organizationHint: "星河科技园管理有限公司",
  });

  const relationships = runRelationshipKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-rel`,
    candidates: extraction.candidates,
  });

  const knowledge = runKnowledgeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-graph`,
    rawText: SAMPLE_TENDER,
    seedNodes: extraction.candidates.nodeSeeds,
    seedEdges: relationships.network.edgeSeeds,
    titleHint: "星河科技园知识图谱",
  });

  const memory = runMemoryAgentKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-memory`,
    graph: knowledge.graph,
    queryText: "健身器械 GB/T 22517 预算限价 园区",
    titleHint: "星河科技园企业记忆推荐",
  });

  check(validateMemoryRecommendationInput(memory.recommendation).ok, "rec valid");

  const pkg = buildEnterpriseKnowledgePackage({
    recommendation: memory.recommendation,
    deploymentId: DEPLOYMENT_ID,
    contextId: memory.context.id,
    profileId: memory.profile.id,
    titleHint: "星河科技园企业知识包",
    ownerHint: "knowledge-ops",
    contextPresent: true,
    profilePresent: true,
  });
  check(validateEnterpriseKnowledgePackage(pkg).ok, "package schema");
  check(pkg.status === "sealed", "package sealed");
  check(pkg.sectionCount === 7, "7 sections");
  check(pkg.seal !== null, "seal present");

  const result = runKnowledgeDeliveryKernel({
    deploymentId: DEPLOYMENT_ID,
    recommendation: memory.recommendation,
    context: memory.context,
    profile: memory.profile,
    titleHint: "星河科技园企业知识包",
    ownerHint: "knowledge-ops",
  });

  check(result.version === V102_KNOWLEDGE_DELIVERY_VERSION, "version");
  check(result.freezeVersion === V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "seal", "lifecycle at seal");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(result.package?.status === "sealed", "result sealed");
  check(Boolean(result.package?.seal?.packageHash), "seal hash");

  assertKnowledgeDeliveryKernelPass(result);

  const forced = runKnowledgeDeliveryKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    recommendation: memory.recommendation,
    context: memory.context,
    profile: memory.profile,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.package.status === "sealed", "orThrow sealed");

  console.log("✓ knowledge delivery kernel");
  console.log(formatKnowledgeDeliveryKernelSummary(result));
}

function main() {
  console.log("E02-P7 — Knowledge Delivery Intelligence Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testKnowledgeDeliveryKernel();
  console.log("\nPASS — V102 P7 knowledge-delivery (Recommendation → Package → Seal)");
}

main();
