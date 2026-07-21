/**
 * E12-P4 — Billing & Commercial Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { setProductConfiguration } from "../lib/product/e12/admin/admin.config";
import { clearAdminConsoleLayer } from "../lib/product/e12/admin/admin.manager";
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
} from "../lib/product/e12/billing/billing.constants";
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
} from "../lib/product/e12/billing/billing.manager";
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
  assertE12P4ReleaseGatePass,
  checkE12P4ReleaseGate,
} from "../lib/product/e12/verify/billing.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/billing/billing.constants.ts",
    "lib/product/e12/billing/billing.types.ts",
    "lib/product/e12/billing/billing.plan.ts",
    "lib/product/e12/billing/billing.subscription.ts",
    "lib/product/e12/billing/billing.usage.ts",
    "lib/product/e12/billing/billing.quota.ts",
    "lib/product/e12/billing/billing.invoice.ts",
    "lib/product/e12/billing/billing.metrics.ts",
    "lib/product/e12/billing/billing.manager.ts",
    "lib/product/e12/verify/billing.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_BILLING_COMMERCIAL_ID === "enterprise-e12-billing-commercial-v1",
    "billing id",
  );
  check(E12_BILLING_COMMERCIAL_VERSION === "e12-billing-1", "billing version");
  check(
    E12_BILLING_COMMERCIAL_FREEZE_VERSION === "e12-billing-commercial-freeze-1",
    "billing freeze",
  );
  check(
    E12_BILLING_COMMERCIAL_BASE ===
      "enterprise-e12-p3-enterprise-admin-console-v1",
    "billing base",
  );
  check(
    E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION ===
      "e12-p4-billing-commercial-freeze-1",
    "p4 freeze",
  );
  check(PRICING_PLAN_STATUSES.length === 3, "plan statuses");
  check(BILLING_CYCLES.length === 2, "billing cycles");
  check(USAGE_METER_UNITS.length === 4, "meter units");
  check(BILLING_SUBSCRIPTION_STATUSES.length === 5, "sub statuses");
  check(BILLING_LIFECYCLE_EVENTS.length === 6, "lifecycle events");
  check(QUOTA_BILLING_STATUSES.length === 3, "quota statuses");
  check(INVOICE_STATUSES.length === 4, "invoice statuses");
  check(BILLING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(
    PLATFORM_V1_ID === "enterprise-platform-v1",
    "platform v1 intact",
  );
  console.log("✓ version constants");
}

function setupStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p4.verify.product",
    name: "AI Fitness Billing",
    sku: "AIFE-BIL-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "e12.p4.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "e12.p4.verify.package",
    productId: product.id,
    name: "Standard Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  setProductConfiguration({
    id: "e12.p4.verify.billing.cfg",
    productId: product.id,
    scope: "PRODUCT",
    key: `billing.quotas.${edition.id}`,
    value: [{ meter: "REQUEST", included: 1000, overageRate: 0.01 }],
    updatedBy: "verify-admin",
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");

  const tenantMgr = createTenantProductManager({ managerId: "e12-p4-verify-tenant" });
  tenantMgr.initialize();
  tenantMgr.start();

  const workspace = tenantMgr.createWorkspace({
    id: "e12.p4.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-billing-ws",
  });

  const tenant = tenantMgr.registerTenant({
    id: "e12.p4.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  tenantMgr.activateTenant(tenant.id);

  const tenantSub = tenantMgr.bindSubscription({
    id: "e12.p4.verify.tenant.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: "e12.p4.verify.package",
  });

  return { product, edition, tenant, tenantSub, tenantMgr };
}

function testBillingCommercialStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, edition, tenant, tenantSub } = setupStack();

  const mgr = createBillingCommercialManager({ managerId: "e12-p4-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const plan = mgr.createPlan({
    id: "e12.p4.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
    billingCycle: "MONTHLY",
  });
  check(plan.status === "ACTIVE", "plan active");

  const billingSub = mgr.createSubscription({
    id: "e12.p4.verify.bsub",
    productTenantId: tenant.id,
    tenantSubscriptionId: tenantSub.id,
    pricingPlanId: plan.id,
  });
  check(billingSub.status === "DRAFT", "billing sub draft");

  const activeSub = mgr.activateSubscription(billingSub.id);
  check(activeSub.status === "ACTIVE", "billing sub active");

  mgr.recordUsage({
    productTenantId: tenant.id,
    billingSubscriptionId: activeSub.id,
    meter: "REQUEST",
    quantity: 1500,
  });

  const quota = mgr.evaluateQuota({
    billingSubscriptionId: activeSub.id,
    meter: "REQUEST",
  });
  check(quota.status === "OVERAGE", `quota overage: ${quota.overage}`);

  const invoice = mgr.generateInvoice({
    id: "e12.p4.verify.inv",
    productTenantId: tenant.id,
    billingSubscriptionId: activeSub.id,
  });
  check(invoice.total > plan.basePrice, "invoice includes overage");

  const issued = mgr.issueInvoice(invoice.id);
  check(issued.status === "ISSUED", "invoice issued");

  const paid = mgr.markPaid(issued.id);
  check(paid.status === "PAID", "invoice paid");

  const metrics = mgr.metrics({ productId: product.id });
  check(metrics.activeSubscriptions >= 1, "metrics active subs");
  check(metrics.monthlyRecurringRevenue >= 49, "metrics mrr");

  const lifecycle = mgr.listLifecycle({ billingSubscriptionId: activeSub.id });
  check(lifecycle.length >= 2, "lifecycle records");

  const manifest = mgr.manifest();
  check(manifest.billingCommercialId === E12_BILLING_COMMERCIAL_ID, "manifest id");
  check(manifest.base === E12_BILLING_COMMERCIAL_BASE, "manifest base");

  mgr.stop();
  cleanup();
  console.log(
    "✓ plan / subscription / usage / quota / invoice / metrics / manager",
  );
}

function testSignoff() {
  const gate = checkE12P4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P4ReleaseGatePass(gate);
  console.log("✓ billing commercial release gate");
}

function main() {
  console.log("E12-P4 Billing & Commercial Layer verify");
  checkModules();
  checkConstants();
  testBillingCommercialStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
