/**
 * Product M15 — P3 Enterprise Evolution Experience verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_FEEDBACK_ID } from "../lib/product/m15/feedback/feedback.constants";
import {
  EVOLUTION_EXPERIENCE_CAPABILITY_KINDS,
  EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES,
  EVOLUTION_EXPERIENCE_DOMAIN_SCOPES,
  EVOLUTION_EXPERIENCE_EXPOSURE_MODES,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_EXPERIENCE_KINDS,
  EVOLUTION_EXPERIENCE_READINESS_VERDICTS,
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "../lib/product/m15/experience/experience.constants";
import {
  getEvolutionExperienceMetadata,
  isEvolutionExperienceMetadataIntact,
} from "../lib/product/m15/experience/experience.metadata";
import {
  assertProductEvolutionExperienceReleaseGatePass,
  checkProductEvolutionExperienceReleaseGate,
} from "../lib/product/m15/verify/evolution.experience.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/experience/experience.constants.ts",
    "lib/product/m15/experience/experience.types.ts",
    "lib/product/m15/experience/experience.metadata.ts",
    "lib/product/m15/experience/experience.registry.ts",
    "lib/product/m15/experience/capability.registry.ts",
    "lib/product/m15/experience/governance.policy.ts",
    "lib/product/m15/experience/exposure.contract.ts",
    "lib/product/m15/experience/experience.manifest.ts",
    "lib/product/m15/verify/evolution.experience.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/feedback/feedback.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P4+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_ID ===
      "enterprise-product-evolution-experience-v1",
    "evolution experience id",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_VERSION === "product-evolution-experience-1",
    "evolution experience version",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION ===
      "product-evolution-experience-freeze-1",
    "evolution experience freeze",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_BASE === PRODUCT_EVOLUTION_FEEDBACK_ID,
    "evolution experience base = evolution feedback",
  );
  check(
    PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG ===
      "product-evolution-experience-freeze-1",
    "evolution experience freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_ID ===
      "enterprise-product-evolution-feedback-v1",
    "evolution feedback preserved",
  );
  check(EVOLUTION_EXPERIENCE_KINDS.length === 6, "experience kinds");
  check(EVOLUTION_EXPERIENCE_STATUSES.length === 4, "experience statuses");
  check(EVOLUTION_EXPERIENCE_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(
    EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES.length === 4,
    "capability statuses",
  );
  check(EVOLUTION_EXPERIENCE_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(EVOLUTION_EXPERIENCE_EXPOSURE_MODES.length === 3, "exposure modes");
  check(
    EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(
    EVOLUTION_EXPERIENCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isEvolutionExperienceMetadataIntact(getEvolutionExperienceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionExperienceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionExperienceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Experience (M15-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
