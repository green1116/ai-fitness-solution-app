/**
 * Product M14 — P1 Enterprise Intelligence Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_OS_BASELINE_ID } from "../lib/product/m13/baseline/freeze/freeze.lock";
import {
  INTELLIGENCE_ANALYSIS_MODES,
  INTELLIGENCE_CAPABILITY_KINDS,
  INTELLIGENCE_CAPABILITY_STATUSES,
  INTELLIGENCE_DOMAIN_SCOPES,
  INTELLIGENCE_GOVERNANCE_POLICY_KINDS,
  INTELLIGENCE_GOVERNANCE_POLICY_STATUSES,
  INTELLIGENCE_LENS_KINDS,
  INTELLIGENCE_LENS_STATUSES,
  INTELLIGENCE_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
  PRODUCT_INTELLIGENCE_FREEZE_TAG,
} from "../lib/product/m14/foundation/intelligence.constants";
import {
  getIntelligenceFoundationMetadata,
  isIntelligenceFoundationMetadataIntact,
} from "../lib/product/m14/foundation/intelligence.metadata";
import {
  assertProductIntelligenceFoundationReleaseGatePass,
  checkProductIntelligenceFoundationReleaseGate,
} from "../lib/product/m14/verify/intelligence.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/foundation/intelligence.constants.ts",
    "lib/product/m14/foundation/intelligence.types.ts",
    "lib/product/m14/foundation/intelligence.metadata.ts",
    "lib/product/m14/foundation/intelligence.registry.ts",
    "lib/product/m14/foundation/capability.registry.ts",
    "lib/product/m14/foundation/governance.policy.ts",
    "lib/product/m14/foundation/analysis.contract.ts",
    "lib/product/m14/foundation/intelligence.manifest.ts",
    "lib/product/m14/verify/intelligence.foundation.gate.ts",
    "lib/product/m14/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m14/vector",
    "lib/product/m14/rag",
    "lib/product/m14/embedding",
    "lib/product/m14/provider",
    "lib/product/m14/db",
    "lib/product/m14/runtime",
    "lib/product/m14/execution",
    "lib/product/m14/tool",
    "lib/product/m14/catalog",
    "lib/product/m14/dependency",
    "lib/product/m14/policy",
    "lib/product/m14/compatibility",
    "lib/product/m14/governance-runtime",
    "lib/product/m14/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
      "enterprise-product-intelligence-foundation-v1",
    "intelligence foundation id",
  );
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_VERSION === "product-intelligence-1",
    "intelligence foundation version",
  );
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION ===
      "product-intelligence-foundation-freeze-1",
    "intelligence foundation freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_BASE === ENTERPRISE_PRODUCT_OS_BASELINE_ID,
    "intelligence base = os baseline",
  );
  check(
    PRODUCT_INTELLIGENCE_FREEZE_TAG ===
      "product-intelligence-foundation-freeze-1",
    "intelligence freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_OS_BASELINE_ID === "enterprise-product-os-baseline-v1",
    "os baseline preserved",
  );
  check(INTELLIGENCE_LENS_KINDS.length === 6, "lens kinds");
  check(INTELLIGENCE_LENS_STATUSES.length === 4, "lens statuses");
  check(INTELLIGENCE_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(INTELLIGENCE_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(INTELLIGENCE_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(INTELLIGENCE_ANALYSIS_MODES.length === 3, "analysis modes");
  check(INTELLIGENCE_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(
    INTELLIGENCE_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(INTELLIGENCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isIntelligenceFoundationMetadataIntact(
      getIntelligenceFoundationMetadata(),
    ),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Intelligence Foundation (M14-P1) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
