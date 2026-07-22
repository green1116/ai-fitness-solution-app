/**
 * Commercialization P2 — Product Packaging Foundation Release Gate
 * BASE: enterprise-commercialization-p1-sales-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or P1 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
} from "../../p1/sales/sales.constants";
import {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
  DELIVERY_MODELS,
  DELIVERY_SCOPES,
  PACKAGE_KINDS,
  PACKAGE_STATUSES,
  PACKAGING_MANAGER_STATUSES,
  PACKAGING_READINESS_VERDICTS,
  PRODUCT_STATUSES,
  TIER_LEVELS,
} from "../tier/tier.constants";
import { buildTierMatrix } from "../tier/tier.matrix";
import {
  assertPackagingFoundationReadinessReady,
  clearPackagingFoundationLayer,
  createPackagingFoundationManager,
  getPackagingRegistryManifest,
} from "../packaging.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const COMMERCIALIZATION_P2_SIGNOFF_VERSION =
  "commercialization-p2-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearPackagingFoundationLayer();
}

export function checkCommercializationP2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P2-CONSTANTS",
      "packaging",
      "Product packaging version constants",
      COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
        "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION ===
          "commercialization-p2-1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_BASE ===
          COMMERCIALIZATION_SALES_FOUNDATION_ID &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_BASE ===
          "enterprise-commercialization-p1-sales-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION ===
          "commercialization-product-packaging-foundation-freeze-1" &&
        COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION ===
          "commercialization-p2-product-packaging-foundation-freeze-1" &&
        PRODUCT_STATUSES.length === 3 &&
        PACKAGE_KINDS.length === 4 &&
        PACKAGE_STATUSES.length === 4 &&
        TIER_LEVELS.length === 4 &&
        DELIVERY_SCOPES.length === 4 &&
        DELIVERY_MODELS.length === 3 &&
        PACKAGING_READINESS_VERDICTS.length === 3 &&
        PACKAGING_MANAGER_STATUSES.length === 4 &&
        buildTierMatrix().length === 4,
      `id=${COMMERCIALIZATION_PRODUCT_PACKAGING_ID} base=${COMMERCIALIZATION_PRODUCT_PACKAGING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P2-P1-BASE",
      "sales",
      "P1 sales foundation freeze preserved as BASE",
      COMMERCIALIZATION_SALES_FOUNDATION_ID ===
        "enterprise-commercialization-p1-sales-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_BASE ===
          COMMERCIALIZATION_SALES_FOUNDATION_ID &&
        COMMERCIALIZATION_P1_SALES_FREEZE_VERSION ===
          "commercialization-p1-sales-foundation-freeze-1",
      `p1=${COMMERCIALIZATION_SALES_FOUNDATION_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P2-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createPackagingFoundationManager({
      managerId: "comm-p2-gate",
    });
    mgr.initialize();
    mgr.start();

    const product = mgr.registerProduct({
      id: "comm.p2.gate.product",
      name: "Enterprise Fitness Suite",
      sku: "EFS-CORE",
      category: "FITNESS",
      featureIds: ["workouts", "analytics", "coaching"],
      status: "DRAFT",
    });
    mgr.activateProduct(product.id);
    const catalog = mgr.catalogProduct({
      id: "comm.p2.gate.catalog",
      productId: product.id,
      featured: true,
      rank: 1,
    });
    const pkg = mgr.registerPackage({
      id: "comm.p2.gate.package",
      name: "Professional Bundle",
      productId: product.id,
      kind: "BUNDLE",
      tier: "PROFESSIONAL",
    });
    const composition = mgr.composePackage({
      id: "comm.p2.gate.composition",
      packageId: pkg.id,
    });
    const published = mgr.publishPackage(pkg.id);
    const scope = mgr.defineScope({
      id: "comm.p2.gate.scope",
      name: "Managed Onboarding",
      scope: "MANAGED",
      packageId: published.id,
    });
    const model = mgr.defineModel({
      id: "comm.p2.gate.model",
      name: "SaaS Delivery",
      model: "SAAS",
      packageId: published.id,
      scopeId: scope.id,
      regions: ["US_EAST", "EU_WEST"],
    });
    const readiness = mgr.evaluateReadiness();
    const registry = getPackagingRegistryManifest();

    const ok =
      catalog.featured === true &&
      composition.entitlementScore >= 50 &&
      published.status === "PUBLISHED" &&
      scope.onboardingIncluded === true &&
      model.slaTarget >= 99 &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_PRODUCT_PACKAGING_ID &&
      registry.base === COMMERCIALIZATION_PRODUCT_PACKAGING_BASE &&
      registry.productCount >= 1 &&
      registry.catalogCount >= 1 &&
      registry.packageCount >= 1 &&
      registry.compositionCount >= 1 &&
      registry.scopeCount >= 1 &&
      registry.modelCount >= 1;

    try {
      assertPackagingFoundationReadinessReady(readiness);
      checks.push(
        check(
          "COM-P2-STACK",
          "packaging",
          "Product / catalog / package / tier / delivery / readiness",
          ok,
          `score=${composition.entitlementScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P2-STACK",
          "packaging",
          "Product / catalog / package / tier / delivery / readiness",
          false,
          error instanceof Error
            ? error.message
            : "packaging foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P2-STACK",
        "packaging",
        "Product / catalog / package / tier / delivery / readiness",
        false,
        error instanceof Error
          ? error.message
          : "packaging foundation probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `commercialization-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP2ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P2 release gate failed: ${gate.summary}`,
    );
  }
}
