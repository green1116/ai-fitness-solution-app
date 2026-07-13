/**
 * E02-P1 — Tender Knowledge Graph Kernel verification
 * KnowledgeNode → KnowledgeEdge → KnowledgeGraph lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeKernelPass,
  buildKnowledgeEdge,
  buildKnowledgeGraph,
  buildKnowledgeKernel,
  buildKnowledgeNode,
  formatKnowledgeKernelSummary,
  KNOWLEDGE_EDGE_KINDS,
  KNOWLEDGE_LIFECYCLE_STAGES,
  KNOWLEDGE_NODE_KINDS,
  runKnowledgeKernel,
  runKnowledgeKernelOrThrow,
  validateKnowledgeGraph,
  validateKnowledgeKernelInput,
  validateKnowledgeNode,
  V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
  V102_TENDER_KNOWLEDGE_VERSION,
} from "../lib/tender-intelligence/v102/knowledge";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p1-knowledge";

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
    "lib/tender-intelligence/v102/knowledge/knowledge.types.ts",
    "lib/tender-intelligence/v102/knowledge/knowledge.schema.ts",
    "lib/tender-intelligence/v102/knowledge/knowledge.builder.ts",
    "lib/tender-intelligence/v102/knowledge/knowledge.entry.ts",
    "lib/tender-intelligence/v102/knowledge/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(KNOWLEDGE_NODE_KINDS.length === 10, "node kinds");
  check(KNOWLEDGE_EDGE_KINDS.length === 8, "edge kinds");
  check(KNOWLEDGE_LIFECYCLE_STAGES.length === 3, "lifecycle stages");

  const badInput = validateKnowledgeKernelInput({});
  check(!badInput.ok, "empty input rejected");

  const badNode = validateKnowledgeNode({ id: "x", label: "y" });
  check(!badNode.ok, "incomplete node rejected");

  console.log("✓ schema guards");
}

function testNodeEdgeGraph() {
  const project = buildKnowledgeNode({
    kind: "project",
    label: "星河科技园企业健身中心建设项目",
  });
  const org = buildKnowledgeNode({
    kind: "organization",
    label: "星河科技园管理有限公司",
  });
  check(project.readOnly === true, "node readOnly");
  check(validateKnowledgeNode(project).ok, "node schema");

  const edge = buildKnowledgeEdge({
    kind: "owns",
    from: org,
    to: project,
    label: "招标人拥有项目",
  });
  check(edge.fromNodeId === org.id, "edge from");
  check(edge.toNodeId === project.id, "edge to");

  const graph = buildKnowledgeGraph({
    nodes: [project, org],
    edges: [edge],
    titleHint: "测试知识图谱",
  });
  check(graph.status === "ready", "graph ready");
  check(validateKnowledgeGraph(graph).ok, "graph schema");
  check(graph.nodeCount === 2, "node count");
  check(graph.edgeCount === 1, "edge count");

  console.log("✓ node → edge → graph");
}

function testKernel() {
  const result = runKnowledgeKernel({
    deploymentId: DEPLOYMENT_ID,
    rawText: SAMPLE_TENDER,
    projectHint: "星河科技园企业健身中心建设项目",
    organizationHint: "星河科技园管理有限公司",
    titleHint: "星河科技园招采知识图谱",
    seedNodes: [
      {
        kind: "equipment",
        label: "有氧跑步机机组",
        aliases: ["跑步机"],
        confidence: 0.9,
      },
    ],
    seedEdges: [
      {
        kind: "supplies",
        fromLabel: "有氧跑步机机组",
        toLabel: "技术与功能需求",
        label: "设备响应需求",
      },
    ],
  });

  check(result.version === V102_TENDER_KNOWLEDGE_VERSION, "version");
  check(result.freezeVersion === V102_TENDER_KNOWLEDGE_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.nodes.length >= 5, "enough nodes");
  check(result.edges.length >= 3, "enough edges");
  check(result.graph?.status === "ready", "graph ready");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "graph", "lifecycle at graph");
  check(result.lifecycle.transitions.length >= 2, "transitions");
  check(
    result.nodes.some((n) => n.kind === "project"),
    "project node",
  );
  check(
    result.nodes.some((n) => n.kind === "organization"),
    "organization node",
  );
  check(
    result.edges.every((e) =>
      result.nodes.some((n) => n.id === e.fromNodeId) &&
      result.nodes.some((n) => n.id === e.toNodeId),
    ),
    "edges reference nodes",
  );

  assertKnowledgeKernelPass(result);

  const forced = runKnowledgeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    rawText: SAMPLE_TENDER,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.graph.status === "ready", "orThrow graph ready");

  const built = buildKnowledgeKernel({
    deploymentId: `${DEPLOYMENT_ID}-build`,
    projectHint: "示范项目",
    organizationHint: "示范单位",
  });
  check(built.nodes.length >= 2, "hint-only nodes");
  check(built.ready === true, "hint-only ready");

  console.log("✓ knowledge kernel");
  console.log(formatKnowledgeKernelSummary(result));
}

function main() {
  console.log("E02-P1 — Tender Knowledge Graph Kernel Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testNodeEdgeGraph();
  testKernel();
  console.log("\nPASS — V102 P1 knowledge (Node → Edge → Graph)");
}

main();
