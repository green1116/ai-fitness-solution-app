/**
 * E02-P3 — Knowledge Relationship Engine verification
 * Transform entity candidates into knowledge relationships
 */
import fs from "node:fs";
import path from "node:path";

import { runExtractionKernelOrThrow } from "../lib/tender-intelligence/v102/extraction";
import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import {
  assertRelationshipKernelPass,
  buildKnowledgeRelationship,
  formatRelationshipKernelSummary,
  RELATIONSHIP_LIFECYCLE_STAGES,
  RELATIONSHIP_STRENGTHS,
  runRelationshipKernel,
  runRelationshipKernelOrThrow,
  scoreRelationshipStrength,
  validateKnowledgeRelationship,
  validateRelationshipKernelInput,
  validateRelationshipNetwork,
  V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
  V102_KNOWLEDGE_RELATIONSHIP_VERSION,
} from "../lib/tender-intelligence/v102/relationship";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p3-relationship";

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
    "lib/tender-intelligence/v102/relationship/relationship.types.ts",
    "lib/tender-intelligence/v102/relationship/relationship.schema.ts",
    "lib/tender-intelligence/v102/relationship/relationship.builder.ts",
    "lib/tender-intelligence/v102/relationship/relationship.entry.ts",
    "lib/tender-intelligence/v102/relationship/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(RELATIONSHIP_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(RELATIONSHIP_STRENGTHS.length === 3, "strengths");
  check(scoreRelationshipStrength(0.95, 1) === "strong", "strong score");
  check(scoreRelationshipStrength(0.5, 0.4) === "weak", "weak score");

  const badInput = validateRelationshipKernelInput({});
  check(!badInput.ok, "empty input rejected");

  const badRel = validateKnowledgeRelationship({ id: "x", label: "y" });
  check(!badRel.ok, "incomplete relationship rejected");

  console.log("✓ schema guards");
}

function testRelationshipKernel() {
  const extraction = runExtractionKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream`,
    rawText: SAMPLE_TENDER,
    projectHint: "星河科技园企业健身中心建设项目",
    organizationHint: "星河科技园管理有限公司",
    titleHint: "星河科技园实体抽取候选",
  });

  const result = runRelationshipKernel({
    deploymentId: DEPLOYMENT_ID,
    candidates: extraction.candidates,
    titleHint: "星河科技园关系网络",
  });

  check(result.version === V102_KNOWLEDGE_RELATIONSHIP_VERSION, "version");
  check(result.freezeVersion === V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.relationships.length >= 5, "enough relationships");
  check(
    result.relationships.some((r) => !r.derived),
    "has primary relationships",
  );
  check(
    result.relationships.some((r) => r.derived),
    "has derived relationships",
  );
  check(result.network?.status === "ready", "network ready");
  check((result.network?.strongCount ?? 0) >= 1, "has strong links");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "network", "lifecycle at network");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(validateRelationshipNetwork(result.network).ok, "network schema");

  const sample = buildKnowledgeRelationship({
    kind: "related_to",
    from: extraction.candidates.entities[0]!,
    to: extraction.candidates.entities[1]!,
    label: "测试关系",
    confidence: 0.8,
  });
  check(sample.readOnly === true, "relationship readOnly");
  check(validateKnowledgeRelationship(sample).ok, "sample schema");

  assertRelationshipKernelPass(result);

  const forced = runRelationshipKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    entities: extraction.candidates.entities,
    relationCandidates: extraction.candidates.relations,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.network.status === "ready", "orThrow network");

  // Edge seeds feed P1 KnowledgeGraph without modifying P1/P2
  const graph = runKnowledgeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-to-graph`,
    rawText: SAMPLE_TENDER,
    seedNodes: extraction.candidates.nodeSeeds,
    seedEdges: forced.network.edgeSeeds,
    titleHint: "由关系网络构建的知识图谱",
  });
  check(graph.ready === true, "P1 graph from relationships");
  check(graph.graph.edgeCount >= 1, "graph edges");

  console.log("✓ relationship kernel");
  console.log(formatRelationshipKernelSummary(result));
}

function main() {
  console.log("E02-P3 — Knowledge Relationship Engine Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testRelationshipKernel();
  console.log("\nPASS — V102 P3 relationship (Candidates → Relationships → Network)");
}

main();
