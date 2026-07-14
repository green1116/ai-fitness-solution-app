/**
 * E04-P1 — Business Agent Foundation verification
 * Business Agent abstraction above E03 Agent Runtime
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildAgentFoundation } from "../lib/agent-platform/e03/core/agent.lifecycle";
import {
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "../lib/agent-platform/e03/core/agent.constants";
import {
  assertBusinessAgentFoundationPass,
  buildBusinessAgentFoundation,
  buildBusinessCapabilityRegistryManifest,
  BUSINESS_AGENT_CATALOG,
  BUSINESS_AGENT_DOMAINS,
  BUSINESS_AGENT_LIFECYCLE_STAGES,
  BUSINESS_CAPABILITY_CATALOG,
  canAdvanceBusinessLifecycle,
  createBusinessAgentExecutionContext,
  E04_BUSINESS_AGENT_BASE,
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
  executeBusinessAgentOrThrow,
  getBusinessAgentByDomain,
  getBusinessAgentById,
  isBusinessAgentDependencyGraphValid,
  listExecutableBusinessAgents,
} from "../lib/business-agent/e04";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
  "lib/agent-platform/e03/runtime/agent.context.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/business-agent/e04/core/business-agent.types.ts",
    "lib/business-agent/e04/core/business-agent.constants.ts",
    "lib/business-agent/e04/core/business-agent.lifecycle.ts",
    "lib/business-agent/e04/core/business-agent.registry.ts",
    "lib/business-agent/e04/capability/capability.types.ts",
    "lib/business-agent/e04/capability/capability.registry.ts",
    "lib/business-agent/e04/runtime/business-agent.context.ts",
    "lib/business-agent/e04/runtime/business-agent.executor.ts",
    "lib/business-agent/e04/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozenE03(baseline: Record<string, string>) {
  for (const rel of FROZEN_E03) {
    check(sha1(rel) === baseline[rel], `E03 frozen modified: ${rel}`);
  }
  const foundation = buildAgentFoundation();
  check(foundation.ready === true, "E03 foundation still ready");
  check(foundation.platformId === E03_AGENT_PLATFORM_ID, "E03 id intact");
  check(foundation.version === E03_AGENT_PLATFORM_VERSION, "E03 version intact");
  console.log("✓ E03 base unmodified");
}

function testFoundationAndCapabilities() {
  check(BUSINESS_AGENT_DOMAINS.length === 6, "domains");
  check(BUSINESS_AGENT_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(canAdvanceBusinessLifecycle("declared", "registered"), "declared→registered");
  check(!canAdvanceBusinessLifecycle("declared", "completed"), "skip blocked");

  check(BUSINESS_AGENT_CATALOG.length === 6, "business agents");
  check(isBusinessAgentDependencyGraphValid(), "dependency graph");
  check(BUSINESS_CAPABILITY_CATALOG.length === 7, "capabilities");

  const caps = buildBusinessCapabilityRegistryManifest();
  check(caps.catalogComplete === true, "capability catalog complete");

  const foundation = buildBusinessAgentFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.platformId === E04_BUSINESS_AGENT_PLATFORM_ID, "platform id");
  check(foundation.base === E04_BUSINESS_AGENT_BASE, "base e03");
  check(foundation.version === E04_BUSINESS_AGENT_VERSION, "version");
  check(foundation.registry.catalogComplete === true, "registry complete");
  check(foundation.lifecycle.complete === true, "lifecycle complete");
  assertBusinessAgentFoundationPass(foundation);

  check(getBusinessAgentByDomain("tender")?.id === "e04.business.tender", "by domain");
  check(listExecutableBusinessAgents().length === 5, "executable agents");
  console.log("✓ foundation + capabilities");
  console.log(foundation.summary);
}

function testExecutorBridge() {
  const tender = getBusinessAgentById("e04.business.tender");
  check(Boolean(tender), "tender agent");

  const context = createBusinessAgentExecutionContext({
    businessAgentId: tender!.id,
    runtimeAgentId: tender!.runtimeAgentId,
    capabilityId: "e04.cap.intake",
    input: {
      goal: "星河科技园健身中心招采响应",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e04-p1" },
  });

  const run = executeBusinessAgentOrThrow(tender!, context);
  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.runtime.result.success === true, "E03 runtime success");
  check(run.result.runtimeAgentId === "e03.agent.planner", "bound runtime");
  check(run.result.output.domain === "tender", "domain output");

  // Probe all domain agents
  for (const agent of listExecutableBusinessAgents()) {
    const ctx = createBusinessAgentExecutionContext({
      businessAgentId: agent.id,
      runtimeAgentId: agent.runtimeAgentId,
      capabilityId: agent.capabilityIds[0],
      input: { goal: `probe:${agent.domain}` },
    });
    const bundle = executeBusinessAgentOrThrow(agent, ctx);
    check(bundle.result.success === true, `${agent.id} success`);
  }

  console.log("✓ business executor → E03 runtime bridge");
}

function main() {
  console.log("E04-P1 — Business Agent Foundation Verification\n");
  const baseline: Record<string, string> = {};
  for (const rel of FROZEN_E03) baseline[rel] = sha1(rel);

  checkModules();
  checkFrozenE03(baseline);
  testFoundationAndCapabilities();
  testExecutorBridge();
  checkFrozenE03(baseline);

  console.log("\nPASS — E04 P1 business agent foundation");
}

main();
