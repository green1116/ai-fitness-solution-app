/**
 * Product Iteration — Commercial Product Iteration Foundation verification
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
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../lib/product/complete/freeze/freeze.lock";
import {
  BACKLOG_PRIORITIES,
  CADENCE_KINDS,
  CYCLE_STATUSES,
  EXPERIMENT_STATUSES,
  IMPACT_BANDS,
  ITERATION_MANAGER_STATUSES,
  ITERATION_READINESS_VERDICTS,
  PRODUCT_ITERATION_FOUNDATION_BASE,
  PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ITERATION_FOUNDATION_ID,
  PRODUCT_ITERATION_FOUNDATION_VERSION,
  PRODUCT_ITERATION_FREEZE_VERSION,
  ROADMAP_HORIZONS,
} from "../lib/product/iteration/cycle/cycle.constants";
import {
  assertProductIterationReleaseGatePass,
  checkProductIterationReleaseGate,
} from "../lib/product/iteration/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/iteration/cycle/cycle.constants.ts",
    "lib/product/iteration/cycle/cycle.types.ts",
    "lib/product/iteration/cycle/cycle.registry.ts",
    "lib/product/iteration/cycle/cycle.readiness.ts",
    "lib/product/iteration/backlog/backlog.types.ts",
    "lib/product/iteration/backlog/backlog.registry.ts",
    "lib/product/iteration/experiment/experiment.types.ts",
    "lib/product/iteration/experiment/experiment.registry.ts",
    "lib/product/iteration/roadmap/roadmap.types.ts",
    "lib/product/iteration/roadmap/roadmap.registry.ts",
    "lib/product/iteration/impact/impact.types.ts",
    "lib/product/iteration/impact/impact.registry.ts",
    "lib/product/iteration/cadence/cadence.types.ts",
    "lib/product/iteration/cadence/cadence.registry.ts",
    "lib/product/iteration/iteration.manager.ts",
    "lib/product/iteration/verify/product.release.gate.ts",
    "lib/product/iteration/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ITERATION_FOUNDATION_ID ===
      "enterprise-product-iteration-foundation-v1",
    "iteration foundation id",
  );
  check(
    PRODUCT_ITERATION_FOUNDATION_VERSION === "product-iteration-1",
    "iteration foundation version",
  );
  check(
    PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION ===
      "product-iteration-foundation-freeze-1",
    "iteration foundation freeze",
  );
  check(
    PRODUCT_ITERATION_FOUNDATION_BASE === ENTERPRISE_PRODUCT_COMPLETE_ID,
    "iteration base = product complete",
  );
  check(
    PRODUCT_ITERATION_FREEZE_VERSION ===
      "product-iteration-foundation-freeze-1",
    "iteration freeze tag",
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
  check(CYCLE_STATUSES.length === 5, "cycle statuses");
  check(BACKLOG_PRIORITIES.length === 4, "backlog priorities");
  check(EXPERIMENT_STATUSES.length === 4, "experiment statuses");
  check(ROADMAP_HORIZONS.length === 3, "roadmap horizons");
  check(IMPACT_BANDS.length === 4, "impact bands");
  check(CADENCE_KINDS.length === 4, "cadence kinds");
  check(ITERATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ITERATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIterationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIterationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Iteration Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
