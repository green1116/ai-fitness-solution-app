/**
 * E12-P3 — Enterprise Admin Console Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../catalog/product.feature.catalog";
import { E12_PRODUCT_BASE } from "../core/product.constants";
import { createProductEdition } from "../edition/product.edition";
import { registerProductIdentity } from "../identity/product.identity";
import { createCapabilityPackage } from "../packaging/product.capability.package";
import {
  clearProductRegistry,
  getProductRegistryManifest,
} from "../registry/product.registry";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
  getAdminConsoleRegistryManifest,
} from "../admin/admin.manager";
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
  PRODUCT_CONFIG_SCOPES,
} from "../admin/admin.constants";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P3_SIGNOFF_VERSION = "e12-p3-signoff-1" as const;

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
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P3-CONSTANTS",
      "admin",
      "Admin console layer version constants",
      E12_ADMIN_CONSOLE_ID === "enterprise-e12-enterprise-admin-console-v1" &&
        E12_ADMIN_CONSOLE_VERSION === "e12-admin-1" &&
        E12_ADMIN_CONSOLE_BASE === "enterprise-e12-p2-saas-tenant-product-v1" &&
        E12_ADMIN_CONSOLE_FREEZE_VERSION === "e12-admin-console-freeze-1" &&
        E12_P3_ADMIN_CONSOLE_FREEZE_VERSION ===
          "e12-p3-enterprise-admin-console-freeze-1" &&
        ORGANIZATION_STATUSES.length === 3 &&
        ADMIN_ROLE_KINDS.length === 4 &&
        ADMIN_PERMISSIONS.length === 10 &&
        PRODUCT_CONFIG_SCOPES.length === 3 &&
        ADMIN_AUDIT_ACTIONS.length === 9 &&
        ADMIN_CONSOLE_MANAGER_STATUSES.length === 4,
      `id=${E12_ADMIN_CONSOLE_ID} base=${E12_ADMIN_CONSOLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P3-PLATFORM",
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
      id: "e12.p3.gate.product",
      name: "Enterprise Fitness Admin",
      sku: "EFS-ADM-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const executionFeature = listProductFeatures().find(
      (f) => f.capabilityRef === "e11.execution",
    );

    const edition = createProductEdition({
      id: "e12.p3.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: [
        ...new Set([
          ...(executionFeature ? [executionFeature.id] : []),
          ...coreFeatures.slice(0, 5),
        ]),
      ],
      maxTenants: 50,
      maxRuntimes: 25,
    });

    const pkg = createCapabilityPackage({
      id: "e12.p3.gate.package",
      productId: product.id,
      name: "Admin Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.filter((fid) => fid.includes("runtime")),
    });

    const registry = getProductRegistryManifest();

    const tenantMgr = createTenantProductManager({ managerId: "e12-p3-gate-tenant" });
    tenantMgr.initialize();
    tenantMgr.start();

    const workspace = tenantMgr.createWorkspace({
      id: "e12.p3.gate.workspace",
      name: "Admin Workspace",
      slug: "admin-workspace",
    });

    const tenant = tenantMgr.registerTenant({
      id: "e12.p3.gate.tenant",
      name: "Admin Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    const activeTenant = tenantMgr.activateTenant(tenant.id);

    tenantMgr.bindSubscription({
      id: "e12.p3.gate.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: pkg.id,
    });

    const adminMgr = createAdminConsoleManager({ managerId: "e12-p3-gate" });
    adminMgr.initialize();
    adminMgr.start();

    const org = adminMgr.registerOrganization({
      id: "e12.p3.gate.org",
      name: "Gate Organization",
      slug: "gate-org",
      productId: product.id,
    });

    adminMgr.assignOrgAdmin({
      id: "e12.p3.gate.orgadmin",
      organizationId: org.id,
      userId: "admin-user-1",
      email: "admin@gate.example",
    });

    adminMgr.assignRole({
      id: "e12.p3.gate.role",
      userId: "admin-user-1",
      organizationId: org.id,
      role: "TENANT_ADMIN",
      productTenantId: tenant.id,
    });

    adminMgr.linkTenant(tenant.id, org.id);

    const perm = adminMgr.evaluatePermission({
      userId: "admin-user-1",
      permission: "tenant:read",
      organizationId: org.id,
      productTenantId: tenant.id,
    });

    const summary = adminMgr.tenantSummary(tenant.id);
    const cap = adminMgr.evaluateCapability({
      productTenantId: tenant.id,
      capabilityRef: "e11.execution",
    });

    const config = adminMgr.setConfig({
      id: "e12.p3.gate.config",
      productId: product.id,
      scope: "TENANT",
      productTenantId: tenant.id,
      key: "maxSessions",
      value: 100,
      updatedBy: "admin-user-1",
    });

    const audits = adminMgr.listAudit({ organizationId: org.id });
    const manifest = getAdminConsoleRegistryManifest();

    const ok =
      registry.identityCount >= 1 &&
      activeTenant.status === "ACTIVE" &&
      org.status === "ACTIVE" &&
      perm.decision === "ALLOW" &&
      summary.entitlementCount >= 1 &&
      cap.decision === "ALLOW" &&
      config.key === "maxSessions" &&
      audits.length >= 1 &&
      manifest.adminConsoleId === E12_ADMIN_CONSOLE_ID &&
      manifest.base === E12_ADMIN_CONSOLE_BASE;

    checks.push(
      check(
        "PR-P3-STACK",
        "admin",
        "Org / role / permission / tenant / config / audit",
        ok,
        `perm=${perm.decision} cap=${cap.decision} audits=${audits.length}`,
      ),
    );

    adminMgr.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P3-STACK",
        "admin",
        "Org / role / permission / tenant / config / audit",
        false,
        error instanceof Error ? error.message : "admin probe failed",
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
      `e12-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P3ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P3 release gate failed: ${gate.summary}`);
  }
}
