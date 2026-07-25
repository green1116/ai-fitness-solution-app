/**
 * Product P8 — Tender Delivery verification
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
import { PRODUCT_P7_COLLABORATION_APPROVAL_ID } from "../lib/product/p7/collaboration/collaboration.constants";
import {
  DELIVERY_CHANNELS,
  DOCUMENT_KINDS,
  EXPORT_FORMATS,
  HANDOVER_STATUSES,
  P8_MANAGER_STATUSES,
  P8_READINESS_VERDICTS,
  PACKAGE_STATUSES,
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
  PRODUCT_P8_TENDER_FREEZE_VERSION,
  SUBMISSION_STATUSES,
  TENDER_STATUSES,
  TRACKING_EVENTS,
} from "../lib/product/p8/tender/tender.constants";
import {
  assertProductP8ReleaseGatePass,
  checkProductP8ReleaseGate,
} from "../lib/product/p8/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p8/tender/tender.constants.ts",
    "lib/product/p8/tender/tender.types.ts",
    "lib/product/p8/tender/tender.registry.ts",
    "lib/product/p8/tender/tender.readiness.ts",
    "lib/product/p8/delivery/delivery.types.ts",
    "lib/product/p8/delivery/delivery.registry.ts",
    "lib/product/p8/document/document.types.ts",
    "lib/product/p8/document/document.registry.ts",
    "lib/product/p8/export/export.types.ts",
    "lib/product/p8/export/export.registry.ts",
    "lib/product/p8/package/package.types.ts",
    "lib/product/p8/package/package.registry.ts",
    "lib/product/p8/submission/submission.types.ts",
    "lib/product/p8/submission/submission.registry.ts",
    "lib/product/p8/tracking/tracking.types.ts",
    "lib/product/p8/tracking/tracking.registry.ts",
    "lib/product/p8/handover/handover.types.ts",
    "lib/product/p8/handover/handover.registry.ts",
    "lib/product/p8/tender.manager.ts",
    "lib/product/p8/verify/product.release.gate.ts",
    "lib/product/p8/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P8_TENDER_DELIVERY_ID === "enterprise-product-p8-tender-delivery-v1",
    "p8 tender delivery id",
  );
  check(
    PRODUCT_P8_TENDER_DELIVERY_VERSION === "product-p8-1",
    "p8 tender delivery version",
  );
  check(
    PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION ===
      "product-p8-tender-delivery-freeze-1",
    "p8 tender delivery freeze",
  );
  check(
    PRODUCT_P8_TENDER_DELIVERY_BASE === PRODUCT_P7_COLLABORATION_APPROVAL_ID,
    "p8 base = p7 collaboration approval",
  );
  check(
    PRODUCT_P8_TENDER_FREEZE_VERSION === "product-p8-tender-delivery-freeze-1",
    "p8 freeze tag",
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
  check(TENDER_STATUSES.length === 6, "tender statuses");
  check(DELIVERY_CHANNELS.length === 5, "delivery channels");
  check(DOCUMENT_KINDS.length === 6, "document kinds");
  check(EXPORT_FORMATS.length === 5, "export formats");
  check(PACKAGE_STATUSES.length === 4, "package statuses");
  check(SUBMISSION_STATUSES.length === 4, "submission statuses");
  check(TRACKING_EVENTS.length === 6, "tracking events");
  check(HANDOVER_STATUSES.length === 4, "handover statuses");
  check(P8_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P8_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP8ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP8ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P8 Tender Delivery ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
