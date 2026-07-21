/**
 * E12-P1 — Enterprise Product Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  PRODUCT_FEATURE_CATALOG,
  isProductFeatureCatalogComplete,
  listProductFeatures,
} from "../lib/product/e12/catalog/product.feature.catalog";
import {
  CAPABILITY_PACKAGE_KINDS,
  E12_P1_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
  FEATURE_AVAILABILITY,
  FEATURE_CATEGORIES,
  PRODUCT_EDITION_KINDS,
  PRODUCT_MANAGER_STATUSES,
  PRODUCT_STATUSES,
} from "../lib/product/e12/core/product.constants";
import { createProductFoundationManager } from "../lib/product/e12/core/product.manager";
import {
  assertProductFoundationReady,
  buildProductFoundation,
} from "../lib/product/e12/manifest/product.manifest";
import { getProductRegistryManifest, clearProductRegistry } from "../lib/product/e12/registry/product.registry";
import {
  assertE12P1ReleaseGatePass,
  checkE12P1ReleaseGate,
} from "../lib/product/e12/verify/release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/core/product.constants.ts",
    "lib/product/e12/types/product.types.ts",
    "lib/product/e12/identity/product.identity.ts",
    "lib/product/e12/edition/product.edition.ts",
    "lib/product/e12/catalog/product.feature.catalog.ts",
    "lib/product/e12/packaging/product.capability.package.ts",
    "lib/product/e12/registry/product.registry.ts",
    "lib/product/e12/manifest/product.manifest.ts",
    "lib/product/e12/core/product.manager.ts",
    "lib/product/e12/verify/release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_PRODUCT_ID === "enterprise-e12-product-foundation-v1",
    "product id",
  );
  check(E12_PRODUCT_VERSION === "e12-product-1", "product version");
  check(
    E12_PRODUCT_FREEZE_VERSION === "e12-product-freeze-1",
    "product freeze",
  );
  check(
    E12_PRODUCT_BASE === "enterprise-platform-v1-complete",
    "product base",
  );
  check(
    E12_P1_PRODUCT_FREEZE_VERSION ===
      "e12-p1-product-foundation-freeze-1",
    "p1 freeze",
  );
  check(PRODUCT_STATUSES.length === 4, "statuses");
  check(PRODUCT_EDITION_KINDS.length === 4, "edition kinds");
  check(FEATURE_CATEGORIES.length === 8, "feature categories");
  check(FEATURE_AVAILABILITY.length === 4, "availability");
  check(CAPABILITY_PACKAGE_KINDS.length === 3, "package kinds");
  check(PRODUCT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(
    PLATFORM_V1_ID === "enterprise-platform-v1",
    "platform v1 intact",
  );
  console.log("✓ version constants");
}

function testProductFoundationStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const mgr = createProductFoundationManager({ managerId: "e12-p1-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const seeded = mgr.seedCatalog();
  check(seeded === PRODUCT_FEATURE_CATALOG.length, "catalog seeded");
  check(isProductFeatureCatalogComplete(), "catalog complete");

  const product = mgr.registerIdentity({
    id: "e12.verify.product",
    name: "AI Fitness Enterprise",
    sku: "AIFE-ENT-001",
    description: "Enterprise fitness product",
    platformBaseline: E12_PRODUCT_BASE,
  });
  check(product.status === "ACTIVE", "product active");
  check(product.platformBaseline === E12_PRODUCT_BASE, "product baseline");

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = mgr.createEdition({
    id: "e12.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included,
    maxTenants: 10,
    maxRuntimes: 5,
  });
  check(edition.featureIds.length >= 1, "edition features");

  const pkg = mgr.createPackage({
    id: "e12.verify.package",
    productId: product.id,
    name: "Standard Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 5),
  });
  check(pkg.capabilityRefs.length >= 1, "package capability refs");

  const foundation = mgr.foundation();
  check(foundation.ready === true, `foundation: ${foundation.summary}`);
  check(foundation.platformAligned === true, "foundation platform");
  check(foundation.features.length >= 10, "foundation features");
  assertProductFoundationReady(foundation);

  const registry = getProductRegistryManifest();
  check(registry.productId === E12_PRODUCT_ID, "registry id");
  check(registry.base === E12_PRODUCT_BASE, "registry base");
  check(registry.identityCount >= 1, "registry identities");

  mgr.stop();
  cleanup();
  console.log("✓ identity / edition / catalog / package / manifest");
}

function testSignoff() {
  const gate = checkE12P1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P1ReleaseGatePass(gate);
  console.log("✓ product foundation release gate");
}

function main() {
  console.log("E12-P1 Enterprise Product Foundation verify");
  checkModules();
  checkConstants();
  testProductFoundationStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
