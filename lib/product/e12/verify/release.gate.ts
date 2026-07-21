/**
 * E12-P1 — Product Foundation Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  isProductFeatureCatalogComplete,
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../catalog/product.feature.catalog";
import {
  E12_P1_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_BASE,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
  FEATURE_CATEGORIES,
  PRODUCT_EDITION_KINDS,
  PRODUCT_STATUSES,
} from "../core/product.constants";
import { createProductFoundationManager } from "../core/product.manager";
import { createProductEdition } from "../edition/product.edition";
import { registerProductIdentity } from "../identity/product.identity";
import {
  assertProductFoundationReady,
  buildProductFoundation,
} from "../manifest/product.manifest";
import { createCapabilityPackage } from "../packaging/product.capability.package";
import { clearProductRegistry, getProductRegistryManifest } from "../registry/product.registry";

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

export const E12_P1_SIGNOFF_VERSION = "e12-p1-signoff-1" as const;

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
  clearProductRegistry();
}

export function checkE12P1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P1-CONSTANTS",
      "core",
      "Product foundation version constants",
      E12_PRODUCT_ID === "enterprise-e12-product-foundation-v1" &&
        E12_PRODUCT_VERSION === "e12-product-1" &&
        E12_PRODUCT_BASE === "enterprise-platform-v1-complete" &&
        E12_P1_PRODUCT_FREEZE_VERSION ===
          "e12-p1-product-foundation-freeze-1" &&
        PRODUCT_STATUSES.length === 4 &&
        PRODUCT_EDITION_KINDS.length === 4 &&
        FEATURE_CATEGORIES.length === 8,
      `id=${E12_PRODUCT_ID} base=${E12_PRODUCT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  try {
    cleanup();
    seedProductFeatureCatalog();

    const product = registerProductIdentity({
      id: "e12.p1.gate.product",
      name: "Enterprise Fitness Product",
      sku: "EFS-ENT-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "e12.p1.gate.edition",
      productId: product.id,
      kind: "ENTERPRISE",
      name: "Enterprise Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 100,
      maxRuntimes: 50,
    });

    const pkg = createCapabilityPackage({
      id: "e12.p1.gate.package",
      productId: product.id,
      name: "Core Capability Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds,
    });

    const foundation = buildProductFoundation();
    const registry = getProductRegistryManifest();

    const ok =
      foundation.ready === true &&
      foundation.platformAligned === true &&
      isProductFeatureCatalogComplete() &&
      product.platformBaseline === E12_PRODUCT_BASE &&
      edition.featureIds.length >= 1 &&
      pkg.capabilityRefs.length >= 1 &&
      registry.productId === E12_PRODUCT_ID &&
      registry.base === E12_PRODUCT_BASE &&
      foundation.identities.length >= 1;

    const mgr = createProductFoundationManager({ managerId: "e12-p1-gate" });
    mgr.initialize();
    mgr.start();

    checks.push(
      check(
        "PR-P1-STACK",
        "product",
        "Identity / edition / catalog / package / manifest",
        ok,
        foundation.summary,
      ),
    );

    try {
      assertProductFoundationReady(foundation);
      checks.push(
        check(
          "PR-P1-READY",
          "product",
          "Product foundation ready",
          true,
          "foundation ready",
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PR-P1-READY",
          "product",
          "Product foundation ready",
          false,
          error instanceof Error ? error.message : "not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P1-STACK",
        "product",
        "Identity / edition / catalog / package / manifest",
        false,
        error instanceof Error ? error.message : "product probe failed",
      ),
    );
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
      `e12-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P1ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P1 release gate failed: ${gate.summary}`);
  }
}
