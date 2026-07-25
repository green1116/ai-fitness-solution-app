/**
 * Product Customer — Governance Freeze lock (read-only)
 * Freezes Customer → Organization → Profile → Relationship → Activity → Insight → CRM Audit
 * BASE: enterprise-product-crm-audit-v1
 * Isolated namespace: lib/product/customer-baseline
 * Does not modify upstream customer module sources
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import {
  PRODUCT_CRM_AUDIT_BASE,
  PRODUCT_CRM_AUDIT_FREEZE_VERSION,
  PRODUCT_CRM_AUDIT_ID,
  PRODUCT_CRM_AUDIT_VERSION,
} from "../../crm-audit/traceability/traceability.constants";
import {
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
} from "../../customer-activity/activity/activity.constants";
import {
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
} from "../../customer/foundation/foundation.constants";
import {
  PRODUCT_CUSTOMER_INSIGHT_BASE,
  PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_ID,
  PRODUCT_CUSTOMER_INSIGHT_VERSION,
} from "../../customer-insight/insight/insight.constants";
import {
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
} from "../../customer-profile/profile/profile.constants";
import {
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "../../organization/management/management.constants";
import {
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
} from "../../relationship/management/management.constants";

export const PRODUCT_CUSTOMER_SIGNOFF_VERSION =
  "product-customer-baseline-signoff-1" as const;

export const PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION =
  "product-customer-baseline-freeze-1" as const;

export const PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE =
  "enterprise-product-crm-audit-v1" as const;

export const PRODUCT_CUSTOMER_BASELINE_ID =
  "enterprise-product-customer-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID =
  "enterprise-product-customer-baseline-v1" as const;

export type ProductCustomerComponentId =
  | "customer"
  | "organization"
  | "customer-profile"
  | "relationship"
  | "customer-activity"
  | "customer-insight"
  | "crm-audit"
  | "customer-freeze";

export type ProductCustomerComponentLock = {
  id: ProductCustomerComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductCustomerPhaseVersions = {
  customer: {
    id: typeof PRODUCT_CUSTOMER_FOUNDATION_ID;
    version: typeof PRODUCT_CUSTOMER_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_CUSTOMER_FOUNDATION_BASE;
  };
  organization: {
    id: typeof PRODUCT_ORGANIZATION_MANAGEMENT_ID;
    version: typeof PRODUCT_ORGANIZATION_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_ORGANIZATION_MANAGEMENT_BASE;
  };
  customerProfile: {
    id: typeof PRODUCT_CUSTOMER_PROFILE_ID;
    version: typeof PRODUCT_CUSTOMER_PROFILE_VERSION;
    freeze: typeof PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION;
    base: typeof PRODUCT_CUSTOMER_PROFILE_BASE;
  };
  relationship: {
    id: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_ID;
    version: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_BASE;
  };
  customerActivity: {
    id: typeof PRODUCT_CUSTOMER_ACTIVITY_ID;
    version: typeof PRODUCT_CUSTOMER_ACTIVITY_VERSION;
    freeze: typeof PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION;
    base: typeof PRODUCT_CUSTOMER_ACTIVITY_BASE;
  };
  customerInsight: {
    id: typeof PRODUCT_CUSTOMER_INSIGHT_ID;
    version: typeof PRODUCT_CUSTOMER_INSIGHT_VERSION;
    freeze: typeof PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION;
    base: typeof PRODUCT_CUSTOMER_INSIGHT_BASE;
  };
  crmAudit: {
    id: typeof PRODUCT_CRM_AUDIT_ID;
    version: typeof PRODUCT_CRM_AUDIT_VERSION;
    freeze: typeof PRODUCT_CRM_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_CRM_AUDIT_BASE;
  };
};

export type ProductCustomerFreezeLock = {
  version: typeof PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_CUSTOMER_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID;
  signoff: typeof PRODUCT_CUSTOMER_SIGNOFF_VERSION;
  billingBaseline: typeof ENTERPRISE_PRODUCT_BILLING_BASELINE_ID;
  authBaseline: typeof ENTERPRISE_PRODUCT_AUTH_BASELINE_ID;
  productCompleteBaseline: typeof ENTERPRISE_PRODUCT_COMPLETE_ID;
  operationsBaseline: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: ProductCustomerPhaseVersions;
  components: ProductCustomerComponentLock[];
  readOnly: true;
};

export const PRODUCT_CUSTOMER_COMPONENT_LOCK: ProductCustomerComponentLock[] = [
  {
    id: "customer",
    path: "lib/product/customer/",
    label: "Product Customer Foundation",
    required: true,
  },
  {
    id: "organization",
    path: "lib/product/organization/",
    label: "Product Organization Management",
    required: true,
  },
  {
    id: "customer-profile",
    path: "lib/product/customer-profile/",
    label: "Product Customer Profile",
    required: true,
  },
  {
    id: "relationship",
    path: "lib/product/relationship/",
    label: "Product Relationship Management",
    required: true,
  },
  {
    id: "customer-activity",
    path: "lib/product/customer-activity/",
    label: "Product Customer Activity",
    required: true,
  },
  {
    id: "customer-insight",
    path: "lib/product/customer-insight/",
    label: "Product Customer Insight",
    required: true,
  },
  {
    id: "crm-audit",
    path: "lib/product/crm-audit/",
    label: "Product CRM Audit",
    required: true,
  },
  {
    id: "customer-freeze",
    path: "lib/product/customer-baseline/",
    label: "Product Customer Governance Freeze",
    required: true,
  },
];

export const PRODUCT_CUSTOMER_PHASE_VERSIONS: ProductCustomerPhaseVersions = {
  customer: {
    id: PRODUCT_CUSTOMER_FOUNDATION_ID,
    version: PRODUCT_CUSTOMER_FOUNDATION_VERSION,
    freeze: PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_FOUNDATION_BASE,
  },
  organization: {
    id: PRODUCT_ORGANIZATION_MANAGEMENT_ID,
    version: PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
    freeze: PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  },
  customerProfile: {
    id: PRODUCT_CUSTOMER_PROFILE_ID,
    version: PRODUCT_CUSTOMER_PROFILE_VERSION,
    freeze: PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_PROFILE_BASE,
  },
  relationship: {
    id: PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
    version: PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
    freeze: PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  },
  customerActivity: {
    id: PRODUCT_CUSTOMER_ACTIVITY_ID,
    version: PRODUCT_CUSTOMER_ACTIVITY_VERSION,
    freeze: PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_ACTIVITY_BASE,
  },
  customerInsight: {
    id: PRODUCT_CUSTOMER_INSIGHT_ID,
    version: PRODUCT_CUSTOMER_INSIGHT_VERSION,
    freeze: PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_INSIGHT_BASE,
  },
  crmAudit: {
    id: PRODUCT_CRM_AUDIT_ID,
    version: PRODUCT_CRM_AUDIT_VERSION,
    freeze: PRODUCT_CRM_AUDIT_FREEZE_VERSION,
    base: PRODUCT_CRM_AUDIT_BASE,
  },
};

export const PRODUCT_CUSTOMER_FREEZE_LOCK: ProductCustomerFreezeLock = {
  version: PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION,
  base: PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_CUSTOMER_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
  signoff: PRODUCT_CUSTOMER_SIGNOFF_VERSION,
  billingBaseline: ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  authBaseline: ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  productCompleteBaseline: ENTERPRISE_PRODUCT_COMPLETE_ID,
  operationsBaseline: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: E12_PRODUCTIZATION_COMPLETE_ID,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: PRODUCT_CUSTOMER_PHASE_VERSIONS,
  components: PRODUCT_CUSTOMER_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductCustomerFreezeLockIntact(
  lock: ProductCustomerFreezeLock = PRODUCT_CUSTOMER_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-customer-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-customer-baseline-v1" &&
    lock.base === PRODUCT_CRM_AUDIT_ID &&
    lock.phases.customer.id === PRODUCT_CUSTOMER_FOUNDATION_ID &&
    lock.phases.customer.base === ENTERPRISE_PRODUCT_BILLING_BASELINE_ID &&
    lock.phases.organization.base === PRODUCT_CUSTOMER_FOUNDATION_ID &&
    lock.phases.customerProfile.base === PRODUCT_ORGANIZATION_MANAGEMENT_ID &&
    lock.phases.relationship.base === PRODUCT_CUSTOMER_PROFILE_ID &&
    lock.phases.customerActivity.base === PRODUCT_RELATIONSHIP_MANAGEMENT_ID &&
    lock.phases.customerInsight.base === PRODUCT_CUSTOMER_ACTIVITY_ID &&
    lock.phases.crmAudit.base === PRODUCT_CUSTOMER_INSIGHT_ID &&
    lock.phases.crmAudit.id === PRODUCT_CRM_AUDIT_ID &&
    lock.components.length === 8
  );
}
