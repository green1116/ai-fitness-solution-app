/**
 * Product M12 — P5 Agent Compatibility verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AGENT_COMPATIBILITY_BINDING_STATUSES,
  AGENT_COMPATIBILITY_CONSTRAINTS,
  AGENT_COMPATIBILITY_MATRIX_KINDS,
  AGENT_COMPATIBILITY_MATRIX_STATUSES,
  AGENT_COMPATIBILITY_PAIR_STATUSES,
  AGENT_COMPATIBILITY_READINESS_VERDICTS,
  AGENT_COMPATIBILITY_RELATIONS,
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "../lib/product/m12/compatibility-runtime/compatibility.constants";
import {
  getAgentCompatibilityMetadata,
  isAgentCompatibilityMetadataIntact,
} from "../lib/product/m12/compatibility-runtime/compatibility.metadata";
import { PRODUCT_AGENT_POLICY_ID } from "../lib/product/m12/policy-runtime/policy.constants";
import {
  assertProductAgentCompatibilityReleaseGatePass,
  checkProductAgentCompatibilityReleaseGate,
} from "../lib/product/m12/verify/agent.compatibility.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m12/compatibility-runtime/compatibility.types.ts",
    "lib/product/m12/compatibility-runtime/compatibility.metadata.ts",
    "lib/product/m12/compatibility-runtime/matrix.registry.ts",
    "lib/product/m12/compatibility-runtime/pair.registry.ts",
    "lib/product/m12/compatibility-runtime/binding.registry.ts",
    "lib/product/m12/compatibility-runtime/compatibility.manifest.ts",
    "lib/product/m12/verify/agent.compatibility.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/policy-runtime/policy.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P6+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_COMPATIBILITY_ID ===
      "enterprise-product-agent-compatibility-v1",
    "agent compatibility id",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_VERSION === "product-agent-compatibility-1",
    "agent compatibility version",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION ===
      "product-agent-compatibility-freeze-1",
    "agent compatibility freeze",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_BASE === PRODUCT_AGENT_POLICY_ID,
    "agent compatibility base = agent policy",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG ===
      "product-agent-compatibility-freeze-1",
    "agent compatibility freeze tag",
  );
  check(
    PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1",
    "agent policy preserved",
  );
  check(AGENT_COMPATIBILITY_MATRIX_KINDS.length === 4, "matrix kinds");
  check(AGENT_COMPATIBILITY_MATRIX_STATUSES.length === 4, "matrix statuses");
  check(AGENT_COMPATIBILITY_PAIR_STATUSES.length === 4, "pair statuses");
  check(AGENT_COMPATIBILITY_RELATIONS.length === 4, "relations");
  check(AGENT_COMPATIBILITY_BINDING_STATUSES.length === 3, "binding statuses");
  check(AGENT_COMPATIBILITY_CONSTRAINTS.length === 4, "constraints");
  check(
    AGENT_COMPATIBILITY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isAgentCompatibilityMetadataIntact(getAgentCompatibilityMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentCompatibilityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentCompatibilityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Compatibility (M12-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
