/**
 * Product P6 — Budget & ROI verification
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
import { PRODUCT_P5_AI_PROPOSAL_GENERATION_ID } from "../lib/product/p5/proposal/proposal.constants";
import {
  BUDGET_STATUSES,
  COST_MODEL_KINDS,
  INVESTMENT_CATEGORIES,
  P6_MANAGER_STATUSES,
  P6_READINESS_VERDICTS,
  PRICING_MODELS,
  PRODUCT_P6_BUDGET_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_BASE,
  PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_ID,
  PRODUCT_P6_BUDGET_ROI_VERSION,
  ROI_STATUSES,
  SCENARIO_KINDS,
} from "../lib/product/p6/budget/budget.constants";
import {
  assertProductP6ReleaseGatePass,
  checkProductP6ReleaseGate,
} from "../lib/product/p6/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p6/budget/budget.constants.ts",
    "lib/product/p6/budget/budget.types.ts",
    "lib/product/p6/budget/budget.registry.ts",
    "lib/product/p6/budget/budget.readiness.ts",
    "lib/product/p6/cost-model/cost-model.types.ts",
    "lib/product/p6/cost-model/cost-model.registry.ts",
    "lib/product/p6/investment/investment.types.ts",
    "lib/product/p6/investment/investment.registry.ts",
    "lib/product/p6/roi/roi.types.ts",
    "lib/product/p6/roi/roi.registry.ts",
    "lib/product/p6/financial-summary/summary.types.ts",
    "lib/product/p6/financial-summary/summary.registry.ts",
    "lib/product/p6/scenario/scenario.types.ts",
    "lib/product/p6/scenario/scenario.registry.ts",
    "lib/product/p6/pricing/pricing.types.ts",
    "lib/product/p6/pricing/pricing.registry.ts",
    "lib/product/p6/budget.manager.ts",
    "lib/product/p6/verify/product.release.gate.ts",
    "lib/product/p6/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P6_BUDGET_ROI_ID === "enterprise-product-p6-budget-roi-v1",
    "p6 budget roi id",
  );
  check(
    PRODUCT_P6_BUDGET_ROI_VERSION === "product-p6-1",
    "p6 budget roi version",
  );
  check(
    PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION === "product-p6-budget-roi-freeze-1",
    "p6 budget roi freeze",
  );
  check(
    PRODUCT_P6_BUDGET_ROI_BASE === PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
    "p6 base = p5 ai proposal generation",
  );
  check(
    PRODUCT_P6_BUDGET_FREEZE_VERSION === "product-p6-budget-roi-freeze-1",
    "p6 freeze tag",
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
  check(BUDGET_STATUSES.length === 5, "budget statuses");
  check(COST_MODEL_KINDS.length === 5, "cost model kinds");
  check(INVESTMENT_CATEGORIES.length === 5, "investment categories");
  check(ROI_STATUSES.length === 3, "roi statuses");
  check(SCENARIO_KINDS.length === 4, "scenario kinds");
  check(PRICING_MODELS.length === 5, "pricing models");
  check(P6_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P6_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP6ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P6 Budget & ROI ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
