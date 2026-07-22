/**
 * Commercialization P2 — Product packaging readiness
 */

import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../p1/sales/sales.constants";
import { listDeliveryModels } from "./delivery/delivery.model";
import { listDeliveryScopes } from "./delivery/delivery.scope";
import { listPackageCompositions } from "./package/package.composer";
import { listProductPackages } from "./package/package.registry";
import { listProductCatalog } from "./product/product.catalog";
import { listCommercialProducts } from "./product/product.registry";
import { buildTierMatrix } from "./tier/tier.matrix";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_BASE } from "./tier/tier.constants";
import type {
  PackagingReadinessCheck,
  PackagingReadinessResult,
} from "./packaging.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): PackagingReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePackagingFoundationReadiness(): PackagingReadinessResult {
  const checks: PackagingReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P2-BASE",
      "foundation",
      "P1 sales foundation baseline aligned",
      COMMERCIALIZATION_PRODUCT_PACKAGING_BASE ===
        COMMERCIALIZATION_SALES_FOUNDATION_ID,
      `base=${COMMERCIALIZATION_PRODUCT_PACKAGING_BASE}`,
    ),
  );

  const products = listCommercialProducts({ status: "ACTIVE" });
  checks.push(
    check(
      "COM-P2-PRODUCT",
      "product",
      "Active products registered",
      products.length >= 1,
      `products=${products.length}`,
    ),
  );

  const catalog = listProductCatalog();
  checks.push(
    check(
      "COM-P2-CATALOG",
      "product",
      "Product catalog entries present",
      catalog.length >= 1,
      `catalog=${catalog.length}`,
    ),
  );

  const packages = listProductPackages();
  const composed = packages.filter(
    (p) => p.status === "COMPOSED" || p.status === "PUBLISHED",
  );
  checks.push(
    check(
      "COM-P2-PACKAGE",
      "package",
      "Composed packages present",
      composed.length >= 1,
      `composed=${composed.length}`,
    ),
  );

  const compositions = listPackageCompositions();
  checks.push(
    check(
      "COM-P2-COMPOSER",
      "package",
      "Package compositions present",
      compositions.length >= 1,
      `compositions=${compositions.length}`,
    ),
  );

  const matrix = buildTierMatrix();
  checks.push(
    check(
      "COM-P2-TIER",
      "tier",
      "Tier matrix complete",
      matrix.length === 4,
      `tiers=${matrix.length}`,
    ),
  );

  const scopes = listDeliveryScopes();
  checks.push(
    check(
      "COM-P2-SCOPE",
      "delivery",
      "Delivery scopes defined",
      scopes.length >= 1,
      `scopes=${scopes.length}`,
    ),
  );

  const models = listDeliveryModels();
  checks.push(
    check(
      "COM-P2-MODEL",
      "delivery",
      "Delivery models defined",
      models.length >= 1,
      `models=${models.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `packaging foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPackagingFoundationReadinessReady(
  result: PackagingReadinessResult,
): asserts result is PackagingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`packaging foundation not ready: ${result.summary}`);
  }
}
