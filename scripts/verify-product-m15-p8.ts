/**
 * Product M15 — P8 Enterprise Evolution Baseline Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID } from "../lib/product/m14/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  isProductEvolutionFreezeLockIntact,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_COMPONENT_LOCK,
  PRODUCT_EVOLUTION_FREEZE_LOCK,
} from "../lib/product/m15/baseline/freeze/freeze.lock";
import {
  isProductEvolutionImmutableManifestIntact,
  PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
} from "../lib/product/m15/baseline/freeze/immutable.manifest";
import {
  isProductEvolutionRollbackSnapshotIntact,
  PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
} from "../lib/product/m15/baseline/freeze/rollback.snapshot";
import { PRODUCT_EVOLUTION_CAPABILITY_ID } from "../lib/product/m15/capability-runtime/capability.constants";
import { PRODUCT_EVOLUTION_EXPERIENCE_ID } from "../lib/product/m15/experience/experience.constants";
import { PRODUCT_EVOLUTION_FEEDBACK_ID } from "../lib/product/m15/feedback/feedback.constants";
import { PRODUCT_EVOLUTION_FOUNDATION_ID } from "../lib/product/m15/foundation/evolution.constants";
import { PRODUCT_EVOLUTION_GOVERNANCE_ID } from "../lib/product/m15/governance-runtime/governance.constants";
import { PRODUCT_EVOLUTION_LEARNING_ID } from "../lib/product/m15/learning-runtime/learning.constants";
import { PRODUCT_EVOLUTION_OPTIMIZATION_ID } from "../lib/product/m15/optimization-runtime/optimization.constants";
import {
  assertProductEvolutionBaselineReleaseGatePass,
  checkProductEvolutionBaselineReleaseGate,
} from "../lib/product/m15/verify/evolution.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/baseline/freeze/freeze.lock.ts",
    "lib/product/m15/baseline/freeze/immutable.manifest.ts",
    "lib/product/m15/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m15/baseline/index.ts",
    "lib/product/m15/verify/evolution.baseline.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/foundation/evolution.constants.ts",
    "lib/product/m15/feedback/feedback.constants.ts",
    "lib/product/m15/experience/experience.constants.ts",
    "lib/product/m15/learning-runtime/learning.constants.ts",
    "lib/product/m15/optimization-runtime/optimization.constants.ts",
    "lib/product/m15/capability-runtime/capability.constants.ts",
    "lib/product/m15/governance-runtime/governance.constants.ts",
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
    "lib/product/m15/lifecycle",
    "lib/product/m15/learning",
    "lib/product/m15/optimization",
    "lib/product/m15/capability",
    "lib/product/m15/governance",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_BASELINE_ID ===
      "enterprise-product-evolution-baseline-v1",
    "evolution baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID === PRODUCT_EVOLUTION_BASELINE_ID,
    "evolution baseline alias",
  );
  check(
    PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION ===
      "product-evolution-baseline-freeze-1",
    "evolution freeze version",
  );
  check(
    PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE === PRODUCT_EVOLUTION_GOVERNANCE_ID,
    "freeze base = evolution governance",
  );
  check(
    PRODUCT_EVOLUTION_FOUNDATION_ID ===
      "enterprise-product-evolution-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_ID ===
      "enterprise-product-evolution-feedback-v1",
    "feedback preserved",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_ID ===
      "enterprise-product-evolution-experience-v1",
    "experience preserved",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_ID ===
      "enterprise-product-evolution-learning-v1",
    "learning preserved",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
      "enterprise-product-evolution-optimization-v1",
    "optimization preserved",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_ID ===
      "enterprise-product-evolution-capability-v1",
    "capability preserved",
  );
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_ID ===
      "enterprise-product-evolution-governance-v1",
    "governance preserved",
  );
  check(
    ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
      "enterprise-product-intelligence-baseline-v1",
    "intelligence baseline preserved",
  );
  check(isProductEvolutionFreezeLockIntact(), "freeze lock intact");
  check(
    isProductEvolutionImmutableManifestIntact(
      PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest",
  );
  check(
    isProductEvolutionRollbackSnapshotIntact(
      PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot",
  );
  check(PRODUCT_EVOLUTION_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    PRODUCT_EVOLUTION_FREEZE_LOCK.intelligenceBaseline ===
      ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
    "intelligence baseline soft-ref",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Evolution Baseline Freeze (M15-P8) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
