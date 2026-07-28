/**
 * Product M15 — P4 Enterprise Evolution Learning verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_EXPERIENCE_ID } from "../lib/product/m15/experience/experience.constants";
import {
  EVOLUTION_LEARNING_CAPABILITY_KINDS,
  EVOLUTION_LEARNING_CAPABILITY_STATUSES,
  EVOLUTION_LEARNING_DOMAIN_SCOPES,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_LEARNING_INSIGHT_MODES,
  EVOLUTION_LEARNING_KINDS,
  EVOLUTION_LEARNING_READINESS_VERDICTS,
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "../lib/product/m15/learning-runtime/learning.constants";
import {
  getEvolutionLearningMetadata,
  isEvolutionLearningMetadataIntact,
} from "../lib/product/m15/learning-runtime/learning.metadata";
import {
  assertProductEvolutionLearningReleaseGatePass,
  checkProductEvolutionLearningReleaseGate,
} from "../lib/product/m15/verify/evolution.learning.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/learning-runtime/learning.constants.ts",
    "lib/product/m15/learning-runtime/learning.types.ts",
    "lib/product/m15/learning-runtime/learning.metadata.ts",
    "lib/product/m15/learning-runtime/learning.registry.ts",
    "lib/product/m15/learning-runtime/capability.registry.ts",
    "lib/product/m15/learning-runtime/governance.policy.ts",
    "lib/product/m15/learning-runtime/insight.contract.ts",
    "lib/product/m15/learning-runtime/learning.manifest.ts",
    "lib/product/m15/verify/evolution.learning.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/experience/experience.constants.ts",
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
    "lib/product/m15/learning",
    "lib/product/m15/optimization",
    "lib/product/m15/analysis",
    "lib/product/m15/recommendation",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P5+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_LEARNING_ID ===
      "enterprise-product-evolution-learning-v1",
    "evolution learning id",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_VERSION === "product-evolution-learning-1",
    "evolution learning version",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION ===
      "product-evolution-learning-freeze-1",
    "evolution learning freeze",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_BASE === PRODUCT_EVOLUTION_EXPERIENCE_ID,
    "evolution learning base = evolution experience",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG ===
      "product-evolution-learning-freeze-1",
    "evolution learning freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_ID ===
      "enterprise-product-evolution-experience-v1",
    "evolution experience preserved",
  );
  check(EVOLUTION_LEARNING_KINDS.length === 6, "learning kinds");
  check(EVOLUTION_LEARNING_STATUSES.length === 4, "learning statuses");
  check(EVOLUTION_LEARNING_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(
    EVOLUTION_LEARNING_CAPABILITY_STATUSES.length === 4,
    "capability statuses",
  );
  check(EVOLUTION_LEARNING_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(EVOLUTION_LEARNING_INSIGHT_MODES.length === 3, "insight modes");
  check(
    EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(
    EVOLUTION_LEARNING_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isEvolutionLearningMetadataIntact(getEvolutionLearningMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionLearningReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionLearningReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Learning (M15-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
