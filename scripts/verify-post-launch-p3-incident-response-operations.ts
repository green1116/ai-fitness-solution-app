/**
 * Post-Launch P3 — Incident Response Operations verification
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
import { OPERATIONS_CUSTOMER_SUCCESS_ID } from "../lib/operations/customer-success/success.constants";
import {
  ESCALATION_WORKFLOW_STEPS,
  INCIDENT_IMPACT_LEVELS,
  INCIDENT_MANAGER_STATUSES,
  INCIDENT_READINESS_VERDICTS,
  INCIDENT_URGENCY_LEVELS,
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
  OPERATIONS_INCIDENT_SEVERITIES,
  OPERATIONS_INCIDENT_STATUSES,
  OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION,
  RESOLUTION_OUTCOMES,
} from "../lib/operations/incident/incident.constants";
import {
  assertOperationsP3ReleaseGatePass,
  checkOperationsP3ReleaseGate,
} from "../lib/operations/incident/verify/incident.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/incident/incident.constants.ts",
    "lib/operations/incident/incident.types.ts",
    "lib/operations/incident/incident.model.ts",
    "lib/operations/incident/incident.severity.ts",
    "lib/operations/incident/incident.escalation.ts",
    "lib/operations/incident/incident.resolution.ts",
    "lib/operations/incident/incident.metrics.ts",
    "lib/operations/incident/incident.readiness.ts",
    "lib/operations/incident/incident.manager.ts",
    "lib/operations/incident/verify/incident.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_INCIDENT_RESPONSE_ID ===
      "enterprise-post-launch-p3-incident-response-operations-v1",
    "incident response id",
  );
  check(
    OPERATIONS_INCIDENT_RESPONSE_VERSION === "operations-p3-1",
    "incident response version",
  );
  check(
    OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION ===
      "operations-incident-response-freeze-1",
    "incident response freeze",
  );
  check(
    OPERATIONS_INCIDENT_RESPONSE_BASE === OPERATIONS_CUSTOMER_SUCCESS_ID,
    "incident response base = p2 customer success",
  );
  check(
    OPERATIONS_CUSTOMER_SUCCESS_ID ===
      "enterprise-post-launch-p2-customer-success-operations-v1",
    "p2 customer success freeze preserved",
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
    OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION ===
      "operations-p3-incident-response-operations-freeze-1",
    "p3 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(OPERATIONS_INCIDENT_SEVERITIES.length === 4, "severities");
  check(OPERATIONS_INCIDENT_STATUSES.length === 6, "statuses");
  check(INCIDENT_IMPACT_LEVELS.length === 4, "impact levels");
  check(INCIDENT_URGENCY_LEVELS.length === 4, "urgency levels");
  check(ESCALATION_WORKFLOW_STEPS.length === 7, "escalation steps");
  check(RESOLUTION_OUTCOMES.length === 5, "resolution outcomes");
  check(INCIDENT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(INCIDENT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P3 Incident Response Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
