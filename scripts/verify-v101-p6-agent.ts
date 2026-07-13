/**
 * E01-P6 — Enterprise AI Agent Orchestration verification
 * Agent Registry + orchestration lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_CATALOG,
  AGENT_ROLES,
  assertAgentOrchestrationPass,
  buildAgentRegistryManifest,
  buildOrchestrationPlan,
  formatAgentOrchestrationSummary,
  getAgentById,
  getAgentByRole,
  isAgentDependencyGraphValid,
  listExecutableAgents,
  ORCHESTRATION_LIFECYCLE_STAGES,
  runAgentKernel,
  runAgentKernelOrThrow,
  validateAgentRegistry,
  validateOrchestrationInput,
  validateOrchestrationPlan,
  V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
  V101_AGENT_ORCHESTRATION_VERSION,
} from "../lib/tender-intelligence/v101/agent";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p6-agent";

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
    "lib/tender-intelligence/v101/agent/agent.types.ts",
    "lib/tender-intelligence/v101/agent/agent.schema.ts",
    "lib/tender-intelligence/v101/agent/agent.registry.ts",
    "lib/tender-intelligence/v101/agent/agent.orchestrator.ts",
    "lib/tender-intelligence/v101/agent/agent.entry.ts",
    "lib/tender-intelligence/v101/agent/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testRegistry() {
  check(AGENT_CATALOG.length === 6, "catalog size");
  check(AGENT_ROLES.length === 6, "roles");
  check(ORCHESTRATION_LIFECYCLE_STAGES.length === 4, "lifecycle stages");
  check(isAgentDependencyGraphValid(), "dependency graph");

  const registry = buildAgentRegistryManifest();
  check(registry.catalogComplete === true, "catalog complete");
  check(registry.agentCount === 6, "agent count");
  check(validateAgentRegistry(registry).ok, "registry schema");

  check(getAgentById("agent.intake")?.role === "intake", "get by id");
  check(getAgentByRole("proposal")?.id === "agent.proposal", "get by role");
  check(listExecutableAgents().length === 5, "executable agents exclude orchestrator");

  console.log("✓ agent registry");
}

function testPlanAndInput() {
  const badInput = validateOrchestrationInput({ rawText: "short" });
  check(!badInput.ok, "short rawText rejected");

  const plan = buildOrchestrationPlan(DEPLOYMENT_ID);
  check(plan.stepCount === 5, "plan steps");
  check(plan.steps[0]?.role === "intake", "first step intake");
  check(plan.steps[4]?.role === "proposal", "last step proposal");
  check(validateOrchestrationPlan(plan).ok, "plan schema");

  console.log("✓ plan + input guards");
}

function testOrchestration() {
  const result = runAgentKernel({
    deploymentId: DEPLOYMENT_ID,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
    rawText: SAMPLE_TENDER,
    estimatedValueHint: 2_800_000,
    preferredEmphasis: ["compliance", "commercial"],
    titleHint: "星河科技园投标方案蓝图",
  });

  check(result.version === V101_AGENT_ORCHESTRATION_VERSION, "version");
  check(result.freezeVersion === V101_AGENT_ORCHESTRATION_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "assemble", "lifecycle at assemble");
  check(result.lifecycle.transitions.length >= 3, "transitions");
  check(result.runs.filter((r) => r.status === "succeeded").length === 5, "5 succeeded runs");
  check(Boolean(result.artifacts.workspaceId), "workspace artifact");
  check(Boolean(result.artifacts.requirementIndexId), "requirement artifact");
  check(Boolean(result.artifacts.opportunityId), "opportunity artifact");
  check(Boolean(result.artifacts.strategyId), "strategy artifact");
  check(Boolean(result.artifacts.blueprintId), "blueprint artifact");

  assertAgentOrchestrationPass(result);

  const forced = runAgentKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    rawText: SAMPLE_TENDER,
  });
  check(forced.ready === true, "orThrow ready");

  console.log("✓ agent orchestration");
  console.log(formatAgentOrchestrationSummary(result));
}

function main() {
  console.log("E01-P6 — Enterprise AI Agent Orchestration Verification\n");
  checkModuleStructure();
  testRegistry();
  testPlanAndInput();
  testOrchestration();
  console.log("\nPASS — V101 P6 agent (Registry → Plan → Execute → Assemble)");
}

main();
