/**
 * E12-P7 — Commercial Control Plane Release Gate
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { clearAdminConsoleLayer, createAdminConsoleManager } from "../admin/admin.manager";
import { clearApiProductLayer } from "../api/api.manager";
import {
  clearBillingCommercialLayer,
  createBillingCommercialManager,
} from "../billing/billing.manager";
import {
  listProductFeatures,
  seedProductFeatureCatalog,
} from "../catalog/product.feature.catalog";
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
  SLA_TIERS,
} from "../commercial/commercial.constants";
import {
  clearCommercialControlLayer,
  createCommercialControlManager,
  getCommercialControlRegistryManifest,
} from "../commercial/commercial.manager";
import { E12_PRODUCT_BASE } from "../core/product.constants";
import { clearDeploymentLayer } from "../deployment/deployment.manager";
import { createProductEdition } from "../edition/product.edition";
import { registerProductIdentity } from "../identity/product.identity";
import { createCapabilityPackage } from "../packaging/product.capability.package";
import {
  clearProductRegistry,
  getProductRegistryManifest,
} from "../registry/product.registry";
import {
  clearTenantProductLayer,
  createTenantProductManager,
} from "../tenant/tenant.manager";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

export const E12_P7_SIGNOFF_VERSION = "e12-p7-signoff-1" as const;

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
  clearCommercialControlLayer();
  clearDeploymentLayer();
  clearApiProductLayer();
  clearBillingCommercialLayer();
  clearAdminConsoleLayer();
  clearTenantProductLayer();
  clearProductRegistry();
}

export function checkE12P7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PR-P7-CONSTANTS",
      "commercial",
      "Commercial control plane version constants",
      E12_COMMERCIAL_CONTROL_ID ===
        "enterprise-e12-commercial-control-plane-v1" &&
        E12_COMMERCIAL_CONTROL_VERSION === "e12-commercial-1" &&
        E12_COMMERCIAL_CONTROL_BASE ===
          "enterprise-e12-p6-deployment-package-v1" &&
        E12_COMMERCIAL_CONTROL_FREEZE_VERSION ===
          "e12-commercial-control-freeze-1" &&
        E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION ===
          "e12-p7-commercial-control-plane-freeze-1" &&
        PRODUCT_OPERATION_KINDS.length === 5 &&
        CUSTOMER_LIFECYCLE_STAGES.length === 5 &&
        COMMERCIAL_POLICY_KINDS.length === 5 &&
        SLA_TIERS.length === 3 &&
        COMMERCIAL_MANAGER_STATUSES.length === 4,
      `id=${E12_COMMERCIAL_CONTROL_ID} base=${E12_COMMERCIAL_CONTROL_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PR-P7-PLATFORM",
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
      id: "e12.p7.gate.product",
      name: "Enterprise Fitness Commercial",
      sku: "EFS-COM-001",
      platformBaseline: E12_PRODUCT_BASE,
    });

    const coreFeatures = listProductFeatures()
      .filter((f) => f.availability === "INCLUDED")
      .map((f) => f.id);

    const edition = createProductEdition({
      id: "e12.p7.gate.edition",
      productId: product.id,
      kind: "STANDARD",
      name: "Standard Edition",
      featureIds: coreFeatures.slice(0, 6),
      maxTenants: 50,
      maxRuntimes: 25,
    });

    createCapabilityPackage({
      id: "e12.p7.gate.package",
      productId: product.id,
      name: "Commercial Bundle",
      kind: "BUNDLE",
      featureIds: edition.featureIds.slice(0, 3),
    });

    const registry = getProductRegistryManifest();

    const tenantMgr = createTenantProductManager({
      managerId: "e12-p7-gate-tenant",
    });
    tenantMgr.initialize();
    tenantMgr.start();

    const workspace = tenantMgr.createWorkspace({
      id: "e12.p7.gate.workspace",
      name: "Commercial Workspace",
      slug: "commercial-gate-ws",
    });

    const tenant = tenantMgr.registerTenant({
      id: "e12.p7.gate.tenant",
      name: "Commercial Tenant",
      productId: product.id,
      workspaceId: workspace.id,
    });
    tenantMgr.activateTenant(tenant.id);

    const tenantSub = tenantMgr.bindSubscription({
      id: "e12.p7.gate.tenant.sub",
      productTenantId: tenant.id,
      productId: product.id,
      editionId: edition.id,
      packageId: "e12.p7.gate.package",
    });

    const billingMgr = createBillingCommercialManager({
      managerId: "e12-p7-gate-billing",
    });
    billingMgr.initialize();
    billingMgr.start();

    const plan = billingMgr.createPlan({
      id: "e12.p7.gate.plan",
      productId: product.id,
      editionId: edition.id,
      name: "Standard Monthly",
      basePrice: 99,
    });

    const billingSub = billingMgr.createSubscription({
      id: "e12.p7.gate.bsub",
      productTenantId: tenant.id,
      tenantSubscriptionId: tenantSub.id,
      pricingPlanId: plan.id,
    });
    billingMgr.activateSubscription(billingSub.id);

    const adminMgr = createAdminConsoleManager({
      managerId: "e12-p7-gate-admin",
    });
    adminMgr.initialize();
    adminMgr.start();

    const org = adminMgr.registerOrganization({
      id: "e12.p7.gate.org",
      name: "Commercial Org",
      slug: "commercial-gate-org",
      productId: product.id,
    });

    const commercialMgr = createCommercialControlManager({
      managerId: "e12-p7-gate",
    });
    commercialMgr.initialize();
    commercialMgr.start();

    const op = commercialMgr.createOperation({
      id: "e12.p7.gate.op",
      productId: product.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      kind: "ONBOARD",
      title: "Onboard commercial customer",
    });

    const customer = commercialMgr.transitionCustomer({
      id: "e12.p7.gate.cust",
      organizationId: org.id,
      productId: product.id,
      productTenantId: tenant.id,
      stage: "ACTIVE",
      reason: "subscription activated",
    });

    const policy = commercialMgr.createPolicy({
      id: "e12.p7.gate.policy",
      productId: product.id,
      kind: "DISCOUNT",
      name: "Max Discount Policy",
      rules: { maxDiscountPercent: 20 },
    });

    const policyEval = commercialMgr.evaluatePolicy({
      policyId: policy.id,
      context: { discountPercent: 10 },
    });

    const sla = commercialMgr.createSla({
      id: "e12.p7.gate.sla",
      productId: product.id,
      productTenantId: tenant.id,
      organizationId: org.id,
      tier: "ENTERPRISE",
    });

    const revenue = commercialMgr.revenue({ productId: product.id });
    const dashboard = commercialMgr.dashboard({ productId: product.id });
    const manifest = getCommercialControlRegistryManifest();

    const ok =
      registry.identityCount >= 1 &&
      op.status === "OPEN" &&
      customer.stage === "ACTIVE" &&
      policyEval.decision === "ALLOW" &&
      sla.tier === "ENTERPRISE" &&
      revenue.activeSubscriptions >= 1 &&
      revenue.mrr >= 99 &&
      dashboard.activeCustomers >= 1 &&
      dashboard.openOperations >= 1 &&
      dashboard.activePolicies >= 1 &&
      dashboard.activeSlas >= 1 &&
      manifest.commercialControlId === E12_COMMERCIAL_CONTROL_ID &&
      manifest.base === E12_COMMERCIAL_CONTROL_BASE;

    checks.push(
      check(
        "PR-P7-STACK",
        "commercial",
        "Ops / customer / revenue / policy / sla / dashboard",
        ok,
        `mrr=${revenue.mrr} customers=${dashboard.activeCustomers} sla=${sla.tier}`,
      ),
    );

    commercialMgr.stop();
    adminMgr.stop();
    billingMgr.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PR-P7-STACK",
        "commercial",
        "Ops / customer / revenue / policy / sla / dashboard",
        false,
        error instanceof Error ? error.message : "commercial probe failed",
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
      `e12-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE12P7ReleaseGatePass(
  gate: ReleaseGateResult = checkE12P7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E12-P7 release gate failed: ${gate.summary}`);
  }
}
