/**
 * Product M12 — P4 Agent Policy verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AGENT_DEPENDENCY_ID } from "../lib/product/m12/dependency-runtime/dependency.constants";
import {
  AGENT_POLICY_BINDING_STATUSES,
  AGENT_POLICY_CONSTRAINTS,
  AGENT_POLICY_ENFORCEMENTS,
  AGENT_POLICY_KINDS,
  AGENT_POLICY_READINESS_VERDICTS,
  AGENT_POLICY_RULE_STATUSES,
  AGENT_POLICY_STATUSES,
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_TAG,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "../lib/product/m12/policy-runtime/policy.constants";
import {
  getAgentPolicyMetadata,
  isAgentPolicyMetadataIntact,
} from "../lib/product/m12/policy-runtime/policy.metadata";
import {
  assertProductAgentPolicyReleaseGatePass,
  checkProductAgentPolicyReleaseGate,
} from "../lib/product/m12/verify/agent.policy.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/policy-runtime/policy.constants.ts",
    "lib/product/m12/policy-runtime/policy.types.ts",
    "lib/product/m12/policy-runtime/policy.metadata.ts",
    "lib/product/m12/policy-runtime/policy.registry.ts",
    "lib/product/m12/policy-runtime/rule.registry.ts",
    "lib/product/m12/policy-runtime/binding.registry.ts",
    "lib/product/m12/policy-runtime/policy.manifest.ts",
    "lib/product/m12/verify/agent.policy.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/dependency-runtime/dependency.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P5+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1",
    "agent policy id",
  );
  check(
    PRODUCT_AGENT_POLICY_VERSION === "product-agent-policy-1",
    "agent policy version",
  );
  check(
    PRODUCT_AGENT_POLICY_FREEZE_VERSION === "product-agent-policy-freeze-1",
    "agent policy freeze",
  );
  check(
    PRODUCT_AGENT_POLICY_BASE === PRODUCT_AGENT_DEPENDENCY_ID,
    "agent policy base = agent dependency",
  );
  check(
    PRODUCT_AGENT_POLICY_FREEZE_TAG === "product-agent-policy-freeze-1",
    "agent policy freeze tag",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_ID === "enterprise-product-agent-dependency-v1",
    "agent dependency preserved",
  );
  check(AGENT_POLICY_KINDS.length === 4, "policy kinds");
  check(AGENT_POLICY_STATUSES.length === 4, "policy statuses");
  check(AGENT_POLICY_RULE_STATUSES.length === 4, "rule statuses");
  check(AGENT_POLICY_BINDING_STATUSES.length === 3, "binding statuses");
  check(AGENT_POLICY_ENFORCEMENTS.length === 3, "enforcements");
  check(AGENT_POLICY_CONSTRAINTS.length === 4, "constraints");
  check(AGENT_POLICY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAgentPolicyMetadataIntact(getAgentPolicyMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentPolicyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentPolicyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Policy (M12-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
