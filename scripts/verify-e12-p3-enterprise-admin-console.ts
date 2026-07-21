/**
 * E12-P3 — Enterprise Admin Console Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_CONSOLE_MANAGER_STATUSES,
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_KINDS,
  E12_ADMIN_CONSOLE_BASE,
  E12_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_ID,
  E12_ADMIN_CONSOLE_VERSION,
  E12_P3_ADMIN_CONSOLE_FREEZE_VERSION,
  ORGANIZATION_STATUSES,
  PERMISSION_DECISIONS,
  PRODUCT_CONFIG_SCOPES,
} from "../lib/product/e12/admin/admin.constants";
import { createAdminConsoleManager, clearAdminConsoleLayer } from "../lib/product/e12/admin/admin.manager";
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
  assertE12P3ReleaseGatePass,
  checkE12P3ReleaseGate,
} from "../lib/product/e12/verify/admin.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/admin/admin.constants.ts",
    "lib/product/e12/admin/admin.types.ts",
    "lib/product/e12/admin/admin.organization.ts",
    "lib/product/e12/admin/admin.role.ts",
    "lib/product/e12/admin/admin.permission.ts",
    "lib/product/e12/admin/admin.tenant.ts",
    "lib/product/e12/admin/admin.config.ts",
    "lib/product/e12/admin/admin.audit.ts",
    "lib/product/e12/admin/admin.manager.ts",
    "lib/product/e12/verify/admin.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_ADMIN_CONSOLE_ID === "enterprise-e12-enterprise-admin-console-v1",
    "admin console id",
  );
  check(E12_ADMIN_CONSOLE_VERSION === "e12-admin-1", "admin version");
  check(
    E12_ADMIN_CONSOLE_FREEZE_VERSION === "e12-admin-console-freeze-1",
    "admin freeze",
  );
  check(
    E12_ADMIN_CONSOLE_BASE === "enterprise-e12-p2-saas-tenant-product-v1",
    "admin base",
  );
  check(
    E12_P3_ADMIN_CONSOLE_FREEZE_VERSION ===
      "e12-p3-enterprise-admin-console-freeze-1",
    "p3 freeze",
  );
  check(ORGANIZATION_STATUSES.length === 3, "org statuses");
  check(ADMIN_ROLE_KINDS.length === 4, "role kinds");
  check(ADMIN_PERMISSIONS.length === 10, "permissions");
  check(PERMISSION_DECISIONS.length === 2, "permission decisions");
  check(PRODUCT_CONFIG_SCOPES.length === 3, "config scopes");
  check(ADMIN_AUDIT_ACTIONS.length === 9, "audit actions");
  check(ADMIN_CONSOLE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(
    PLATFORM_V1_ID === "enterprise-platform-v1",
    "platform v1 intact",
  );
  console.log("✓ version constants");
}

function setupProductAndTenantStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p3.verify.product",
    name: "AI Fitness Admin",
    sku: "AIFE-ADM-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "e12.p3.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included,
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "e12.p3.verify.package",
    productId: product.id,
    name: "Standard Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 5),
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");

  const tenantMgr = createTenantProductManager({ managerId: "e12-p3-verify-tenant" });
  tenantMgr.initialize();
  tenantMgr.start();

  const workspace = tenantMgr.createWorkspace({
    id: "e12.p3.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-admin-ws",
  });

  const tenant = tenantMgr.registerTenant({
    id: "e12.p3.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  const activeTenant = tenantMgr.activateTenant(tenant.id);
  check(activeTenant.status === "ACTIVE", "tenant active");

  tenantMgr.bindSubscription({
    id: "e12.p3.verify.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: "e12.p3.verify.package",
  });

  return { product, tenant, tenantMgr };
}

function testAdminConsoleStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, tenant } = setupProductAndTenantStack();

  const mgr = createAdminConsoleManager({ managerId: "e12-p3-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const org = mgr.registerOrganization({
    id: "e12.p3.verify.org",
    name: "Verify Organization",
    slug: "verify-org",
    productId: product.id,
  });
  check(org.status === "ACTIVE", "org active");

  mgr.assignOrgAdmin({
    id: "e12.p3.verify.orgadmin",
    organizationId: org.id,
    userId: "verify-admin",
    email: "admin@verify.example",
  });

  mgr.assignRole({
    id: "e12.p3.verify.role",
    userId: "verify-admin",
    organizationId: org.id,
    role: "ORG_ADMIN",
  });

  const perm = mgr.evaluatePermission({
    userId: "verify-admin",
    permission: "tenant:read",
    organizationId: org.id,
  });
  check(perm.decision === "ALLOW", `permission: ${perm.reason}`);

  mgr.linkTenant(tenant.id, org.id);

  const summary = mgr.tenantSummary(tenant.id);
  check(summary.organizationId === org.id, "tenant linked");
  check(summary.entitlementCount >= 1, "entitlements visible");

  const cap = mgr.evaluateCapability({
    productTenantId: tenant.id,
    capabilityRef: "e11.execution",
  });
  check(cap.decision === "ALLOW", `capability: ${cap.reason}`);

  const config = mgr.setConfig({
    id: "e12.p3.verify.config",
    productId: product.id,
    scope: "ORGANIZATION",
    organizationId: org.id,
    key: "branding",
    value: { theme: "enterprise" },
    updatedBy: "verify-admin",
  });
  check(config.key === "branding", "config set");

  const audits = mgr.listAudit({ actorUserId: "verify-admin" });
  check(audits.length >= 1, "audit trail");

  const manifest = mgr.manifest();
  check(manifest.adminConsoleId === E12_ADMIN_CONSOLE_ID, "manifest id");
  check(manifest.base === E12_ADMIN_CONSOLE_BASE, "manifest base");
  check(manifest.organizationCount >= 1, "manifest org count");

  mgr.stop();
  cleanup();
  console.log(
    "✓ organization / role / permission / tenant / config / audit / manager",
  );
}

function testSignoff() {
  const gate = checkE12P3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P3ReleaseGatePass(gate);
  console.log("✓ admin console release gate");
}

function main() {
  console.log("E12-P3 Enterprise Admin Console Layer verify");
  checkModules();
  checkConstants();
  testAdminConsoleStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
