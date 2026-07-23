/**
 * Commercialization P8 — Freeze verification
 * Freeze Commercialization P1–P7 into commercialization complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../lib/commercialization/p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../lib/commercialization/p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../lib/commercialization/p3/pricing/pricing.constants";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../lib/commercialization/p4/onboarding/onboarding.constants";
import { COMMERCIALIZATION_DELIVERY_OPERATIONS_ID } from "../lib/commercialization/p5/delivery/delivery.constants";
import { COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID } from "../lib/commercialization/p6/kpi/kpi.constants";
import { COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID } from "../lib/commercialization/p7/governance/governance.constants";
import {
  assertCommercializationP8FinalVerificationPass,
  runCommercializationP8FinalVerification,
} from "../lib/commercialization/p8/release/release.verification";
import {
  COMMERCIALIZATION_COMPLETE_ID,
  COMMERCIALIZATION_P8_COMPONENT_LOCK,
  COMMERCIALIZATION_P8_FREEZE_BASE,
  COMMERCIALIZATION_P8_FREEZE_LOCK,
  COMMERCIALIZATION_P8_FREEZE_VERSION,
  COMMERCIALIZATION_P8_SIGNOFF_VERSION,
  ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  commercializationP8FreezeLockMatchesExpected,
  isCommercializationP8FreezeLockIntact,
} from "../lib/commercialization/p8/freeze/freeze.lock";
import {
  COMMERCIALIZATION_P8_EXPECTED_BASE_CHAIN,
  validateCommercializationP8DependencyChain,
} from "../lib/commercialization/p8/freeze/freeze.dependency";
import { assertCommercializationP8ReleaseGatePass } from "../lib/commercialization/p8/release/release.gate";
import {
  assertCommercializationImmutableManifestFrozen,
  buildCommercializationImmutableManifest,
} from "../lib/commercialization/p8/freeze/freeze.manifest";
import {
  buildCommercializationRollbackSnapshotIndex,
  getCommercializationRollbackSnapshotByLayer,
  COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES,
} from "../lib/commercialization/p8/rollback/rollback.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "commercialization-p8-freeze";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/commercialization/p8/freeze/freeze.lock.ts",
    "lib/commercialization/p8/freeze/freeze.manifest.ts",
    "lib/commercialization/p8/freeze/freeze.dependency.ts",
    "lib/commercialization/p8/release/release.gate.ts",
    "lib/commercialization/p8/release/release.verification.ts",
    "lib/commercialization/p8/rollback/rollback.snapshot.ts",
    "lib/commercialization/p8/rollback/rollback.index.ts",
    "lib/commercialization/p8/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_P8_FREEZE_VERSION ===
      "commercialization-p8-commercialization-freeze-1",
    "p8 freeze version",
  );
  check(
    COMMERCIALIZATION_P8_SIGNOFF_VERSION === "commercialization-p8-signoff-1",
    "p8 signoff",
  );
  check(
    COMMERCIALIZATION_P8_FREEZE_BASE ===
      "enterprise-commercialization-p7-commercial-governance-v1",
    "p8 freeze base",
  );
  check(
    COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete id",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete alias",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete integrated",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete integrated",
  );
  check(
    COMMERCIALIZATION_P8_FREEZE_LOCK.evolutionBaseline ===
      ENTERPRISE_EVOLUTION_COMPLETE_ID,
    "freeze lock evolution baseline",
  );
  check(
    COMMERCIALIZATION_P8_FREEZE_LOCK.launchBaseline ===
      ENTERPRISE_LAUNCH_COMPLETE_ID,
    "freeze lock launch baseline",
  );
  check(
    COMMERCIALIZATION_P8_FREEZE_LOCK.readOnly === true,
    "freeze lock readOnly",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "p1 id preserved",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "p2 id preserved",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "p3 id preserved",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
      "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
    "p4 id preserved",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
      "enterprise-commercialization-p5-delivery-operations-foundation-v1",
    "p5 id preserved",
  );
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID ===
      "enterprise-commercialization-p6-revenue-intelligence-v1",
    "p6 id preserved",
  );
  check(
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID ===
      "enterprise-commercialization-p7-commercial-governance-v1",
    "p7 id preserved",
  );
  check(
    COMMERCIALIZATION_P8_EXPECTED_BASE_CHAIN.freeze ===
      COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
    "expected freeze base = p7",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(COMMERCIALIZATION_P8_COMPONENT_LOCK.length === 8, "component lock=8");
  check(
    isCommercializationP8FreezeLockIntact() === true,
    "freeze lock intact",
  );
  check(
    commercializationP8FreezeLockMatchesExpected() === true,
    "freeze lock matches expected",
  );

  const chain = validateCommercializationP8DependencyChain();
  check(chain.ok === true, `dependency chain: ${chain.failures.join("; ")}`);

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkRollback() {
  const index = buildCommercializationRollbackSnapshotIndex();
  check(index.indexComplete === true, "rollback index complete");
  check(index.entryCount === 8, "rollback entries=8");
  check(index.readOnly === true, "rollback readOnly");
  check(
    COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES.length === 8,
    "snapshot entries=8",
  );
  check(
    getCommercializationRollbackSnapshotByLayer("P8")?.id === "COM-RS-P8",
    "p8 rollback entry",
  );
  console.log("✓ rollback snapshot index");
}

function checkGateAndManifest() {
  assertCommercializationP8ReleaseGatePass();
  const manifest = buildCommercializationImmutableManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  assertCommercializationImmutableManifestFrozen(manifest);
  check(manifest.freezeState.frozen === true, "manifest frozen");
  check(manifest.readOnly === true, "manifest immutable");

  const finalResult = runCommercializationP8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  assertCommercializationP8FinalVerificationPass(finalResult);
  check(finalResult.ok === true, `final verification: ${finalResult.summary}`);
  console.log("✓ release gate + immutable manifest + final verification");
  console.log(`  ${finalResult.summary}`);
}

function main() {
  console.log("=== Commercialization P8 Freeze ===");
  checkModules();
  checkConstants();
  checkRollback();
  checkGateAndManifest();
  console.log("ALL PASS");
}

main();
