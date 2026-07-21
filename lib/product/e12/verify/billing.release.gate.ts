/**
 * E12-P4 — Billing & Commercial Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { setProductConfiguration } from "../admin/admin.config";
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
import {
  BILLING_CYCLES,
  BILLING_LIFECYCLE_EVENTS,
  BILLING_MANAGER_STATUSES,
  BILLING_SUBSCRIPTION_STATUSES,
  E12_BILLING_COMMERCIAL_BASE,
  E12_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_ID,
  E12_BILLING_COMMERCIAL_VERSION,
  E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION,
  INVOICE_STATUSES,
  PRICING_PLAN_STATUSES,
  QUOTA_BILLING_STATUSES,
  USAGE_METER_UNITS,
} from "../billing/billing.constants";
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
  getBillingCommercialRegistryManifest,
} from "../billing/billing.manager";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P4_SIGNOFF_VERSION = "e12-p4-signoff-1" as const;

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
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P4-CONSTANTS",
      "billing",
      "Billing commercial layer version constants",
      E12_BILLING_COMMERCIAL_ID === "enterprise-e12-billing-commercial-v1" &&
        E12_BILLING_COMMERCIAL_VERSION === "e12-billing-1" &&
        E12_BILLING_COMMERCIAL_BASE ===
          "enterprise-e12-p3-enterprise-admin-console-v1" &&
        E12_BILLING_COMMERCIAL_FREEZE_VERSION ===
          "e12-billing-commercial-freeze-1" &&
        E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION ===
          "e12-p4-billing-commercial-freeze-1" &&
        PRICING_PLAN_STATUSES.length === 3 &&
        BILLING_CYCLES.length === 2 &&
        USAGE_METER_UNITS.length === 4 &&
        BILLING_SUBSCRIPTION_STATUSES.length === 5 &&
        BILLING_LIFECYCLE_EVENTS.length === 6 &&
        QUOTA_BILLING_STATUSES.length === 3 &&
        INVOICE_STATUSES.length === 4 &&
        BILLING_MANAGER_STATUSES.length === 4,
      `id=${E12_BILLING_COMMERCIAL_ID} base=${E12_BILLING_COMMERCIAL_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P4-PLATFORM",
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
      id: "e12.p4.gate.product",
      name: "Enterprise Fitness Billing",
      sku: "EFS-BIL-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "e12.p4.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "e12.p4.gate.package",
      productId: product.id,
      name: "Billing Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    setProductConfiguration({
      id: "e12.p4.gate.billing.cfg",
      productId: product.id,
      scope: "PRODUCT",
      key: `billing.quotas.${edition.id}`,
      value: [
        { meter: "REQUEST", included: 5000, overageRate: 0.002 },
        { meter: "RUNTIME_HOUR", included: 50, overageRate: 1.0 },
      ],
      updatedBy: "system",
    });

    const registry = getProductRegistryManifest();

    const tenantMgr = createTenantProductManager({ managerId: "e12-p4-gate-tenant" });
    tenantMgr.initialize();
    tenantMgr.start();

    const workspace = tenantMgr.createWorkspace({
      id: "e12.p4.gate.workspace",
      name: "Billing Workspace",
      slug: "billing-ws",
    });

    const tenant = tenantMgr.registerTenant({
      id: "e12.p4.gate.tenant",
      name: "Billing Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const tenantSub = tenantMgr.bindSubscription({
      id: "e12.p4.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "e12.p4.gate.package",
    });

    const billingMgr = createBillingCommercialManager({ managerId: "e12-p4-gate" });
    billingMgr.initialize();
    billingMgr.start();

    const plan = billingMgr.createPlan({
      id: "e12.p4.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
      billingCycle: "MONTHLY",
    });

    const billingSub = billingMgr.createSubscription({
      id: "e12.p4.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: plan.id,
    });
    const activeSub = billingMgr.activateSubscription(billingSub.id);

    billingMgr.recordUsage({
      productTenantId: tenant.id,
      billingSubscriptionId: activeSub.id,
      meter: "REQUEST",
      quantity: 6000,
    });

    const quota = billingMgr.evaluateQuota({
      billingSubscriptionId: activeSub.id,
      meter: "REQUEST",
    });

    const invoice = billingMgr.generateInvoice({
      id: "e12.p4.gate.inv",
      productTenantId: tenant.id,
      billingSubscriptionId: activeSub.id,
    });
    const issued = billingMgr.issueInvoice(invoice.id);
    const paid = billingMgr.markPaid(issued.id);

    const metrics = billingMgr.metrics({ productId: product.id });
    const lifecycle = billingMgr.listLifecycle({
      billingSubscriptionId: activeSub.id,
    });
    const manifest = getBillingCommercialRegistryManifest();

    const ok =
      registry.identityCount >= 1 &&
      tenantSub.status === "ACTIVE" &&
      activeSub.status === "ACTIVE" &&
      plan.basePrice === 99 &&
      quota.status === "OVERAGE" &&
      quota.overage > 0 &&
      invoice.total > plan.basePrice &&
      paid.status === "PAID" &&
      metrics.activeSubscriptions >= 1 &&
      metrics.monthlyRecurringRevenue >= 99 &&
      lifecycle.some((r) => r.event === "ACTIVATED") &&
      manifest.billingCommercialId === E12_BILLING_COMMERCIAL_ID &&
      manifest.base === E12_BILLING_COMMERCIAL_BASE;

    checks.push(
      check(
        "PR-P4-STACK",
        "billing",
        "Plan / subscription / usage / quota / invoice / metrics",
        ok,
        `quota=${quota.status} inv=${paid.status} mrr=${metrics.monthlyRecurringRevenue}`,
      ),
    );

    billingMgr.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P4-STACK",
        "billing",
        "Plan / subscription / usage / quota / invoice / metrics",
        false,
        error instanceof Error ? error.message : "billing probe failed",
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
      `e12-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P4ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P4 release gate failed: ${gate.summary}`);
  }
}
