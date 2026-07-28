/**
 * Product M15 — P5 Enterprise Evolution Optimization verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_LEARNING_ID } from "../lib/product/m15/learning-runtime/learning.constants";
import {
  EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS,
  EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES,
  EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES,
  EVOLUTION_OPTIMIZATION_EVALUATION_MODES,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS,
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  EVOLUTION_OPTIMIZATION_READINESS_VERDICTS,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "../lib/product/m15/optimization-runtime/optimization.constants";
import {
  getEvolutionOptimizationMetadata,
  isEvolutionOptimizationMetadataIntact,
} from "../lib/product/m15/optimization-runtime/optimization.metadata";
import {
  assertProductEvolutionOptimizationReleaseGatePass,
  checkProductEvolutionOptimizationReleaseGate,
} from "../lib/product/m15/verify/evolution.optimization.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/optimization-runtime/optimization.constants.ts",
    "lib/product/m15/optimization-runtime/optimization.types.ts",
    "lib/product/m15/optimization-runtime/optimization.metadata.ts",
    "lib/product/m15/optimization-runtime/optimization.registry.ts",
    "lib/product/m15/optimization-runtime/capability.registry.ts",
    "lib/product/m15/optimization-runtime/governance.policy.ts",
    "lib/product/m15/optimization-runtime/evaluation.contract.ts",
    "lib/product/m15/optimization-runtime/optimization.manifest.ts",
    "lib/product/m15/verify/evolution.optimization.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/learning-runtime/learning.constants.ts",
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
    "lib/product/m15/deployment",
    "lib/product/m15/automation",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P6+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
      "enterprise-product-evolution-optimization-v1",
    "evolution optimization id",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_VERSION ===
      "product-evolution-optimization-1",
    "evolution optimization version",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION ===
      "product-evolution-optimization-freeze-1",
    "evolution optimization freeze",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_BASE === PRODUCT_EVOLUTION_LEARNING_ID,
    "evolution optimization base = evolution learning",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG ===
      "product-evolution-optimization-freeze-1",
    "evolution optimization freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_LEARNING_ID ===
      "enterprise-product-evolution-learning-v1",
    "evolution learning preserved",
  );
  check(EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS.length === 6, "proposal kinds");
  check(
    EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES.length === 4,
    "proposal statuses",
  );
  check(
    EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS.length === 6,
    "capability kinds",
  );
  check(
    EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES.length === 4,
    "capability statuses",
  );
  check(EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(
    EVOLUTION_OPTIMIZATION_EVALUATION_MODES.length === 3,
    "evaluation modes",
  );
  check(
    EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(
    EVOLUTION_OPTIMIZATION_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isEvolutionOptimizationMetadataIntact(getEvolutionOptimizationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionOptimizationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionOptimizationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Optimization (M15-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
