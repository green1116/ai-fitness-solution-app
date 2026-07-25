/**
 * Product P5 — AI Proposal Generation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../lib/operations/o5/freeze/freeze.lock";
import { PRODUCT_P4_REQUIREMENT_COLLECTION_ID } from "../lib/product/p4/questionnaire/questionnaire.constants";
import {
  BUILDER_STATUSES,
  GENERATOR_STATUSES,
  P5_MANAGER_STATUSES,
  P5_READINESS_VERDICTS,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
  PRODUCT_P5_PROPOSAL_FREEZE_VERSION,
  PROPOSAL_SECTION_KINDS,
  PROPOSAL_STATUSES,
  PROPOSAL_TEMPLATE_KINDS,
} from "../lib/product/p5/proposal/proposal.constants";
import {
  assertProductP5ReleaseGatePass,
  checkProductP5ReleaseGate,
} from "../lib/product/p5/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p5/proposal/proposal.constants.ts",
    "lib/product/p5/proposal/proposal.types.ts",
    "lib/product/p5/proposal/proposal.registry.ts",
    "lib/product/p5/proposal/proposal.readiness.ts",
    "lib/product/p5/proposal-template/template.types.ts",
    "lib/product/p5/proposal-template/template.registry.ts",
    "lib/product/p5/proposal-builder/builder.types.ts",
    "lib/product/p5/proposal-builder/builder.registry.ts",
    "lib/product/p5/section-generator/section.types.ts",
    "lib/product/p5/section-generator/section.registry.ts",
    "lib/product/p5/executive-summary/summary.types.ts",
    "lib/product/p5/executive-summary/summary.registry.ts",
    "lib/product/p5/solution-overview/overview.types.ts",
    "lib/product/p5/solution-overview/overview.registry.ts",
    "lib/product/p5/differentiator/differentiator.types.ts",
    "lib/product/p5/differentiator/differentiator.registry.ts",
    "lib/product/p5/proposal.manager.ts",
    "lib/product/p5/verify/product.release.gate.ts",
    "lib/product/p5/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P5_AI_PROPOSAL_GENERATION_ID ===
      "enterprise-product-p5-ai-proposal-generation-v1",
    "p5 ai proposal generation id",
  );
  check(
    PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION === "product-p5-1",
    "p5 ai proposal generation version",
  );
  check(
    PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION ===
      "product-p5-ai-proposal-generation-freeze-1",
    "p5 ai proposal generation freeze",
  );
  check(
    PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE ===
      PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
    "p5 base = p4 requirement collection",
  );
  check(
    PRODUCT_P5_PROPOSAL_FREEZE_VERSION ===
      "product-p5-ai-proposal-generation-freeze-1",
    "p5 freeze tag",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PROPOSAL_STATUSES.length === 5, "proposal statuses");
  check(PROPOSAL_TEMPLATE_KINDS.length === 5, "proposal template kinds");
  check(PROPOSAL_SECTION_KINDS.length === 6, "proposal section kinds");
  check(BUILDER_STATUSES.length === 4, "builder statuses");
  check(GENERATOR_STATUSES.length === 3, "generator statuses");
  check(P5_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P5_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP5ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P5 AI Proposal Generation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
