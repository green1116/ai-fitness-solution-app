/**
 * Product Marketplace Audit — M08-P7 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTEGRATION_GOVERNANCE_ID } from "../lib/product/integration-governance/management/management.constants";
import {
  MARKETPLACE_AUDIT_CATEGORIES,
  MARKETPLACE_AUDIT_INTEGRITY_VERDICTS,
  MARKETPLACE_AUDIT_MANAGER_STATUSES,
  MARKETPLACE_AUDIT_READINESS_VERDICTS,
  MARKETPLACE_AUDIT_SEVERITIES,
  MARKETPLACE_AUDIT_TRAIL_STATUSES,
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "../lib/product/marketplace-audit/management/management.constants";
import {
  assertProductMarketplaceAuditReleaseGatePass,
  checkProductMarketplaceAuditReleaseGate,
} from "../lib/product/marketplace-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/marketplace-audit/management/management.constants.ts",
    "lib/product/marketplace-audit/management/management.types.ts",
    "lib/product/marketplace-audit/management/management.readiness.ts",
    "lib/product/marketplace-audit/event/event.types.ts",
    "lib/product/marketplace-audit/event/event.registry.ts",
    "lib/product/marketplace-audit/trail/trail.types.ts",
    "lib/product/marketplace-audit/trail/trail.registry.ts",
    "lib/product/marketplace-audit/query/query.types.ts",
    "lib/product/marketplace-audit/query/query.registry.ts",
    "lib/product/marketplace-audit/integrity/integrity.types.ts",
    "lib/product/marketplace-audit/integrity/integrity.registry.ts",
    "lib/product/marketplace-audit/manifest/manifest.registry.ts",
    "lib/product/marketplace-audit/marketplace-audit.manager.ts",
    "lib/product/marketplace-audit/verify/product.release.gate.ts",
    "lib/product/marketplace-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_MARKETPLACE_AUDIT_ID ===
      "enterprise-product-marketplace-audit-v1",
    "marketplace audit id",
  );
  check(
    PRODUCT_MARKETPLACE_AUDIT_VERSION === "product-marketplace-audit-1",
    "marketplace audit version",
  );
  check(
    PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION ===
      "product-marketplace-audit-freeze-1",
    "marketplace audit freeze",
  );
  check(
    PRODUCT_MARKETPLACE_AUDIT_BASE === PRODUCT_INTEGRATION_GOVERNANCE_ID,
    "marketplace audit base = integration governance",
  );
  check(
    PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG ===
      "product-marketplace-audit-freeze-1",
    "marketplace audit freeze tag",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_ID ===
      "enterprise-product-integration-governance-v1",
    "integration governance preserved",
  );
  check(MARKETPLACE_AUDIT_CATEGORIES.length === 6, "audit categories");
  check(MARKETPLACE_AUDIT_SEVERITIES.length === 3, "audit severities");
  check(MARKETPLACE_AUDIT_TRAIL_STATUSES.length === 2, "trail statuses");
  check(
    MARKETPLACE_AUDIT_INTEGRITY_VERDICTS.length === 3,
    "integrity verdicts",
  );
  check(
    MARKETPLACE_AUDIT_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(MARKETPLACE_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMarketplaceAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMarketplaceAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Marketplace Audit (M08-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
