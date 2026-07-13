/**
 * E02-P4 — Knowledge Retrieval Engine verification
 * KnowledgeGraph → Query → KnowledgeContext lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runExtractionKernelOrThrow } from "../lib/tender-intelligence/v102/extraction";
import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import { runRelationshipKernelOrThrow } from "../lib/tender-intelligence/v102/relationship";
import {
  assertRetrievalKernelPass,
  buildKnowledgeQuery,
  formatRetrievalKernelSummary,
  rankKnowledgeHits,
  RETRIEVAL_LIFECYCLE_STAGES,
  runRetrievalKernel,
  runRetrievalKernelOrThrow,
  validateKnowledgeContext,
  validateKnowledgeQuery,
  validateRetrievalKernelInput,
  V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
  V102_KNOWLEDGE_RETRIEVAL_VERSION,
} from "../lib/tender-intelligence/v102/retrieval";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p4-retrieval";

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
    "lib/tender-intelligence/v102/retrieval/retrieval.types.ts",
    "lib/tender-intelligence/v102/retrieval/retrieval.schema.ts",
    "lib/tender-intelligence/v102/retrieval/retrieval.builder.ts",
    "lib/tender-intelligence/v102/retrieval/retrieval.entry.ts",
    "lib/tender-intelligence/v102/retrieval/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(RETRIEVAL_LIFECYCLE_STAGES.length === 3, "lifecycle stages");

  const badInput = validateRetrievalKernelInput({
    queryText: "a",
    graph: { id: "g" },
  });
  check(!badInput.ok, "invalid input rejected");

  const badQuery = validateKnowledgeQuery({ id: "q", text: "x" });
  check(!badQuery.ok, "incomplete query rejected");

  console.log("✓ schema guards");
}

function testRetrievalKernel() {
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

  const query = buildKnowledgeQuery({
    queryText: "GB/T 22517 设备标准与预算限价",
    limit: 10,
    expandNeighbors: true,
  });
  check(query.readOnly === true, "query readOnly");
  check(validateKnowledgeQuery(query).ok, "query schema");

  const hits = rankKnowledgeHits({ graph: knowledge.graph, query });
  check(hits.length >= 2, "ranked hits");
  check(hits[0]!.rank === 1, "top rank");

  const result = runRetrievalKernel({
    deploymentId: DEPLOYMENT_ID,
    graph: knowledge.graph,
    queryText: "GB/T 22517 设备标准与预算限价",
    titleHint: "星河科技园检索上下文",
    limit: 10,
    expandNeighbors: true,
  });

  check(result.version === V102_KNOWLEDGE_RETRIEVAL_VERSION, "version");
  check(result.freezeVersion === V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.context?.status === "ready", "context ready");
  check((result.context?.hitCount ?? 0) >= 2, "enough hits");
  check((result.context?.focusedNodes.length ?? 0) >= 1, "focused nodes");
  check((result.context?.snippets.length ?? 0) >= 1, "snippets");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "context", "lifecycle at context");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(validateKnowledgeContext(result.context).ok, "context schema");
  check(
    result.context!.hits.some(
      (h) =>
        h.label.includes("22517") ||
        h.matchedTerms.some((t) => t.includes("22517") || t.includes("标准")),
    ),
    "standard-related hit",
  );

  assertRetrievalKernelPass(result);

  const forced = runRetrievalKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    graph: knowledge.graph,
    queryText: "跑步机 设备 需求",
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.context.status === "ready", "orThrow context");

  console.log("✓ retrieval kernel");
  console.log(formatRetrievalKernelSummary(result));
}

function main() {
  console.log("E02-P4 — Knowledge Retrieval Engine Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testRetrievalKernel();
  console.log("\nPASS — V102 P4 retrieval (Graph → Query → Context)");
}

main();
