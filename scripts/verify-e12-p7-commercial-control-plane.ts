/**
 * E12-P7 — Commercial Control Plane verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  clearAdminConsoleLayer,
  createAdminConsoleManager,
} from "../lib/product/e12/admin/admin.manager";
import { clearApiProductLayer } from "../lib/product/e12/api/api.manager";
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
} from "../lib/product/e12/billing/billing.manager";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../lib/product/e12/catalog/product.feature.catalog";
import {
  COMMERCIAL_MANAGER_STATUSES,
  COMMERCIAL_POLICY_KINDS,
  CUSTOMER_LIFECYCLE_STAGES,
  E12_COMMERCIAL_CONTROL_BASE,
  E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_ID,
  E12_COMMERCIAL_CONTROL_VERSION,
  E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION,
  PRODUCT_OPERATION_KINDS,
  PRODUCT_OPERATION_STATUSES,
  SLA_TIERS,
} from "../lib/product/e12/commercial/commercial.constants";
import {
  clearCommercialControlLayer,
  createCommercialControlManager,
} from "../lib/product/e12/commercial/commercial.manager";
import { E12_PRODUCT_BASE } from "../lib/product/e12/core/product.constants";
import { clearDeploymentLayer } from "../lib/product/e12/deployment/deployment.manager";
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
  assertE12P7ReleaseGatePass,
  checkE12P7ReleaseGate,
} from "../lib/product/e12/verify/commercial.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearCommercialControlLayer();
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

function checkModules() {
  const required = [
    "lib/product/e12/commercial/commercial.constants.ts",
    "lib/product/e12/commercial/commercial.types.ts",
    "lib/product/e12/commercial/commercial.operations.ts",
    "lib/product/e12/commercial/commercial.customer.ts",
    "lib/product/e12/commercial/commercial.revenue.ts",
    "lib/product/e12/commercial/commercial.policy.ts",
    "lib/product/e12/commercial/commercial.sla.ts",
    "lib/product/e12/commercial/commercial.dashboard.ts",
    "lib/product/e12/commercial/commercial.manager.ts",
    "lib/product/e12/verify/commercial.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E12_COMMERCIAL_CONTROL_ID ===
      "enterprise-e12-commercial-control-plane-v1",
    "commercial id",
  );
  check(
    E12_COMMERCIAL_CONTROL_VERSION === "e12-commercial-1",
    "commercial version",
  );
  check(
    E12_COMMERCIAL_CONTROL_FREEZE_VERSION ===
      "e12-commercial-control-freeze-1",
    "commercial freeze",
  );
  check(
    E12_COMMERCIAL_CONTROL_BASE === "enterprise-e12-p6-deployment-package-v1",
    "commercial base",
  );
  check(
    E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION ===
      "e12-p7-commercial-control-plane-freeze-1",
    "p7 freeze",
  );
  check(PRODUCT_OPERATION_KINDS.length === 5, "operation kinds");
  check(PRODUCT_OPERATION_STATUSES.length === 4, "operation statuses");
  check(CUSTOMER_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(COMMERCIAL_POLICY_KINDS.length === 5, "policy kinds");
  check(SLA_TIERS.length === 3, "sla tiers");
  check(COMMERCIAL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  console.log("✓ version constants");
}

function setupStack() {
  seedProductFeatureCatalog();

  const product = registerProductIdentity({
    id: "e12.p7.verify.product",
    name: "AI Fitness Commercial",
    sku: "AIFE-COM-001",
    platformBaseline: E12_PRODUCT_BASE,
  });

  const included = listProductFeatures()
    .filter((f) => f.availability === "INCLUDED")
    .map((f) => f.id);

  const edition = createProductEdition({
    id: "e12.p7.verify.edition",
    productId: product.id,
    kind: "STANDARD",
    name: "Standard Edition",
    featureIds: included.slice(0, 6),
    maxTenants: 20,
    maxRuntimes: 10,
  });

  createCapabilityPackage({
    id: "e12.p7.verify.package",
    productId: product.id,
    name: "Commercial Bundle",
    kind: "BUNDLE",
    featureIds: edition.featureIds.slice(0, 3),
  });

  const registry = getProductRegistryManifest();
  check(registry.identityCount >= 1, "registry identities");

  const tenantMgr = createTenantProductManager({
    managerId: "e12-p7-verify-tenant",
  });
  tenantMgr.initialize();
  tenantMgr.start();

  const workspace = tenantMgr.createWorkspace({
    id: "e12.p7.verify.workspace",
    name: "Verify Workspace",
    slug: "verify-commercial-ws",
  });

  const tenant = tenantMgr.registerTenant({
    id: "e12.p7.verify.tenant",
    name: "Verify Tenant",
    productId: product.id,
    workspaceId: workspace.id,
  });
  tenantMgr.activateTenant(tenant.id);

  const tenantSub = tenantMgr.bindSubscription({
    id: "e12.p7.verify.tenant.sub",
    productTenantId: tenant.id,
    productId: product.id,
    editionId: edition.id,
    packageId: "e12.p7.verify.package",
  });

  const billingMgr = createBillingCommercialManager({
    managerId: "e12-p7-verify-billing",
  });
  billingMgr.initialize();
  billingMgr.start();

  const plan = billingMgr.createPlan({
    id: "e12.p7.verify.plan",
    productId: product.id,
    editionId: edition.id,
    name: "Verify Monthly",
    basePrice: 49,
  });

  const billingSub = billingMgr.createSubscription({
    id: "e12.p7.verify.bsub",
    productTenantId: tenant.id,
    tenantSubscriptionId: tenantSub.id,
    pricingPlanId: plan.id,
  });
  billingMgr.activateSubscription(billingSub.id);

  const adminMgr = createAdminConsoleManager({
    managerId: "e12-p7-verify-admin",
  });
  adminMgr.initialize();
  adminMgr.start();

  const org = adminMgr.registerOrganization({
    id: "e12.p7.verify.org",
    name: "Verify Org",
    slug: "verify-commercial-org",
    productId: product.id,
  });

  return { product, tenant, org, tenantMgr, billingMgr, adminMgr };
}

function testCommercialControlStack() {
  cleanup();

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform v1 aligned");

  const { product, tenant, org } = setupStack();

  const mgr = createCommercialControlManager({ managerId: "e12-p7-verify" });
  check(mgr.initialize().status === "READY", "mgr ready");
  check(mgr.start().status === "RUNNING", "mgr running");

  const op = mgr.createOperation({
    id: "e12.p7.verify.op",
    productId: product.id,
    productTenantId: tenant.id,
    organizationId: org.id,
    kind: "EXPAND",
    title: "Expand seat capacity",
  });
  check(op.status === "OPEN", "operation open");

  mgr.setOperationStatus(op.id, "IN_PROGRESS");
  check(mgr.getOperation(op.id)?.status === "IN_PROGRESS", "operation progress");

  const customer = mgr.transitionCustomer({
    id: "e12.p7.verify.cust",
    organizationId: org.id,
    productId: product.id,
    productTenantId: tenant.id,
    stage: "ONBOARDING",
  });
  check(customer.stage === "ONBOARDING", "customer onboarding");

  const active = mgr.transitionCustomer({
    id: "e12.p7.verify.cust.active",
    organizationId: org.id,
    productId: product.id,
    productTenantId: tenant.id,
    stage: "ACTIVE",
    reason: "go-live",
  });
  check(active.stage === "ACTIVE", "customer active");
  check(
    mgr.getCustomerStage(org.id, product.id) === "ACTIVE",
    "current stage active",
  );

  const policy = mgr.createPolicy({
    id: "e12.p7.verify.policy",
    productId: product.id,
    kind: "PRICING",
    name: "List Price Guard",
    rules: { maxDiscountPercent: 15 },
  });
  check(policy.status === "ACTIVE", "policy active");

  const allow = mgr.evaluatePolicy({
    policyId: policy.id,
    context: { discountPercent: 10 },
  });
  check(allow.decision === "ALLOW", `policy allow: ${allow.reason}`);

  const deny = mgr.evaluatePolicy({
    policyId: policy.id,
    context: { discountPercent: 25 },
  });
  check(deny.decision === "DENY", `policy deny: ${deny.reason}`);

  const sla = mgr.createSla({
    id: "e12.p7.verify.sla",
    productId: product.id,
    productTenantId: tenant.id,
    organizationId: org.id,
    tier: "PREMIUM",
  });
  check(sla.uptimeTarget >= 99.9, "sla premium target");

  const revenue = mgr.revenue({ productId: product.id });
  check(revenue.activeSubscriptions >= 1, "revenue active subs");
  check(revenue.mrr >= 49, "revenue mrr");
  check(revenue.arr >= 49 * 12, "revenue arr");

  const dashboard = mgr.dashboard({ productId: product.id });
  check(dashboard.activeCustomers >= 1, "dashboard customers");
  check(dashboard.activePolicies >= 1, "dashboard policies");
  check(dashboard.activeSlas >= 1, "dashboard slas");
  check(dashboard.revenue.mrr >= 49, "dashboard revenue");

  const manifest = mgr.manifest();
  check(
    manifest.commercialControlId === E12_COMMERCIAL_CONTROL_ID,
    "manifest id",
  );
  check(manifest.base === E12_COMMERCIAL_CONTROL_BASE, "manifest base");
  check(manifest.operationCount >= 1, "manifest operations");
  check(manifest.policyCount >= 1, "manifest policies");

  mgr.stop();
  cleanup();
  console.log(
    "✓ operations / customer / revenue / policy / sla / dashboard / manager",
  );
}

function testSignoff() {
  const gate = checkE12P7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE12P7ReleaseGatePass(gate);
  console.log("✓ commercial control plane release gate");
}

function main() {
  console.log("E12-P7 Commercial Control Plane verify");
  checkModules();
  checkConstants();
  testCommercialControlStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
