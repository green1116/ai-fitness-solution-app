/**
 * E12-P5 — API Productization Release Gate
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
import { clearProductRegistry, getProductRegistryManifest } from "../registry/product.registry";
import { clearAdminConsoleLayer } from "../admin/admin.manager";
import { clearBillingCommercialLayer } from "../billing/billing.manager";
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
} from "../api/api.constants";
import {
  clearApiProductLayer,
  createApiProductManager,
  getApiProductRegistryManifest,
} from "../api/api.manager";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P5_SIGNOFF_VERSION = "e12-p5-signoff-1" as const;

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
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P5-CONSTANTS",
      "api",
      "API product layer version constants",
      E12_API_PRODUCT_ID === "enterprise-e12-api-productization-v1" &&
        E12_API_PRODUCT_VERSION === "e12-api-1" &&
        E12_API_PRODUCT_BASE === "enterprise-e12-p4-billing-commercial-v1" &&
        E12_API_PRODUCT_FREEZE_VERSION === "e12-api-productization-freeze-1" &&
        E12_P5_API_PRODUCT_FREEZE_VERSION ===
          "e12-p5-api-productization-freeze-1" &&
        API_CATALOG_STATUSES.length === 3 &&
        API_VERSIONS.length === 2 &&
        API_KEY_STATUSES.length === 3 &&
        DEVELOPER_ACCESS_STATUSES.length === 3 &&
        API_PERMISSION_SCOPES.length === 6 &&
        API_AUDIT_ACTIONS.length === 7 &&
        API_MANAGER_STATUSES.length === 4,
      `id=${E12_API_PRODUCT_ID} base=${E12_API_PRODUCT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P5-PLATFORM",
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
      id: "e12.p5.gate.product",
      name: "Enterprise Fitness API",
      sku: "EFS-API-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const executionFeature = listProductFeatures().find(
      (f) => f.capabilityRef === "e11.execution",
    );

    const edition = createProductEdition({
      id: "e12.p5.gate.edition",
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

    createCapabilityPackage({
      id: "e12.p5.gate.package",
      productId: product.id,
      name: "API Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const registry = getProductRegistryManifest();

    const tenantMgr = createTenantProductManager({ managerId: "e12-p5-gate-tenant" });
    tenantMgr.initialize();
    tenantMgr.start();

    const workspace = tenantMgr.createWorkspace({
      id: "e12.p5.gate.workspace",
      name: "API Workspace",
      slug: "api-gate-ws",
    });

    const tenant = tenantMgr.registerTenant({
      id: "e12.p5.gate.tenant",
      name: "API Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    tenantMgr.bindSubscription({
      id: "e12.p5.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "e12.p5.gate.package",
    });

    const apiMgr = createApiProductManager({ managerId: "e12-p5-gate" });
    apiMgr.initialize();
    apiMgr.start();

    const apiEntry = apiMgr.registerCatalogEntry({
      id: "e12.p5.gate.api",
      productId: product.id,
      name: "Fitness API",
      path: "/api/v1/fitness",
      version: "v1",
      requiredScope: "api:read",
      requiredEntitlementFeatureId: executionFeature?.id,
      rateLimit: 500,
    });

    const dev = apiMgr.registerDeveloper({
      id: "e12.p5.gate.dev",
      userId: "api-dev-1",
      productTenantId: tenant.id,
      scopes: ["api:read", "api:write"],
    });

    const key = apiMgr.createKey({
      id: "e12.p5.gate.key",
      productTenantId: tenant.id,
      developerId: dev.id,
      name: "Gate Key",
      scopes: ["api:read"],
    });

    const callAccess = apiMgr.evaluateCallAccess({
      apiKeyId: key.id,
      apiCatalogEntryId: apiEntry.id,
    });

    const scopeEval = apiMgr.evaluateScope({
      developerId: dev.id,
      scope: "api:read",
    });

    apiMgr.recordUsage({
      productTenantId: tenant.id,
      developerId: dev.id,
      apiKeyId: key.id,
      apiCatalogEntryId: apiEntry.id,
      statusCode: 200,
      latencyMs: 42,
    });

    const usageCount = apiMgr.usageCount({ productTenantId: tenant.id });
    const audits = apiMgr.listAudit({ productTenantId: tenant.id });
    const manifest = getApiProductRegistryManifest();

    const ok =
      registry.identityCount >= 1 &&
      apiEntry.status === "ACTIVE" &&
      dev.status === "ACTIVE" &&
      key.status === "ACTIVE" &&
      callAccess.decision === "ALLOW" &&
      scopeEval.decision === "ALLOW" &&
      usageCount >= 1 &&
      audits.length >= 1 &&
      manifest.apiProductId === E12_API_PRODUCT_ID &&
      manifest.base === E12_API_PRODUCT_BASE;

    checks.push(
      check(
        "PR-P5-STACK",
        "api",
        "Catalog / key / developer / scope / usage / audit",
        ok,
        `call=${callAccess.decision} scope=${scopeEval.decision} usage=${usageCount} audits=${audits.length}`,
      ),
    );

    apiMgr.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P5-STACK",
        "api",
        "Catalog / key / developer / scope / usage / audit",
        false,
        error instanceof Error ? error.message : "api probe failed",
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
      `e12-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P5ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P5 release gate failed: ${gate.summary}`);
  }
}
