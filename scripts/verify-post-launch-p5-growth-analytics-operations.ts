/**
 * Post-Launch P5 — Growth Analytics Operations verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../lib/launch/signoff/governance.freeze.lock";
import { OPERATIONS_RELEASE_MANAGEMENT_ID } from "../lib/operations/release/release.constants";
import {
  EXPANSION_SIGNAL_KINDS,
  GROWTH_MANAGER_STATUSES,
  GROWTH_READINESS_VERDICTS,
  GROWTH_SIGNAL_STRENGTHS,
  GROWTH_TRENDS,
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
  OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION,
} from "../lib/operations/growth/growth.constants";
import {
  assertOperationsP5ReleaseGatePass,
  checkOperationsP5ReleaseGate,
} from "../lib/operations/growth/verify/growth.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/growth/growth.constants.ts",
    "lib/operations/growth/growth.types.ts",
    "lib/operations/growth/growth.usage.ts",
    "lib/operations/growth/growth.adoption.ts",
    "lib/operations/growth/growth.expansion.ts",
    "lib/operations/growth/growth.revenue.ts",
    "lib/operations/growth/growth.dashboard.ts",
    "lib/operations/growth/growth.readiness.ts",
    "lib/operations/growth/growth.manager.ts",
    "lib/operations/growth/verify/growth.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_GROWTH_ANALYTICS_ID ===
      "enterprise-post-launch-p5-growth-analytics-operations-v1",
    "growth analytics id",
  );
  check(
    OPERATIONS_GROWTH_ANALYTICS_VERSION === "operations-p5-1",
    "growth analytics version",
  );
  check(
    OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION ===
      "operations-growth-analytics-freeze-1",
    "growth analytics freeze",
  );
  check(
    OPERATIONS_GROWTH_ANALYTICS_BASE === OPERATIONS_RELEASE_MANAGEMENT_ID,
    "growth analytics base = p4 release management",
  );
  check(
    OPERATIONS_RELEASE_MANAGEMENT_ID ===
      "enterprise-post-launch-p4-release-management-operations-v1",
    "p4 release management freeze preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias preserved",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "commercial release complete preserved",
  );
  check(
    OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION ===
      "operations-p5-growth-analytics-operations-freeze-1",
    "p5 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(GROWTH_SIGNAL_STRENGTHS.length === 4, "signal strengths");
  check(EXPANSION_SIGNAL_KINDS.length === 5, "expansion kinds");
  check(GROWTH_TRENDS.length === 4, "growth trends");
  check(GROWTH_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(GROWTH_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP5ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P5 Growth Analytics Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
