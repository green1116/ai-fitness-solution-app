/**
 * Launch L3 — Production Hardening verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../lib/launch/readiness/l1/demo/demo.constants";
import {
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
} from "../lib/launch/readiness/l2/pilot/pilot.constants";
import {
  ALERT_SEVERITIES,
  AUDIT_EVENT_KINDS,
  BACKUP_STATUSES,
  HEALTH_LEVELS,
  L3_MANAGER_STATUSES,
  L3_READINESS_VERDICTS,
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
  METRIC_KINDS,
  RUNTIME_STATUSES,
  SECURITY_CHECK_RESULTS,
  SECURITY_POLICY_SCOPES,
} from "../lib/launch/readiness/l3/runtime/runtime.constants";
import {
  assertLaunchL3ReleaseGatePass,
  checkLaunchL3ReleaseGate,
} from "../lib/launch/readiness/l3/verify/launch.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/launch/readiness/l3/runtime/runtime.constants.ts",
    "lib/launch/readiness/l3/runtime/runtime.types.ts",
    "lib/launch/readiness/l3/runtime/runtime.status.ts",
    "lib/launch/readiness/l3/runtime/runtime.health.ts",
    "lib/launch/readiness/l3/security/security.types.ts",
    "lib/launch/readiness/l3/security/security.policy.ts",
    "lib/launch/readiness/l3/security/security.check.ts",
    "lib/launch/readiness/l3/monitoring/monitoring.types.ts",
    "lib/launch/readiness/l3/monitoring/monitoring.metric.ts",
    "lib/launch/readiness/l3/monitoring/monitoring.alert.ts",
    "lib/launch/readiness/l3/audit/audit.types.ts",
    "lib/launch/readiness/l3/audit/audit.event.ts",
    "lib/launch/readiness/l3/audit/audit.trail.ts",
    "lib/launch/readiness/l3/backup/backup.types.ts",
    "lib/launch/readiness/l3/backup/backup.snapshot.ts",
    "lib/launch/readiness/l3/backup/backup.restore.ts",
    "lib/launch/readiness/l3/backup/backup.readiness.ts",
    "lib/launch/readiness/l3/hardening.manager.ts",
    "lib/launch/readiness/l3/verify/launch.release.gate.ts",
    "lib/launch/readiness/l3/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_ID ===
      "enterprise-launch-l3-production-hardening-v1",
    "l3 production hardening id",
  );
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_VERSION === "launch-l3-1",
    "l3 production hardening version",
  );
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION ===
      "launch-l3-production-hardening-freeze-1",
    "l3 production hardening freeze",
  );
  check(
    LAUNCH_L3_PRODUCTION_HARDENING_BASE === LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
    "l3 base = l2 pilot customer flow",
  );
  check(
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
      "enterprise-launch-l2-pilot-customer-flow-v1",
    "l2 freeze preserved",
  );
  check(
    LAUNCH_L2_PILOT_FREEZE_VERSION ===
      "launch-l2-pilot-customer-flow-freeze-1",
    "l2 freeze tag preserved",
  );
  check(
    LAUNCH_L1_DEMO_FOUNDATION_ID ===
      "enterprise-launch-l1-demo-foundation-v1",
    "l1 freeze preserved",
  );
  check(
    LAUNCH_L3_HARDENING_FREEZE_VERSION ===
      "launch-l3-production-hardening-freeze-1",
    "l3 freeze tag",
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
  check(RUNTIME_STATUSES.length === 4, "runtime statuses");
  check(HEALTH_LEVELS.length === 4, "health levels");
  check(SECURITY_POLICY_SCOPES.length === 4, "security policy scopes");
  check(SECURITY_CHECK_RESULTS.length === 3, "security check results");
  check(METRIC_KINDS.length === 4, "metric kinds");
  check(ALERT_SEVERITIES.length === 3, "alert severities");
  check(AUDIT_EVENT_KINDS.length === 4, "audit event kinds");
  check(BACKUP_STATUSES.length === 4, "backup statuses");
  check(L3_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(L3_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkLaunchL3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertLaunchL3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Launch L3 Production Hardening ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
