/**
 * E03-P1 — Enterprise Autonomous Agent Platform foundation verification
 * Agent registry / lifecycle / types
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_CAPABILITIES,
  AGENT_LIFECYCLE_STAGES,
  AGENT_ROLES,
  AGENT_STATUSES,
  E03_AGENT_PLATFORM_FREEZE_VERSION,
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "../lib/agent-platform/e03/core/agent.constants";
import {
  advanceLifecycle,
  assertAgentFoundationPass,
  buildAgentFoundation,
  buildAgentFoundationLifecycle,
  canAdvanceLifecycle,
  createInitialLifecycle,
} from "../lib/agent-platform/e03/core/agent.lifecycle";
import {
  AGENT_CATALOG,
  buildAgentRegistryManifest,
  getAgentById,
  getAgentByRole,
  isAgentDependencyGraphValid,
  listExecutableAgents,
} from "../lib/agent-platform/e03/core/agent.registry";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/agent-platform/e03/core/agent.types.ts",
    "lib/agent-platform/e03/core/agent.constants.ts",
    "lib/agent-platform/e03/core/agent.registry.ts",
    "lib/agent-platform/e03/core/agent.lifecycle.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testConstantsAndTypes() {
  check(E03_AGENT_PLATFORM_ID === "enterprise-e03-autonomous-agent-platform-v1", "platform id");
  check(E03_AGENT_PLATFORM_VERSION === "e03-agent-platform-1", "version");
  check(E03_AGENT_PLATFORM_FREEZE_VERSION === "e03-agent-platform-freeze-1", "freeze");
  check(AGENT_ROLES.length === 6, "roles");
  check(AGENT_CAPABILITIES.length === 6, "capabilities");
  check(AGENT_STATUSES.length === 7, "statuses");
  check(AGENT_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  console.log("✓ constants");
}

function testRegistry() {
  check(AGENT_CATALOG.length === 6, "catalog size");
  check(isAgentDependencyGraphValid(), "dependency graph");

  const registry = buildAgentRegistryManifest();
  check(registry.platformId === E03_AGENT_PLATFORM_ID, "registry platform");
  check(registry.catalogComplete === true, "catalog complete");
  check(registry.agentCount === 6, "agent count");
  check(registry.readOnly === true, "registry readOnly");
  check(getAgentById("e03.agent.planner")?.role === "planner", "get by id");
  check(getAgentByRole("coordinator")?.id === "e03.agent.coordinator", "get by role");
  check(listExecutableAgents().length === 5, "executable agents");
  console.log("✓ agent registry");
}

function testLifecycle() {
  check(canAdvanceLifecycle("declared", "registered"), "declared→registered");
  check(!canAdvanceLifecycle("declared", "completed"), "skip blocked");

  let lifecycle = createInitialLifecycle();
  check(lifecycle.current === "declared", "initial declared");
  check(lifecycle.complete === false, "not complete");

  lifecycle = advanceLifecycle(lifecycle, "registered", "test register");
  check(lifecycle.current === "registered", "registered");
  check(lifecycle.transitions.length === 1, "1 transition");

  let threw = false;
  try {
    advanceLifecycle(lifecycle, "completed");
  } catch {
    threw = true;
  }
  check(threw, "invalid advance throws");

  const full = buildAgentFoundationLifecycle();
  check(full.current === "completed", "foundation lifecycle completed");
  check(full.complete === true, "foundation complete");
  check(full.transitions.length === 4, "4 transitions");
  console.log("✓ agent lifecycle");
}

function testFoundation() {
  const result = buildAgentFoundation();
  check(result.ready === true, "foundation ready");
  check(result.platformId === E03_AGENT_PLATFORM_ID, "platform");
  check(result.version === E03_AGENT_PLATFORM_VERSION, "version");
  check(result.freezeVersion === E03_AGENT_PLATFORM_FREEZE_VERSION, "freeze");
  check(result.registry.catalogComplete === true, "registry ok");
  check(result.lifecycle.complete === true, "lifecycle ok");
  assertAgentFoundationPass(result);
  console.log("✓ agent foundation");
  console.log(result.summary);
}

function main() {
  console.log("E03-P1 — Enterprise Autonomous Agent Platform Foundation\n");
  checkModuleStructure();
  testConstantsAndTypes();
  testRegistry();
  testLifecycle();
  testFoundation();
  console.log("\nPASS — E03 P1 agent foundation (registry / lifecycle / types)");
}

main();
