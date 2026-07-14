/**
 * E02-P6 — Enterprise Memory Agent verification
 * Agent → Retrieval → Recommendation lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runExtractionKernelOrThrow } from "../lib/tender-intelligence/v102/extraction";
import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import { runRelationshipKernelOrThrow } from "../lib/tender-intelligence/v102/relationship";
import {
  assertMemoryAgentKernelPass,
  buildMemoryAgentRegistryManifest,
  formatMemoryAgentKernelSummary,
  getMemoryAgentById,
  getMemoryAgentByRole,
  isMemoryAgentDependencyGraphValid,
  listExecutableMemoryAgents,
  MEMORY_AGENT_CATALOG,
  MEMORY_AGENT_LIFECYCLE_STAGES,
  MEMORY_AGENT_ROLES,
  runMemoryAgentKernel,
  runMemoryAgentKernelOrThrow,
  validateMemoryAgentKernelInput,
  validateMemoryAgentRecommendation,
  validateMemoryAgentRegistry,
  V102_MEMORY_AGENT_FREEZE_VERSION,
  V102_MEMORY_AGENT_VERSION,
} from "../lib/tender-intelligence/v102/memory-agent";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p6-memory-agent";

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
    "lib/tender-intelligence/v102/memory-agent/memory-agent.types.ts",
    "lib/tender-intelligence/v102/memory-agent/memory-agent.schema.ts",
    "lib/tender-intelligence/v102/memory-agent/memory-agent.registry.ts",
    "lib/tender-intelligence/v102/memory-agent/memory-agent.builder.ts",
    "lib/tender-intelligence/v102/memory-agent/memory-agent.entry.ts",
    "lib/tender-intelligence/v102/memory-agent/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testRegistry() {
  check(MEMORY_AGENT_CATALOG.length === 4, "catalog size");
  check(MEMORY_AGENT_ROLES.length === 4, "roles");
  check(MEMORY_AGENT_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(isMemoryAgentDependencyGraphValid(), "dependency graph");

  const registry = buildMemoryAgentRegistryManifest();
  check(registry.catalogComplete === true, "catalog complete");
  check(validateMemoryAgentRegistry(registry).ok, "registry schema");
  check(getMemoryAgentById("memory.retriever")?.role === "retriever", "get by id");
  check(getMemoryAgentByRole("recommender")?.id === "memory.recommender", "get by role");
  check(listExecutableMemoryAgents().length === 3, "executable agents");

  const badInput = validateMemoryAgentKernelInput({ queryText: "a" });
  check(!badInput.ok, "bad input rejected");

  console.log("✓ memory agent registry");
}

function testMemoryAgentKernel() {
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

  const result = runMemoryAgentKernel({
    deploymentId: DEPLOYMENT_ID,
    graph: knowledge.graph,
    queryText: "健身器械 GB/T 22517 预算限价 园区",
    titleHint: "星河科技园企业记忆推荐",
  });

  check(result.version === V102_MEMORY_AGENT_VERSION, "version");
  check(result.freezeVersion === V102_MEMORY_AGENT_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.registry.agentCount === 4, "registry agents");
  check(result.context?.status === "ready", "context ready");
  check(result.profile?.status === "ready", "profile ready");
  check(result.recommendation?.status === "ready", "recommendation ready");
  check((result.recommendation?.itemCount ?? 0) >= 2, "enough recs");
  check((result.recommendation?.highPriorityCount ?? 0) >= 1, "high priority");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "recommendation", "lifecycle at recommendation");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(
    validateMemoryAgentRecommendation(result.recommendation).ok,
    "recommendation schema",
  );

  assertMemoryAgentKernelPass(result);

  const forced = runMemoryAgentKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    graph: knowledge.graph,
    queryText: "跑步机 设备 标准",
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.recommendation.status === "ready", "orThrow recommendation");

  console.log("✓ memory agent kernel");
  console.log(formatMemoryAgentKernelSummary(result));
}

function main() {
  console.log("E02-P6 — Enterprise Memory Agent Verification\n");
  checkModuleStructure();
  testRegistry();
  testMemoryAgentKernel();
  console.log("\nPASS — V102 P6 memory-agent (Agent → Retrieval → Recommendation)");
}

main();
