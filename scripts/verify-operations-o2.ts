/**
 * Operations O2 — Usage Intelligence Foundation verification
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
import { OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID } from "../lib/operations/o1/success/success.constants";
import {
  ACTIVITY_EVENT_KINDS,
  FEATURE_ADOPTION_LEVELS,
  O2_MANAGER_STATUSES,
  O2_READINESS_VERDICTS,
  OPERATIONS_O2_USAGE_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
  REPORT_KINDS,
  USAGE_STREAM_KINDS,
  VALUE_BANDS,
} from "../lib/operations/o2/usage/usage.constants";
import {
  assertOperationsO2ReleaseGatePass,
  checkOperationsO2ReleaseGate,
} from "../lib/operations/o2/verify/operations.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/o2/usage/usage.constants.ts",
    "lib/operations/o2/usage/usage.types.ts",
    "lib/operations/o2/usage/usage.registry.ts",
    "lib/operations/o2/usage/usage.tracking.ts",
    "lib/operations/o2/feature/feature.types.ts",
    "lib/operations/o2/feature/feature.adoption.ts",
    "lib/operations/o2/feature/feature.metrics.ts",
    "lib/operations/o2/activity/activity.types.ts",
    "lib/operations/o2/activity/activity.event.ts",
    "lib/operations/o2/activity/activity.analytics.ts",
    "lib/operations/o2/value/value.types.ts",
    "lib/operations/o2/value/value.score.ts",
    "lib/operations/o2/value/value.metrics.ts",
    "lib/operations/o2/report/report.types.ts",
    "lib/operations/o2/report/report.generator.ts",
    "lib/operations/o2/report/report.readiness.ts",
    "lib/operations/o2/usage.manager.ts",
    "lib/operations/o2/verify/operations.release.gate.ts",
    "lib/operations/o2/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID ===
      "enterprise-operations-o2-usage-intelligence-foundation-v1",
    "o2 usage intelligence foundation id",
  );
  check(
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION === "operations-o2-1",
    "o2 usage intelligence foundation version",
  );
  check(
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION ===
      "operations-o2-usage-intelligence-foundation-freeze-1",
    "o2 usage intelligence foundation freeze",
  );
  check(
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE ===
      OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
    "o2 base = o1 customer success foundation",
  );
  check(
    OPERATIONS_O2_USAGE_FREEZE_VERSION ===
      "operations-o2-usage-intelligence-foundation-freeze-1",
    "o2 freeze tag",
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
  check(USAGE_STREAM_KINDS.length === 4, "usage stream kinds");
  check(FEATURE_ADOPTION_LEVELS.length === 4, "feature adoption levels");
  check(ACTIVITY_EVENT_KINDS.length === 4, "activity event kinds");
  check(VALUE_BANDS.length === 4, "value bands");
  check(REPORT_KINDS.length === 4, "report kinds");
  check(O2_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(O2_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsO2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsO2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Operations O2 Usage Intelligence Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
