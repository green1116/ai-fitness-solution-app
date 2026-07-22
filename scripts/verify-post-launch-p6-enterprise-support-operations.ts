/**
 * Post-Launch P6 — Enterprise Support Operations verification
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
import { OPERATIONS_GROWTH_ANALYTICS_ID } from "../lib/operations/growth/growth.constants";
import {
  ESCALATION_ROUTES,
  KNOWLEDGE_ARTICLE_STATUSES,
  ENTERPRISE_SUPPORT_MANAGER_STATUSES,
  ENTERPRISE_SUPPORT_READINESS_VERDICTS,
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
  OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  SUPPORT_CASE_PRIORITIES,
  SUPPORT_CASE_STATUSES,
  SUPPORT_WORKFLOW_STEPS,
} from "../lib/operations/support/support.constants";
import {
  assertOperationsP6ReleaseGatePass,
  checkOperationsP6ReleaseGate,
} from "../lib/operations/support/verify/enterprise.support.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/support/support.constants.ts",
    "lib/operations/support/support.types.ts",
    "lib/operations/support/support.case.ts",
    "lib/operations/support/support.workflow.ts",
    "lib/operations/support/support.routing.ts",
    "lib/operations/support/support.knowledge.ts",
    "lib/operations/support/support.metrics.ts",
    "lib/operations/support/support.readiness.ts",
    "lib/operations/support/support.manager.ts",
    "lib/operations/support/verify/enterprise.support.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_ID ===
      "enterprise-post-launch-p6-enterprise-support-operations-v1",
    "enterprise support id",
  );
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_VERSION === "operations-p6-1",
    "enterprise support version",
  );
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION ===
      "operations-enterprise-support-freeze-1",
    "enterprise support freeze",
  );
  check(
    OPERATIONS_ENTERPRISE_SUPPORT_BASE === OPERATIONS_GROWTH_ANALYTICS_ID,
    "enterprise support base = p5 growth analytics",
  );
  check(
    OPERATIONS_GROWTH_ANALYTICS_ID ===
      "enterprise-post-launch-p5-growth-analytics-operations-v1",
    "p5 growth analytics freeze preserved",
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
    OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION ===
      "operations-p6-enterprise-support-operations-freeze-1",
    "p6 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(SUPPORT_CASE_PRIORITIES.length === 4, "priorities");
  check(SUPPORT_CASE_STATUSES.length === 6, "statuses");
  check(SUPPORT_WORKFLOW_STEPS.length === 6, "workflow steps");
  check(ESCALATION_ROUTES.length === 5, "escalation routes");
  check(KNOWLEDGE_ARTICLE_STATUSES.length === 3, "knowledge statuses");
  check(ENTERPRISE_SUPPORT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ENTERPRISE_SUPPORT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsP6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsP6ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Post-Launch P6 Enterprise Support Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
