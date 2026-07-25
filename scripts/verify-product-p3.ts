/**
 * Product P3 — AI Project Creation verification
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
import { PRODUCT_P2_ORGANIZATION_WORKSPACE_ID } from "../lib/product/p2/organization/organization.constants";
import {
  BRIEF_STATUSES,
  FACILITY_KINDS,
  GOAL_STATUSES,
  P3_MANAGER_STATUSES,
  P3_READINESS_VERDICTS,
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
  PRODUCT_P3_PROJECT_FREEZE_VERSION,
  PROJECT_STATUSES,
  PROJECT_TEMPLATE_KINDS,
  REQUIREMENT_PRIORITIES,
  SITE_STATUSES,
} from "../lib/product/p3/project/project.constants";
import {
  assertProductP3ReleaseGatePass,
  checkProductP3ReleaseGate,
} from "../lib/product/p3/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p3/project/project.constants.ts",
    "lib/product/p3/project/project.types.ts",
    "lib/product/p3/project/project.registry.ts",
    "lib/product/p3/project/project.readiness.ts",
    "lib/product/p3/project-template/template.types.ts",
    "lib/product/p3/project-template/template.registry.ts",
    "lib/product/p3/project-brief/brief.types.ts",
    "lib/product/p3/project-brief/brief.registry.ts",
    "lib/product/p3/site/site.types.ts",
    "lib/product/p3/site/site.registry.ts",
    "lib/product/p3/facility/facility.types.ts",
    "lib/product/p3/facility/facility.registry.ts",
    "lib/product/p3/requirement/requirement.types.ts",
    "lib/product/p3/requirement/requirement.registry.ts",
    "lib/product/p3/goal/goal.types.ts",
    "lib/product/p3/goal/goal.registry.ts",
    "lib/product/p3/project.manager.ts",
    "lib/product/p3/verify/product.release.gate.ts",
    "lib/product/p3/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P3_AI_PROJECT_CREATION_ID ===
      "enterprise-product-p3-ai-project-creation-v1",
    "p3 ai project creation id",
  );
  check(
    PRODUCT_P3_AI_PROJECT_CREATION_VERSION === "product-p3-1",
    "p3 ai project creation version",
  );
  check(
    PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION ===
      "product-p3-ai-project-creation-freeze-1",
    "p3 ai project creation freeze",
  );
  check(
    PRODUCT_P3_AI_PROJECT_CREATION_BASE === PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
    "p3 base = p2 organization workspace",
  );
  check(
    PRODUCT_P3_PROJECT_FREEZE_VERSION ===
      "product-p3-ai-project-creation-freeze-1",
    "p3 freeze tag",
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
  check(PROJECT_STATUSES.length === 6, "project statuses");
  check(PROJECT_TEMPLATE_KINDS.length === 5, "project template kinds");
  check(BRIEF_STATUSES.length === 4, "brief statuses");
  check(SITE_STATUSES.length === 3, "site statuses");
  check(FACILITY_KINDS.length === 6, "facility kinds");
  check(REQUIREMENT_PRIORITIES.length === 4, "requirement priorities");
  check(GOAL_STATUSES.length === 4, "goal statuses");
  check(P3_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P3_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P3 AI Project Creation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
