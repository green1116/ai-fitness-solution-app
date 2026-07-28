/**
 * Product M15 — P2 Enterprise Evolution Feedback verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_FOUNDATION_ID } from "../lib/product/m15/foundation/evolution.constants";
import {
  EVOLUTION_FEEDBACK_CAPABILITY_KINDS,
  EVOLUTION_FEEDBACK_CAPABILITY_STATUSES,
  EVOLUTION_FEEDBACK_DOMAIN_SCOPES,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_FEEDBACK_INTAKE_MODES,
  EVOLUTION_FEEDBACK_KINDS,
  EVOLUTION_FEEDBACK_READINESS_VERDICTS,
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "../lib/product/m15/feedback/feedback.constants";
import {
  getEvolutionFeedbackMetadata,
  isEvolutionFeedbackMetadataIntact,
} from "../lib/product/m15/feedback/feedback.metadata";
import {
  assertProductEvolutionFeedbackReleaseGatePass,
  checkProductEvolutionFeedbackReleaseGate,
} from "../lib/product/m15/verify/evolution.feedback.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/feedback/feedback.constants.ts",
    "lib/product/m15/feedback/feedback.types.ts",
    "lib/product/m15/feedback/feedback.metadata.ts",
    "lib/product/m15/feedback/feedback.registry.ts",
    "lib/product/m15/feedback/capability.registry.ts",
    "lib/product/m15/feedback/governance.policy.ts",
    "lib/product/m15/feedback/intake.contract.ts",
    "lib/product/m15/feedback/feedback.manifest.ts",
    "lib/product/m15/verify/evolution.feedback.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/foundation/evolution.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P3+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_FEEDBACK_ID ===
      "enterprise-product-evolution-feedback-v1",
    "evolution feedback id",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_VERSION === "product-evolution-feedback-1",
    "evolution feedback version",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION ===
      "product-evolution-feedback-freeze-1",
    "evolution feedback freeze",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_BASE === PRODUCT_EVOLUTION_FOUNDATION_ID,
    "evolution feedback base = evolution foundation",
  );
  check(
    PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG ===
      "product-evolution-feedback-freeze-1",
    "evolution feedback freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_FOUNDATION_ID ===
      "enterprise-product-evolution-foundation-v1",
    "evolution foundation preserved",
  );
  check(EVOLUTION_FEEDBACK_KINDS.length === 6, "feedback kinds");
  check(EVOLUTION_FEEDBACK_STATUSES.length === 4, "feedback statuses");
  check(EVOLUTION_FEEDBACK_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(
    EVOLUTION_FEEDBACK_CAPABILITY_STATUSES.length === 4,
    "capability statuses",
  );
  check(EVOLUTION_FEEDBACK_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(EVOLUTION_FEEDBACK_INTAKE_MODES.length === 3, "intake modes");
  check(
    EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(EVOLUTION_FEEDBACK_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isEvolutionFeedbackMetadataIntact(getEvolutionFeedbackMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionFeedbackReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionFeedbackReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Feedback (M15-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
