/**
 * Product P7 — Collaboration & Approval verification
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
import { PRODUCT_P6_BUDGET_ROI_ID } from "../lib/product/p6/budget/budget.constants";
import {
  ACTIVITY_KINDS,
  APPROVAL_STATUSES,
  COLLABORATION_STATUSES,
  COMMENT_KINDS,
  DECISION_VERDICTS,
  NOTIFICATION_CHANNELS,
  P7_MANAGER_STATUSES,
  P7_READINESS_VERDICTS,
  PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
  PRODUCT_P7_COLLABORATION_APPROVAL_ID,
  PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
  PRODUCT_P7_COLLABORATION_FREEZE_VERSION,
  REVIEW_STATUSES,
  WORKFLOW_STEP_KINDS,
} from "../lib/product/p7/collaboration/collaboration.constants";
import {
  assertProductP7ReleaseGatePass,
  checkProductP7ReleaseGate,
} from "../lib/product/p7/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p7/collaboration/collaboration.constants.ts",
    "lib/product/p7/collaboration/collaboration.types.ts",
    "lib/product/p7/collaboration/collaboration.registry.ts",
    "lib/product/p7/collaboration/collaboration.readiness.ts",
    "lib/product/p7/comment/comment.types.ts",
    "lib/product/p7/comment/comment.registry.ts",
    "lib/product/p7/review/review.types.ts",
    "lib/product/p7/review/review.registry.ts",
    "lib/product/p7/approval/approval.types.ts",
    "lib/product/p7/approval/approval.registry.ts",
    "lib/product/p7/workflow/workflow.types.ts",
    "lib/product/p7/workflow/workflow.registry.ts",
    "lib/product/p7/notification/notification.types.ts",
    "lib/product/p7/notification/notification.registry.ts",
    "lib/product/p7/activity/activity.types.ts",
    "lib/product/p7/activity/activity.registry.ts",
    "lib/product/p7/decision/decision.types.ts",
    "lib/product/p7/decision/decision.registry.ts",
    "lib/product/p7/approval.manager.ts",
    "lib/product/p7/verify/product.release.gate.ts",
    "lib/product/p7/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P7_COLLABORATION_APPROVAL_ID ===
      "enterprise-product-p7-collaboration-approval-v1",
    "p7 collaboration approval id",
  );
  check(
    PRODUCT_P7_COLLABORATION_APPROVAL_VERSION === "product-p7-1",
    "p7 collaboration approval version",
  );
  check(
    PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION ===
      "product-p7-collaboration-approval-freeze-1",
    "p7 collaboration approval freeze",
  );
  check(
    PRODUCT_P7_COLLABORATION_APPROVAL_BASE === PRODUCT_P6_BUDGET_ROI_ID,
    "p7 base = p6 budget roi",
  );
  check(
    PRODUCT_P7_COLLABORATION_FREEZE_VERSION ===
      "product-p7-collaboration-approval-freeze-1",
    "p7 freeze tag",
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
  check(COLLABORATION_STATUSES.length === 5, "collaboration statuses");
  check(COMMENT_KINDS.length === 5, "comment kinds");
  check(REVIEW_STATUSES.length === 4, "review statuses");
  check(APPROVAL_STATUSES.length === 4, "approval statuses");
  check(WORKFLOW_STEP_KINDS.length === 5, "workflow step kinds");
  check(NOTIFICATION_CHANNELS.length === 4, "notification channels");
  check(ACTIVITY_KINDS.length === 6, "activity kinds");
  check(DECISION_VERDICTS.length === 4, "decision verdicts");
  check(P7_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P7_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP7ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P7 Collaboration & Approval ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
