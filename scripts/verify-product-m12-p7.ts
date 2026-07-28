/**
 * Product M12 — P7 Agent Lifecycle verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AGENT_GOVERNANCE_ID } from "../lib/product/m12/governance/governance.constants";
import {
  AGENT_LIFECYCLE_BINDING_STATUSES,
  AGENT_LIFECYCLE_PLAN_KINDS,
  AGENT_LIFECYCLE_PLAN_STATUSES,
  AGENT_LIFECYCLE_READINESS_VERDICTS,
  AGENT_LIFECYCLE_STATES,
  AGENT_LIFECYCLE_TRANSITION_STATUSES,
  AGENT_LIFECYCLE_TRIGGERS,
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "../lib/product/m12/lifecycle-runtime/lifecycle.constants";
import {
  getAgentLifecycleMetadata,
  isAgentLifecycleMetadataIntact,
} from "../lib/product/m12/lifecycle-runtime/lifecycle.metadata";
import {
  assertProductAgentLifecycleReleaseGatePass,
  checkProductAgentLifecycleReleaseGate,
} from "../lib/product/m12/verify/agent.lifecycle.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/lifecycle-runtime/lifecycle.constants.ts",
    "lib/product/m12/lifecycle-runtime/lifecycle.types.ts",
    "lib/product/m12/lifecycle-runtime/lifecycle.metadata.ts",
    "lib/product/m12/lifecycle-runtime/plan.registry.ts",
    "lib/product/m12/lifecycle-runtime/transition.registry.ts",
    "lib/product/m12/lifecycle-runtime/binding.registry.ts",
    "lib/product/m12/lifecycle-runtime/lifecycle.manifest.ts",
    "lib/product/m12/verify/agent.lifecycle.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/governance/governance.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m12/vector",
    "lib/product/m12/rag",
    "lib/product/m12/embedding",
    "lib/product/m12/provider",
    "lib/product/m12/db",
    "lib/product/m12/runtime",
    "lib/product/m12/execution",
    "lib/product/m12/tool",
    "lib/product/m12/dependency",
    "lib/product/m12/policy",
    "lib/product/m12/compatibility",
    "lib/product/m12/governance-runtime",
    "lib/product/m12/lifecycle",
    "lib/product/m12/compliance",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P8+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_LIFECYCLE_ID === "enterprise-product-agent-lifecycle-v1",
    "agent lifecycle id",
  );
  check(
    PRODUCT_AGENT_LIFECYCLE_VERSION === "product-agent-lifecycle-1",
    "agent lifecycle version",
  );
  check(
    PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION ===
      "product-agent-lifecycle-freeze-1",
    "agent lifecycle freeze",
  );
  check(
    PRODUCT_AGENT_LIFECYCLE_BASE === PRODUCT_AGENT_GOVERNANCE_ID,
    "agent lifecycle base = agent governance",
  );
  check(
    PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG === "product-agent-lifecycle-freeze-1",
    "agent lifecycle freeze tag",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_ID === "enterprise-product-agent-governance-v1",
    "agent governance preserved",
  );
  check(AGENT_LIFECYCLE_PLAN_KINDS.length === 4, "plan kinds");
  check(AGENT_LIFECYCLE_PLAN_STATUSES.length === 4, "plan statuses");
  check(AGENT_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(AGENT_LIFECYCLE_TRANSITION_STATUSES.length === 4, "transition statuses");
  check(AGENT_LIFECYCLE_TRIGGERS.length === 4, "triggers");
  check(AGENT_LIFECYCLE_BINDING_STATUSES.length === 3, "binding statuses");
  check(AGENT_LIFECYCLE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAgentLifecycleMetadataIntact(getAgentLifecycleMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentLifecycleReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentLifecycleReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Lifecycle (M12-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
