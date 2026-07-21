/**
 * E12-P5 — API Productization Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { clearAdminConsoleLayer } from "../lib/product/e12/admin/admin.manager";
import {
  API_AUDIT_ACTIONS,
  API_CATALOG_STATUSES,
  API_KEY_STATUSES,
  API_MANAGER_STATUSES,
  API_PERMISSION_SCOPES,
  API_VERSIONS,
  DEVELOPER_ACCESS_STATUSES,
  E12_API_PRODUCT_BASE,
  E12_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_ID,
  E12_API_PRODUCT_VERSION,
  E12_P5_API_PRODUCT_FREEZE_VERSION,
} from "../lib/product/e12/api/api.constants";
import {
  clearApiProductLayer,
  createApiProductManager,
} from "../lib/product/e12/api/api.manager";
import { clearBillingCommercialLayer } from "../lib/product/e12/billing/billing.manager";
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
  clearTenantProductLayer,
  createTenantProductManager,
} from "../lib/product/e12/tenant/tenant.manager";
import {
  assertE12P5ReleaseGatePass,
  checkE12P5ReleaseGate,
} from "../lib/product/e12/verify/api.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/api/api.constants.ts",
    "lib/product/e12/api/api.types.ts",
    "lib/product/e12/api/api.catalog.ts",
    "lib/product/e12/api/api.key.ts",
    "lib/product/e12/api/api.developer.ts",
    "lib/product/e12/api/api.scope.ts",
    "lib/product/e12/api/api.usage.ts",
    "lib/product/e12/api/api.audit.ts",
    "lib/product/e12/api/api.manager.ts",
    "lib/product/e12/verify/api.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_API_PRODUCT_ID === "enterprise-e12-api-productization-v1",
    "api product id",
  );
  check(E12_API_PRODUCT_VERSION === "e12-api-1", "api version");
  check(
    E12_API_PRODUCT_FREEZE_VERSION === "e12-api-productization-freeze-1",
    "api freeze",
  );
  check(
    E12_API_PRODUCT_BASE === "enterprise-e12-p4-billing-commercial-v1",
    "api base",
  );
  check(
    E12_P5_API_PRODUCT_FREEZE_VERSION ===
      "e12-p5-api-productization-freeze-1",
    "p5 freeze",
  );
  check(API_CATALOG_STATUSES.length === 3, "catalog statuses");
  check(API_VERSIONS.length === 2, "api versions");
  check(API_KEY_STATUSES.length === 3, "key statuses");
  check(DEVELOPER_ACCESS_STATUSES.length === 3, "dev statuses");
  check(API_PERMISSION_SCOPES.length === 6, "scopes");
  check(API_AUDIT_ACTIONS.length === 7, "audit actions");
  check(API_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p5.verify.product",
    name: "AI Fitness API",
    sku: "AIFE-API-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);
  const executionFeature = listProductFeatures().find(
    (f) => f.capabilityRef === "e11.execution",
  );

  const edition = createProductEdition({
    id: "e12.p5.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: [
      ...new Set([
        ...(executionFeature ? [executionFeature.id] : []),
        ...included.slice(0, 5),
      ]),
    ],
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "e12.p5.verify.package",
    productId: product.id,
    name: "API Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");

  const tenantMgr = createTenantProductManager({
    managerId: "e12-p5-verify-tenant",
  });
  tenantMgr.initialize();
  tenantMgr.start();

  const workspace = tenantMgr.createWorkspace({
    id: "e12.p5.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-api-ws",
  });

  const tenant = tenantMgr.registerTenant({
    id: "e12.p5.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  tenantMgr.activateTenant(tenant.id);

  tenantMgr.bindSubscription({
    id: "e12.p5.verify.tenant.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: "e12.p5.verify.package",
  });

  return { product, edition, tenant, tenantMgr, executionFeature };
}

function testApiProductStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, tenant, executionFeature } = setupStack();

  const mgr = createApiProductManager({ managerId: "e12-p5-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const apiEntry = mgr.registerCatalogEntry({
    id: "e12.p5.verify.api",
    productId: product.id,
    name: "Fitness API",
    path: "/api/v1/fitness",
    version: "v1",
    requiredScope: "api:read",
    requiredEntitlementFeatureId: executionFeature?.id,
    rateLimit: 500,
  });
  check(apiEntry.status === "ACTIVE", "api active");

  const dev = mgr.registerDeveloper({
    id: "e12.p5.verify.dev",
    userId: "verify-dev-1",
    productTenantId: tenant.id,
    scopes: ["api:read", "api:write", "api:usage:read"],
  });
  check(dev.status === "ACTIVE", "developer active");

  const key = mgr.createKey({
    id: "e12.p5.verify.key",
    productTenantId: tenant.id,
    developerId: dev.id,
    name: "Verify Key",
    scopes: ["api:read"],
  });
  check(key.status === "ACTIVE", "key active");

  const scopeEval = mgr.evaluateScope({
    developerId: dev.id,
    scope: "api:read",
  });
  check(scopeEval.decision === "ALLOW", `scope: ${scopeEval.reason}`);

  const callAccess = mgr.evaluateCallAccess({
    apiKeyId: key.id,
    apiCatalogEntryId: apiEntry.id,
  });
  check(callAccess.decision === "ALLOW", `call: ${callAccess.reason}`);

  const denyScope = mgr.evaluateScope({
    developerId: dev.id,
    scope: "api:admin",
  });
  check(denyScope.decision === "DENY", "admin scope denied");

  mgr.recordUsage({
    productTenantId: tenant.id,
    developerId: dev.id,
    apiKeyId: key.id,
    apiCatalogEntryId: apiEntry.id,
    statusCode: 200,
    latencyMs: 35,
  });

  mgr.recordUsage({
    productTenantId: tenant.id,
    developerId: dev.id,
    apiKeyId: key.id,
    apiCatalogEntryId: apiEntry.id,
    statusCode: 201,
    latencyMs: 55,
  });

  const usageCount = mgr.usageCount({ productTenantId: tenant.id });
  check(usageCount >= 2, "usage recorded");

  const revokedKey = mgr.revokeKey(key.id);
  check(revokedKey.status === "REVOKED", "key revoked");

  const audits = mgr.listAudit({ productTenantId: tenant.id });
  check(audits.length >= 1, "audit trail");

  const manifest = mgr.manifest();
  check(manifest.apiProductId === E12_API_PRODUCT_ID, "manifest id");
  check(manifest.base === E12_API_PRODUCT_BASE, "manifest base");
  check(manifest.catalogEntryCount >= 1, "manifest catalog");
  check(manifest.developerCount >= 1, "manifest developers");

  mgr.stop();
  cleanup();
  console.log(
    "✓ catalog / key / developer / scope / usage / audit / manager",
  );
}

function testSignoff() {
  const gate = checkE12P5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P5ReleaseGatePass(gate);
  console.log("✓ api product release gate");
}

function main() {
  console.log("E12-P5 API Productization Layer verify");
  checkModules();
  checkConstants();
  testApiProductStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
