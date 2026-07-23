/**
 * Operations O4 — Growth Analytics Foundation verification
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
import { OPERATIONS_O3_SUPPORT_OPERATIONS_ID } from "../lib/operations/o3/ticket/ticket.constants";
import {
  COHORT_PERIODS,
  EXPANSION_SIGNAL_KINDS,
  FORECAST_HORIZONS,
  GROWTH_METRIC_KINDS,
  O4_MANAGER_STATUSES,
  O4_READINESS_VERDICTS,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
  OPERATIONS_O4_GROWTH_FREEZE_VERSION,
  RETENTION_BANDS,
} from "../lib/operations/o4/growth/growth.constants";
import {
  assertOperationsO4ReleaseGatePass,
  checkOperationsO4ReleaseGate,
} from "../lib/operations/o4/verify/operations.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/o4/growth/growth.constants.ts",
    "lib/operations/o4/growth/growth.types.ts",
    "lib/operations/o4/growth/growth.metrics.ts",
    "lib/operations/o4/growth/growth.tracker.ts",
    "lib/operations/o4/retention/retention.types.ts",
    "lib/operations/o4/retention/retention.score.ts",
    "lib/operations/o4/retention/retention.analysis.ts",
    "lib/operations/o4/expansion/expansion.types.ts",
    "lib/operations/o4/expansion/expansion.signal.ts",
    "lib/operations/o4/expansion/expansion.opportunity.ts",
    "lib/operations/o4/cohort/cohort.types.ts",
    "lib/operations/o4/cohort/cohort.analysis.ts",
    "lib/operations/o4/cohort/cohort.report.ts",
    "lib/operations/o4/forecast/forecast.types.ts",
    "lib/operations/o4/forecast/forecast.model.ts",
    "lib/operations/o4/forecast/forecast.prediction.ts",
    "lib/operations/o4/forecast/forecast.readiness.ts",
    "lib/operations/o4/growth.manager.ts",
    "lib/operations/o4/verify/operations.release.gate.ts",
    "lib/operations/o4/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID ===
      "enterprise-operations-o4-growth-analytics-foundation-v1",
    "o4 growth analytics foundation id",
  );
  check(
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION === "operations-o4-1",
    "o4 growth analytics foundation version",
  );
  check(
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION ===
      "operations-o4-growth-analytics-foundation-freeze-1",
    "o4 growth analytics foundation freeze",
  );
  check(
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE ===
      OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
    "o4 base = o3 support operations",
  );
  check(
    OPERATIONS_O4_GROWTH_FREEZE_VERSION ===
      "operations-o4-growth-analytics-foundation-freeze-1",
    "o4 freeze tag",
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
  check(GROWTH_METRIC_KINDS.length === 4, "growth metric kinds");
  check(RETENTION_BANDS.length === 4, "retention bands");
  check(EXPANSION_SIGNAL_KINDS.length === 4, "expansion signal kinds");
  check(COHORT_PERIODS.length === 3, "cohort periods");
  check(FORECAST_HORIZONS.length === 4, "forecast horizons");
  check(O4_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(O4_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsO4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsO4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Operations O4 Growth Analytics Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
