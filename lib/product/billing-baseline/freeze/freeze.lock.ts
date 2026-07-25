/**
 * Product Billing — Governance Freeze lock (read-only)
 * Freezes Billing → Subscription → Pricing → Invoice → Metering → Payment → Billing Audit
 * BASE: enterprise-product-billing-audit-v1
 * Isolated namespace: lib/product/billing-baseline
 * Does not modify upstream billing module sources
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "../../billing-audit/traceability/traceability.constants";
import {
  PRODUCT_BILLING_FOUNDATION_BASE,
  PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
  PRODUCT_BILLING_FOUNDATION_ID,
  PRODUCT_BILLING_FOUNDATION_VERSION,
} from "../../billing/foundation/foundation.constants";
import {
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
} from "../../invoice/engine/engine.constants";
import {
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
} from "../../metering/usage/usage.constants";
import {
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
} from "../../payment/integration/integration.constants";
import {
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
} from "../../pricing/management/management.constants";
import {
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
} from "../../subscription/lifecycle/lifecycle.constants";

export const PRODUCT_BILLING_SIGNOFF_VERSION =
  "product-billing-baseline-signoff-1" as const;

export const PRODUCT_BILLING_BASELINE_FREEZE_VERSION =
  "product-billing-baseline-freeze-1" as const;

export const PRODUCT_BILLING_BASELINE_FREEZE_BASE =
  "enterprise-product-billing-audit-v1" as const;

export const PRODUCT_BILLING_BASELINE_ID =
  "enterprise-product-billing-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_BILLING_BASELINE_ID =
  "enterprise-product-billing-baseline-v1" as const;

export type ProductBillingComponentId =
  | "billing"
  | "subscription"
  | "pricing"
  | "invoice"
  | "metering"
  | "payment"
  | "billing-audit"
  | "billing-freeze";

export type ProductBillingComponentLock = {
  id: ProductBillingComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductBillingPhaseVersions = {
  billing: {
    id: typeof PRODUCT_BILLING_FOUNDATION_ID;
    version: typeof PRODUCT_BILLING_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_BILLING_FOUNDATION_BASE;
  };
  subscription: {
    id: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_ID;
    version: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION;
    freeze: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION;
    base: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE;
  };
  pricing: {
    id: typeof PRODUCT_PRICING_MANAGEMENT_ID;
    version: typeof PRODUCT_PRICING_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_PRICING_MANAGEMENT_BASE;
  };
  invoice: {
    id: typeof PRODUCT_INVOICE_ENGINE_ID;
    version: typeof PRODUCT_INVOICE_ENGINE_VERSION;
    freeze: typeof PRODUCT_INVOICE_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_INVOICE_ENGINE_BASE;
  };
  metering: {
    id: typeof PRODUCT_USAGE_METERING_ID;
    version: typeof PRODUCT_USAGE_METERING_VERSION;
    freeze: typeof PRODUCT_USAGE_METERING_FREEZE_VERSION;
    base: typeof PRODUCT_USAGE_METERING_BASE;
  };
  payment: {
    id: typeof PRODUCT_PAYMENT_INTEGRATION_ID;
    version: typeof PRODUCT_PAYMENT_INTEGRATION_VERSION;
    freeze: typeof PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION;
    base: typeof PRODUCT_PAYMENT_INTEGRATION_BASE;
  };
  billingAudit: {
    id: typeof PRODUCT_BILLING_AUDIT_ID;
    version: typeof PRODUCT_BILLING_AUDIT_VERSION;
    freeze: typeof PRODUCT_BILLING_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_BILLING_AUDIT_BASE;
  };
};

export type ProductBillingFreezeLock = {
  version: typeof PRODUCT_BILLING_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_BILLING_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_BILLING_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_BILLING_BASELINE_ID;
  signoff: typeof PRODUCT_BILLING_SIGNOFF_VERSION;
  authBaseline: typeof ENTERPRISE_PRODUCT_AUTH_BASELINE_ID;
  productCompleteBaseline: typeof ENTERPRISE_PRODUCT_COMPLETE_ID;
  operationsBaseline: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: ProductBillingPhaseVersions;
  components: ProductBillingComponentLock[];
  readOnly: true;
};

export const PRODUCT_BILLING_COMPONENT_LOCK: ProductBillingComponentLock[] = [
  {
    id: "billing",
    path: "lib/product/billing/",
    label: "Product Billing Foundation",
    required: true,
  },
  {
    id: "subscription",
    path: "lib/product/subscription/",
    label: "Product Subscription Lifecycle",
    required: true,
  },
  {
    id: "pricing",
    path: "lib/product/pricing/",
    label: "Product Pricing Management",
    required: true,
  },
  {
    id: "invoice",
    path: "lib/product/invoice/",
    label: "Product Invoice Engine",
    required: true,
  },
  {
    id: "metering",
    path: "lib/product/metering/",
    label: "Product Usage Metering",
    required: true,
  },
  {
    id: "payment",
    path: "lib/product/payment/",
    label: "Product Payment Integration",
    required: true,
  },
  {
    id: "billing-audit",
    path: "lib/product/billing-audit/",
    label: "Product Billing Audit",
    required: true,
  },
  {
    id: "billing-freeze",
    path: "lib/product/billing-baseline/",
    label: "Product Billing Governance Freeze",
    required: true,
  },
];

export const PRODUCT_BILLING_PHASE_VERSIONS: ProductBillingPhaseVersions = {
  billing: {
    id: PRODUCT_BILLING_FOUNDATION_ID,
    version: PRODUCT_BILLING_FOUNDATION_VERSION,
    freeze: PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_BILLING_FOUNDATION_BASE,
  },
  subscription: {
    id: PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
    version: PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
    freeze: PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  },
  pricing: {
    id: PRODUCT_PRICING_MANAGEMENT_ID,
    version: PRODUCT_PRICING_MANAGEMENT_VERSION,
    freeze: PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_PRICING_MANAGEMENT_BASE,
  },
  invoice: {
    id: PRODUCT_INVOICE_ENGINE_ID,
    version: PRODUCT_INVOICE_ENGINE_VERSION,
    freeze: PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
    base: PRODUCT_INVOICE_ENGINE_BASE,
  },
  metering: {
    id: PRODUCT_USAGE_METERING_ID,
    version: PRODUCT_USAGE_METERING_VERSION,
    freeze: PRODUCT_USAGE_METERING_FREEZE_VERSION,
    base: PRODUCT_USAGE_METERING_BASE,
  },
  payment: {
    id: PRODUCT_PAYMENT_INTEGRATION_ID,
    version: PRODUCT_PAYMENT_INTEGRATION_VERSION,
    freeze: PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
    base: PRODUCT_PAYMENT_INTEGRATION_BASE,
  },
  billingAudit: {
    id: PRODUCT_BILLING_AUDIT_ID,
    version: PRODUCT_BILLING_AUDIT_VERSION,
    freeze: PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
    base: PRODUCT_BILLING_AUDIT_BASE,
  },
};

export const PRODUCT_BILLING_FREEZE_LOCK: ProductBillingFreezeLock = {
  version: PRODUCT_BILLING_BASELINE_FREEZE_VERSION,
  base: PRODUCT_BILLING_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_BILLING_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  signoff: PRODUCT_BILLING_SIGNOFF_VERSION,
  authBaseline: ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  productCompleteBaseline: ENTERPRISE_PRODUCT_COMPLETE_ID,
  operationsBaseline: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: E12_PRODUCTIZATION_COMPLETE_ID,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: PRODUCT_BILLING_PHASE_VERSIONS,
  components: PRODUCT_BILLING_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductBillingFreezeLockIntact(
  lock: ProductBillingFreezeLock = PRODUCT_BILLING_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-billing-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-billing-baseline-v1" &&
    lock.base === PRODUCT_BILLING_AUDIT_ID &&
    lock.phases.billing.id === PRODUCT_BILLING_FOUNDATION_ID &&
    lock.phases.billing.base === ENTERPRISE_PRODUCT_AUTH_BASELINE_ID &&
    lock.phases.subscription.base === PRODUCT_BILLING_FOUNDATION_ID &&
    lock.phases.pricing.base === PRODUCT_SUBSCRIPTION_LIFECYCLE_ID &&
    lock.phases.invoice.base === PRODUCT_PRICING_MANAGEMENT_ID &&
    lock.phases.metering.base === PRODUCT_INVOICE_ENGINE_ID &&
    lock.phases.payment.base === PRODUCT_USAGE_METERING_ID &&
    lock.phases.billingAudit.base === PRODUCT_PAYMENT_INTEGRATION_ID &&
    lock.phases.billingAudit.id === PRODUCT_BILLING_AUDIT_ID &&
    lock.components.length === 8
  );
}
