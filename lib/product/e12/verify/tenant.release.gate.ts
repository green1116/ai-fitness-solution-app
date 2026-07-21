/**
 * E12-P2 — SaaS Tenant Product Release Gate
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
import {
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
} from "../tenant/tenant.constants";
import {
  clearTenantProductLayer,
  createTenantProductManager,
  getTenantProductRegistryManifest,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P2_SIGNOFF_VERSION = "e12-p2-signoff-1" as const;

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
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P2-CONSTANTS",
      "tenant",
      "Tenant product layer version constants",
      E12_TENANT_PRODUCT_ID === "enterprise-e12-saas-tenant-product-v1" &&
        E12_TENANT_PRODUCT_VERSION === "e12-tenant-1" &&
        E12_TENANT_PRODUCT_BASE === "enterprise-e12-p1-product-foundation-v1" &&
        E12_TENANT_PRODUCT_FREEZE_VERSION === "e12-tenant-product-freeze-1" &&
        E12_P2_TENANT_PRODUCT_FREEZE_VERSION ===
          "e12-p2-saas-tenant-product-freeze-1" &&
        WORKSPACE_STATUSES.length === 3 &&
        PRODUCT_TENANT_STATUSES.length === 4 &&
        SUBSCRIPTION_STATUSES.length === 4 &&
        ENTITLEMENT_STATUSES.length === 3 &&
        TENANT_PRODUCT_MANAGER_STATUSES.length === 4,
      `id=${E12_TENANT_PRODUCT_ID} base=${E12_TENANT_PRODUCT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P2-PLATFORM",
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
      id: "e12.p2.gate.product",
      name: "Enterprise Fitness SaaS",
      sku: "EFS-SAAS-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const executionFeature = listProductFeatures().find(
      (f) => f.capabilityRef === "e11.execution",
    );

    const edition = createProductEdition({
      id: "e12.p2.gate.edition",
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
      id: "e12.p2.gate.package",
      productId: product.id,
      name: "Runtime Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.filter((fid) =>
        fid.includes("runtime"),
      ),
    });

    const registry = getProductRegistryManifest();
    const mgr = createTenantProductManager({ managerId: "e12-p2-gate" });
    mgr.initialize();
    mgr.start();

    const workspace = mgr.createWorkspace({
      id: "e12.p2.gate.workspace",
      name: "Gate Workspace",
      slug: "gate-workspace",
    });

    const tenant = mgr.registerTenant({
      id: "e12.p2.gate.tenant",
      name: "Gate Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    const activeTenant = mgr.activateTenant(tenant.id);

    const sub = mgr.bindSubscription({
      id: "e12.p2.gate.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: pkg.id,
    });

    const entitlements = mgr.listEntitlements({
      productTenantId: tenant.id,
      status: "GRANTED",
    });

    const allowExec = mgr.evaluateAccess({
      productTenantId: tenant.id,
      capabilityRef: "e11.execution",
    });
    const denyUnknown = mgr.evaluateAccess({
      productTenantId: tenant.id,
      capabilityRef: "e99.unknown",
    });

    const manifest = getTenantProductRegistryManifest();
    const allowed = mgr.allowedCapabilities(tenant.id);

    const ok =
      registry.productId !== undefined &&
      registry.identityCount >= 1 &&
      edition.featureIds.length >= 1 &&
      pkg.capabilityRefs.length >= 1 &&
      workspace.status === "ACTIVE" &&
      activeTenant.status === "ACTIVE" &&
      sub.status === "ACTIVE" &&
      entitlements.length >= 1 &&
      allowExec.decision === "ALLOW" &&
      denyUnknown.decision === "DENY" &&
      allowed.length >= 1 &&
      manifest.tenantProductId === E12_TENANT_PRODUCT_ID &&
      manifest.base === E12_TENANT_PRODUCT_BASE;

    checks.push(
      check(
        "PR-P2-STACK",
        "tenant",
        "Workspace / tenant / subscription / entitlement / access",
        ok,
        `ents=${entitlements.length} allow=${allowExec.decision} caps=${allowed.length}`,
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P2-STACK",
        "tenant",
        "Workspace / tenant / subscription / entitlement / access",
        false,
        error instanceof Error ? error.message : "tenant probe failed",
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
      `e12-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P2ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P2 release gate failed: ${gate.summary}`);
  }
}
