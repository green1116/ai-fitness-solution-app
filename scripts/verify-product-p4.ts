/**
 * Product P4 — Requirement Collection verification
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
import { PRODUCT_P3_AI_PROJECT_CREATION_ID } from "../lib/product/p3/project/project.constants";
import {
  BUDGET_TARGET_STATUSES,
  CONSTRAINT_KINDS,
  EQUIPMENT_PREFERENCE_LEVELS,
  P4_MANAGER_STATUSES,
  P4_READINESS_VERDICTS,
  PRODUCT_P4_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
  QUESTIONNAIRE_STATUSES,
  SPACE_ANALYSIS_STATUSES,
  STAKEHOLDER_ROLES,
  SURVEY_STATUSES,
  VALIDATION_VERDICTS,
} from "../lib/product/p4/questionnaire/questionnaire.constants";
import {
  assertProductP4ReleaseGatePass,
  checkProductP4ReleaseGate,
} from "../lib/product/p4/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p4/questionnaire/questionnaire.constants.ts",
    "lib/product/p4/questionnaire/questionnaire.types.ts",
    "lib/product/p4/questionnaire/questionnaire.registry.ts",
    "lib/product/p4/survey/survey.types.ts",
    "lib/product/p4/survey/survey.registry.ts",
    "lib/product/p4/stakeholder/stakeholder.types.ts",
    "lib/product/p4/stakeholder/stakeholder.registry.ts",
    "lib/product/p4/constraint/constraint.types.ts",
    "lib/product/p4/constraint/constraint.registry.ts",
    "lib/product/p4/space-analysis/space.types.ts",
    "lib/product/p4/space-analysis/space.registry.ts",
    "lib/product/p4/equipment-preference/equipment.types.ts",
    "lib/product/p4/equipment-preference/equipment.registry.ts",
    "lib/product/p4/budget-target/budget.types.ts",
    "lib/product/p4/budget-target/budget.registry.ts",
    "lib/product/p4/requirement-validation/validation.types.ts",
    "lib/product/p4/requirement-validation/validation.registry.ts",
    "lib/product/p4/requirement-validation/validation.readiness.ts",
    "lib/product/p4/requirement.manager.ts",
    "lib/product/p4/verify/product.release.gate.ts",
    "lib/product/p4/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P4_REQUIREMENT_COLLECTION_ID ===
      "enterprise-product-p4-requirement-collection-v1",
    "p4 requirement collection id",
  );
  check(
    PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION === "product-p4-1",
    "p4 requirement collection version",
  );
  check(
    PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION ===
      "product-p4-requirement-collection-freeze-1",
    "p4 requirement collection freeze",
  );
  check(
    PRODUCT_P4_REQUIREMENT_COLLECTION_BASE === PRODUCT_P3_AI_PROJECT_CREATION_ID,
    "p4 base = p3 ai project creation",
  );
  check(
    PRODUCT_P4_COLLECTION_FREEZE_VERSION ===
      "product-p4-requirement-collection-freeze-1",
    "p4 freeze tag",
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
  check(QUESTIONNAIRE_STATUSES.length === 4, "questionnaire statuses");
  check(SURVEY_STATUSES.length === 4, "survey statuses");
  check(STAKEHOLDER_ROLES.length === 6, "stakeholder roles");
  check(CONSTRAINT_KINDS.length === 5, "constraint kinds");
  check(SPACE_ANALYSIS_STATUSES.length === 3, "space analysis statuses");
  check(EQUIPMENT_PREFERENCE_LEVELS.length === 4, "equipment preference levels");
  check(BUDGET_TARGET_STATUSES.length === 4, "budget target statuses");
  check(VALIDATION_VERDICTS.length === 3, "validation verdicts");
  check(P4_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P4_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P4 Requirement Collection ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
