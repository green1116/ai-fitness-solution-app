/**
 * Product M12 — P6 Agent Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AGENT_COMPATIBILITY_ID } from "../lib/product/m12/compatibility-runtime/compatibility.constants";
import {
  AGENT_GOVERNANCE_APPROVALS,
  AGENT_GOVERNANCE_BINDING_STATUSES,
  AGENT_GOVERNANCE_READINESS_VERDICTS,
  AGENT_GOVERNANCE_REVIEW_STATUSES,
  AGENT_GOVERNANCE_RISK_LEVELS,
  AGENT_GOVERNANCE_STANDARD_KINDS,
  AGENT_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "../lib/product/m12/governance/governance.constants";
import {
  getAgentGovernanceMetadata,
  isAgentGovernanceMetadataIntact,
} from "../lib/product/m12/governance/governance.metadata";
import {
  assertProductAgentGovernanceReleaseGatePass,
  checkProductAgentGovernanceReleaseGate,
} from "../lib/product/m12/verify/agent.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/governance/governance.constants.ts",
    "lib/product/m12/governance/governance.types.ts",
    "lib/product/m12/governance/governance.metadata.ts",
    "lib/product/m12/governance/standard.registry.ts",
    "lib/product/m12/governance/review.registry.ts",
    "lib/product/m12/governance/binding.registry.ts",
    "lib/product/m12/governance/governance.manifest.ts",
    "lib/product/m12/verify/agent.governance.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/compatibility-runtime/compatibility.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P7+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_GOVERNANCE_ID === "enterprise-product-agent-governance-v1",
    "agent governance id",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_VERSION === "product-agent-governance-1",
    "agent governance version",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION ===
      "product-agent-governance-freeze-1",
    "agent governance freeze",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_BASE === PRODUCT_AGENT_COMPATIBILITY_ID,
    "agent governance base = agent compatibility",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG ===
      "product-agent-governance-freeze-1",
    "agent governance freeze tag",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_ID ===
      "enterprise-product-agent-compatibility-v1",
    "agent compatibility preserved",
  );
  check(AGENT_GOVERNANCE_STANDARD_KINDS.length === 4, "standard kinds");
  check(AGENT_GOVERNANCE_STANDARD_STATUSES.length === 4, "standard statuses");
  check(AGENT_GOVERNANCE_REVIEW_STATUSES.length === 4, "review statuses");
  check(AGENT_GOVERNANCE_APPROVALS.length === 4, "approvals");
  check(AGENT_GOVERNANCE_RISK_LEVELS.length === 4, "risk levels");
  check(AGENT_GOVERNANCE_BINDING_STATUSES.length === 3, "binding statuses");
  check(AGENT_GOVERNANCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAgentGovernanceMetadataIntact(getAgentGovernanceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Governance (M12-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
