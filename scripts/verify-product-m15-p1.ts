/**
 * Product M15 — P1 Enterprise Evolution Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID } from "../lib/product/m14/baseline/freeze/freeze.lock";
import {
  EVOLUTION_CAPABILITY_KINDS,
  EVOLUTION_CAPABILITY_STATUSES,
  EVOLUTION_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_PROGRESSION_MODES,
  EVOLUTION_READINESS_VERDICTS,
  EVOLUTION_TRACK_KINDS,
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
  PRODUCT_EVOLUTION_FREEZE_TAG,
} from "../lib/product/m15/foundation/evolution.constants";
import {
  getEvolutionFoundationMetadata,
  isEvolutionFoundationMetadataIntact,
} from "../lib/product/m15/foundation/evolution.metadata";
import {
  assertProductEvolutionFoundationReleaseGatePass,
  checkProductEvolutionFoundationReleaseGate,
} from "../lib/product/m15/verify/evolution.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/foundation/evolution.constants.ts",
    "lib/product/m15/foundation/evolution.types.ts",
    "lib/product/m15/foundation/evolution.metadata.ts",
    "lib/product/m15/foundation/evolution.registry.ts",
    "lib/product/m15/foundation/capability.registry.ts",
    "lib/product/m15/foundation/governance.policy.ts",
    "lib/product/m15/foundation/progression.contract.ts",
    "lib/product/m15/foundation/evolution.manifest.ts",
    "lib/product/m15/verify/evolution.foundation.gate.ts",
    "lib/product/m15/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m15/vector",
    "lib/product/m15/rag",
    "lib/product/m15/embedding",
    "lib/product/m15/provider",
    "lib/product/m15/db",
    "lib/product/m15/runtime",
    "lib/product/m15/execution",
    "lib/product/m15/tool",
    "lib/product/m15/catalog",
    "lib/product/m15/dependency",
    "lib/product/m15/policy",
    "lib/product/m15/compatibility",
    "lib/product/m15/governance-runtime",
    "lib/product/m15/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_FOUNDATION_ID ===
      "enterprise-product-evolution-foundation-v1",
    "evolution foundation id",
  );
  check(
    PRODUCT_EVOLUTION_FOUNDATION_VERSION === "product-evolution-1",
    "evolution foundation version",
  );
  check(
    PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION ===
      "product-evolution-foundation-freeze-1",
    "evolution foundation freeze",
  );
  check(
    PRODUCT_EVOLUTION_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
    "evolution base = intelligence baseline",
  );
  check(
    PRODUCT_EVOLUTION_FREEZE_TAG === "product-evolution-foundation-freeze-1",
    "evolution freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
      "enterprise-product-intelligence-baseline-v1",
    "intelligence baseline preserved",
  );
  check(EVOLUTION_TRACK_KINDS.length === 6, "track kinds");
  check(EVOLUTION_TRACK_STATUSES.length === 4, "track statuses");
  check(EVOLUTION_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(EVOLUTION_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(EVOLUTION_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(EVOLUTION_PROGRESSION_MODES.length === 3, "progression modes");
  check(EVOLUTION_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(
    EVOLUTION_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(EVOLUTION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isEvolutionFoundationMetadataIntact(getEvolutionFoundationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Foundation (M15-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
