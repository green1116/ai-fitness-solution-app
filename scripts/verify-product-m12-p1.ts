/**
 * Product M12 — P1 AI Agent Platform Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID } from "../lib/product/m11/baseline/freeze/freeze.lock";
import {
  AGENT_CAPABILITY_KINDS,
  AGENT_CAPABILITY_STATUSES,
  AGENT_DOMAIN_SCOPES,
  AGENT_GOVERNANCE_POLICY_KINDS,
  AGENT_GOVERNANCE_POLICY_STATUSES,
  AGENT_INVOCATION_MODES,
  AGENT_READINESS_VERDICTS,
  AGENT_ROLES,
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
  PRODUCT_AGENT_FREEZE_TAG,
} from "../lib/product/m12/foundation/agent.constants";
import {
  getAgentFoundationMetadata,
  isAgentFoundationMetadataIntact,
} from "../lib/product/m12/foundation/agent.metadata";
import {
  assertProductAgentFoundationReleaseGatePass,
  checkProductAgentFoundationReleaseGate,
} from "../lib/product/m12/verify/agent.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/foundation/agent.constants.ts",
    "lib/product/m12/foundation/agent.types.ts",
    "lib/product/m12/foundation/agent.metadata.ts",
    "lib/product/m12/foundation/agent.registry.ts",
    "lib/product/m12/foundation/capability.registry.ts",
    "lib/product/m12/foundation/governance.policy.ts",
    "lib/product/m12/foundation/invocation.contract.ts",
    "lib/product/m12/foundation/agent.manifest.ts",
    "lib/product/m12/verify/agent.foundation.gate.ts",
    "lib/product/m12/index.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_FOUNDATION_ID === "enterprise-product-agent-foundation-v1",
    "agent foundation id",
  );
  check(
    PRODUCT_AGENT_FOUNDATION_VERSION === "product-agent-1",
    "agent foundation version",
  );
  check(
    PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION ===
      "product-agent-foundation-freeze-1",
    "agent foundation freeze",
  );
  check(
    PRODUCT_AGENT_FOUNDATION_BASE === ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
    "agent base = knowledge baseline",
  );
  check(
    PRODUCT_AGENT_FREEZE_TAG === "product-agent-foundation-freeze-1",
    "agent freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID ===
      "enterprise-product-knowledge-baseline-v1",
    "knowledge baseline preserved",
  );
  check(AGENT_ROLES.length === 6, "agent roles");
  check(AGENT_STATUSES.length === 4, "agent statuses");
  check(AGENT_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(AGENT_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(AGENT_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(AGENT_INVOCATION_MODES.length === 3, "invocation modes");
  check(AGENT_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(AGENT_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(AGENT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAgentFoundationMetadataIntact(getAgentFoundationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Foundation (M12-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
