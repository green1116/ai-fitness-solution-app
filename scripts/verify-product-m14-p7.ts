/**
 * Product M14 — P7 Enterprise Intelligence Lifecycle verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_GOVERNANCE_ID } from "../lib/product/m14/governance/governance.constants";
import {
  INTELLIGENCE_LIFECYCLE_BINDING_STATUSES,
  INTELLIGENCE_LIFECYCLE_PLAN_KINDS,
  INTELLIGENCE_LIFECYCLE_PLAN_STATUSES,
  INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS,
  INTELLIGENCE_LIFECYCLE_STATES,
  INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES,
  INTELLIGENCE_LIFECYCLE_TRIGGERS,
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "../lib/product/m14/lifecycle-runtime/lifecycle.constants";
import {
  getIntelligenceLifecycleMetadata,
  isIntelligenceLifecycleMetadataIntact,
} from "../lib/product/m14/lifecycle-runtime/lifecycle.metadata";
import {
  assertProductIntelligenceLifecycleReleaseGatePass,
  checkProductIntelligenceLifecycleReleaseGate,
} from "../lib/product/m14/verify/intelligence.lifecycle.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/lifecycle-runtime/lifecycle.constants.ts",
    "lib/product/m14/lifecycle-runtime/lifecycle.types.ts",
    "lib/product/m14/lifecycle-runtime/lifecycle.metadata.ts",
    "lib/product/m14/lifecycle-runtime/plan.registry.ts",
    "lib/product/m14/lifecycle-runtime/transition.registry.ts",
    "lib/product/m14/lifecycle-runtime/binding.registry.ts",
    "lib/product/m14/lifecycle-runtime/lifecycle.manifest.ts",
    "lib/product/m14/verify/intelligence.lifecycle.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/governance/governance.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P8+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_ID ===
      "enterprise-product-intelligence-lifecycle-v1",
    "intelligence lifecycle id",
  );
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION ===
      "product-intelligence-lifecycle-1",
    "intelligence lifecycle version",
  );
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION ===
      "product-intelligence-lifecycle-freeze-1",
    "intelligence lifecycle freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_BASE === PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
    "intelligence lifecycle base = intelligence governance",
  );
  check(
    PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG ===
      "product-intelligence-lifecycle-freeze-1",
    "intelligence lifecycle freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
      "enterprise-product-intelligence-governance-v1",
    "intelligence governance preserved",
  );
  check(INTELLIGENCE_LIFECYCLE_PLAN_KINDS.length === 4, "plan kinds");
  check(INTELLIGENCE_LIFECYCLE_PLAN_STATUSES.length === 4, "plan statuses");
  check(INTELLIGENCE_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(
    INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES.length === 4,
    "transition statuses",
  );
  check(INTELLIGENCE_LIFECYCLE_TRIGGERS.length === 4, "triggers");
  check(INTELLIGENCE_LIFECYCLE_BINDING_STATUSES.length === 3, "binding statuses");
  check(
    INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isIntelligenceLifecycleMetadataIntact(getIntelligenceLifecycleMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceLifecycleReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceLifecycleReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Intelligence Lifecycle (M14-P7) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
