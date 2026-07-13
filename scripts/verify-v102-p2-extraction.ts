/**
 * E02-P2 — Knowledge Entity Extraction Engine verification
 * Extract entities from tender content into KnowledgeGraph candidates
 */
import fs from "node:fs";
import path from "node:path";

import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import {
  assertExtractionKernelPass,
  buildExtractedEntity,
  buildKnowledgeGraphCandidatePack,
  EXTRACTION_LIFECYCLE_STAGES,
  formatExtractionKernelSummary,
  KNOWLEDGE_NODE_KINDS,
  runExtractionKernel,
  runExtractionKernelOrThrow,
  validateExtractionKernelInput,
  validateExtractedEntity,
  validateKnowledgeGraphCandidatePack,
  V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
  V102_KNOWLEDGE_EXTRACTION_VERSION,
} from "../lib/tender-intelligence/v102/extraction";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p2-extraction";

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
    "lib/tender-intelligence/v102/extraction/extraction.types.ts",
    "lib/tender-intelligence/v102/extraction/extraction.schema.ts",
    "lib/tender-intelligence/v102/extraction/extraction.builder.ts",
    "lib/tender-intelligence/v102/extraction/extraction.entry.ts",
    "lib/tender-intelligence/v102/extraction/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(EXTRACTION_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(KNOWLEDGE_NODE_KINDS.length === 10, "node kinds re-export");

  const badInput = validateExtractionKernelInput({ rawText: "short" });
  check(!badInput.ok, "short rawText rejected");

  const badEntity = validateExtractedEntity({ id: "x", label: "y" });
  check(!badEntity.ok, "incomplete entity rejected");

  console.log("✓ schema guards");
}

function testExtractionKernel() {
  const result = runExtractionKernel({
    deploymentId: DEPLOYMENT_ID,
    rawText: SAMPLE_TENDER,
    projectHint: "星河科技园企业健身中心建设项目",
    organizationHint: "星河科技园管理有限公司",
    titleHint: "星河科技园实体抽取候选",
  });

  check(result.version === V102_KNOWLEDGE_EXTRACTION_VERSION, "version");
  check(result.freezeVersion === V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.entities.length >= 8, "enough entities");
  check(result.relations.length >= 4, "enough relations");
  check(result.candidates?.status === "ready", "candidates ready");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "candidates", "lifecycle at candidates");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(
    result.entities.some((e) => e.kind === "project"),
    "project entity",
  );
  check(
    result.entities.some((e) => e.kind === "standard" && e.label.includes("22517")),
    "standard entity",
  );
  check(
    result.entities.some((e) => e.sourceHint === "quantity-requirement"),
    "quantity requirements",
  );
  check(
    (result.candidates?.nodeSeeds.length ?? 0) === result.entities.length,
    "nodeSeeds align",
  );
  check(
    (result.candidates?.edgeSeeds.length ?? 0) === result.relations.length,
    "edgeSeeds align",
  );
  check(
    validateKnowledgeGraphCandidatePack(result.candidates).ok,
    "candidate pack schema",
  );

  assertExtractionKernelPass(result);

  const entity = buildExtractedEntity({
    kind: "other",
    label: "测试实体",
    evidence: "unit-test",
    sourceHint: "test",
    confidence: 0.5,
  });
  check(entity.readOnly === true, "entity readOnly");

  const pack = buildKnowledgeGraphCandidatePack({
    entities: result.entities.slice(0, 2),
    relations: result.relations.slice(0, 1),
    titleHint: "截取候选包",
  });
  check(pack.status === "ready", "mini pack ready");

  const forced = runExtractionKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    rawText: SAMPLE_TENDER,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.candidates.status === "ready", "orThrow candidates");

  // Candidates feed P1 KnowledgeGraph without modifying P1
  const graph = runKnowledgeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-to-graph`,
    rawText: SAMPLE_TENDER,
    seedNodes: forced.candidates.nodeSeeds,
    seedEdges: forced.candidates.edgeSeeds,
    titleHint: "由抽取候选构建的知识图谱",
  });
  check(graph.ready === true, "P1 graph from candidates");
  check(graph.graph.nodeCount >= 2, "graph nodes");
  check(graph.graph.edgeCount >= 1, "graph edges");

  console.log("✓ extraction kernel");
  console.log(formatExtractionKernelSummary(result));
}

function main() {
  console.log("E02-P2 — Knowledge Entity Extraction Engine Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testExtractionKernel();
  console.log("\nPASS — V102 P2 extraction (Content → Entities → Candidates)");
}

main();
