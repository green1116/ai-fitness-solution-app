/**
 * E12-P2 — SaaS Tenant Product Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../lib/product/e12/catalog/product.feature.catalog";
import { E12_PRODUCT_BASE } from "../lib/product/e12/core/product.constants";
import { createProductEdition } from "../lib/product/e12/edition/product.edition";
import { registerProductIdentity } from "../lib/product/e12/identity/product.identity";
import { createCapabilityPackage } from "../lib/product/e12/packaging/product.capability.package";
import {
  clearProductRegistry,
  getProductRegistryManifest,
} from "../lib/product/e12/registry/product.registry";
import {
  ACCESS_DECISIONS,
  E12_P2_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_BASE,
  E12_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_ID,
  E12_TENANT_PRODUCT_VERSION,
  ENTITLEMENT_STATUSES,
  PRODUCT_TENANT_STATUSES,
  SUBSCRIPTION_STATUSES,
  TENANT_PRODUCT_MANAGER_STATUSES,
  WORKSPACE_STATUSES,
} from "../lib/product/e12/tenant/tenant.constants";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../lib/product/e12/tenant/tenant.manager";
import {
  assertE12P2ReleaseGatePass,
  checkE12P2ReleaseGate,
} from "../lib/product/e12/verify/tenant.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/tenant/tenant.constants.ts",
    "lib/product/e12/tenant/tenant.types.ts",
    "lib/product/e12/tenant/tenant.workspace.ts",
    "lib/product/e12/tenant/tenant.product.ts",
    "lib/product/e12/tenant/tenant.subscription.ts",
    "lib/product/e12/tenant/tenant.entitlement.ts",
    "lib/product/e12/tenant/tenant.access.ts",
    "lib/product/e12/tenant/tenant.manager.ts",
    "lib/product/e12/verify/tenant.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_TENANT_PRODUCT_ID === "enterprise-e12-saas-tenant-product-v1",
    "tenant product id",
  );
  check(E12_TENANT_PRODUCT_VERSION === "e12-tenant-1", "tenant version");
  check(
    E12_TENANT_PRODUCT_FREEZE_VERSION === "e12-tenant-product-freeze-1",
    "tenant freeze",
  );
  check(
    E12_TENANT_PRODUCT_BASE === "enterprise-e12-p1-product-foundation-v1",
    "tenant base",
  );
  check(
    E12_P2_TENANT_PRODUCT_FREEZE_VERSION ===
      "e12-p2-saas-tenant-product-freeze-1",
    "p2 freeze",
  );
  check(WORKSPACE_STATUSES.length === 3, "workspace statuses");
  check(PRODUCT_TENANT_STATUSES.length === 4, "tenant statuses");
  check(SUBSCRIPTION_STATUSES.length === 4, "subscription statuses");
  check(ENTITLEMENT_STATUSES.length === 3, "entitlement statuses");
  check(ACCESS_DECISIONS.length === 2, "access decisions");
  check(TENANT_PRODUCT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(
    PLATFORM_V1_ID === "enterprise-platform-v1",
    "platform v1 intact",
  );
  console.log("✓ version constants");
}

function testTenantProductStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p2.verify.product",
    name: "AI Fitness SaaS",
    sku: "AIFE-SAAS-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "e12.p2.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included,
    maxTenants: 20,
    maxRuntimes: 10,
  });

  const pkg = createCapabilityPackage({
    id: "e12.p2.verify.package",
    productId: product.id,
    name: "Standard Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 5),
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");
  check(registry.editionCount >= 1, "registry editions");
  check(registry.packageCount >= 1, "registry packages");

  const mgr = createTenantProductManager({ managerId: "e12-p2-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const workspace = mgr.createWorkspace({
    id: "e12.p2.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-workspace",
  });
  check(workspace.status === "ACTIVE", "workspace active");

  const tenant = mgr.registerTenant({
    id: "e12.p2.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  check(tenant.status === "PROVISIONING", "tenant provisioning");

  const active = mgr.activateTenant(tenant.id);
  check(active.status === "ACTIVE", "tenant active");

  const sub = mgr.bindSubscription({
    id: "e12.p2.verify.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: pkg.id,
  });
  check(sub.status === "ACTIVE", "subscription active");

  const ents = mgr.listEntitlements({
    productTenantId: tenant.id,
    status: "GRANTED",
  });
  check(ents.length >= 1, "entitlements granted");

  const allow = mgr.evaluateAccess({
    productTenantId: tenant.id,
    capabilityRef: "e11.execution",
  });
  check(allow.decision === "ALLOW", `access allow: ${allow.reason}`);

  const deny = mgr.evaluateAccess({
    productTenantId: tenant.id,
    capabilityRef: "e99.unknown",
  });
  check(deny.decision === "DENY", `access deny: ${deny.reason}`);

  const caps = mgr.allowedCapabilities(tenant.id);
  check(caps.length >= 1, "allowed capabilities");

  const manifest = mgr.manifest();
  check(manifest.tenantProductId === E12_TENANT_PRODUCT_ID, "manifest id");
  check(manifest.base === E12_TENANT_PRODUCT_BASE, "manifest base");
  check(manifest.tenantCount >= 1, "manifest tenant count");

  mgr.stop();
  cleanup();
  console.log(
    "✓ workspace / tenant / subscription / entitlement / access / manager",
  );
}

function testSignoff() {
  const gate = checkE12P2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P2ReleaseGatePass(gate);
  console.log("✓ tenant product release gate");
}

function main() {
  console.log("E12-P2 SaaS Tenant Product Layer verify");
  checkModules();
  checkConstants();
  testTenantProductStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
