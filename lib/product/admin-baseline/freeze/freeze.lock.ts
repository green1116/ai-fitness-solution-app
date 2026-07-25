/**
 * Product Admin — Governance Freeze lock (read-only)
 * Freezes Admin → Tenant → User → Configuration → Operations → Compliance → Admin Audit
 * BASE: enterprise-product-admin-audit-v1
 * Isolated namespace: lib/product/admin-baseline
 * Does not modify upstream admin module sources
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
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import {
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
} from "../../admin-audit/traceability/traceability.constants";
import {
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
} from "../../admin/foundation/foundation.constants";
import {
  PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_ID,
  PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
} from "../../compliance/governance/governance.constants";
import {
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
} from "../../configuration/management/management.constants";
import {
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
} from "../../operations/console/console.constants";
import {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
} from "../../tenant/administration/administration.constants";
import {
  PRODUCT_USER_ADMINISTRATION_BASE,
  PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_USER_ADMINISTRATION_ID,
  PRODUCT_USER_ADMINISTRATION_VERSION,
} from "../../user/administration/administration.constants";

export const PRODUCT_ADMIN_SIGNOFF_VERSION =
  "product-admin-baseline-signoff-1" as const;

export const PRODUCT_ADMIN_BASELINE_FREEZE_VERSION =
  "product-admin-baseline-freeze-1" as const;

export const PRODUCT_ADMIN_BASELINE_FREEZE_BASE =
  "enterprise-product-admin-audit-v1" as const;

export const PRODUCT_ADMIN_BASELINE_ID =
  "enterprise-product-admin-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID =
  "enterprise-product-admin-baseline-v1" as const;

export type ProductAdminComponentId =
  | "admin"
  | "tenant"
  | "user"
  | "configuration"
  | "operations"
  | "compliance"
  | "admin-audit"
  | "admin-freeze";

export type ProductAdminComponentLock = {
  id: ProductAdminComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAdminPhaseVersions = {
  admin: {
    id: typeof PRODUCT_ADMIN_FOUNDATION_ID;
    version: typeof PRODUCT_ADMIN_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_ADMIN_FOUNDATION_BASE;
  };
  tenant: {
    id: typeof PRODUCT_TENANT_ADMINISTRATION_ID;
    version: typeof PRODUCT_TENANT_ADMINISTRATION_VERSION;
    freeze: typeof PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION;
    base: typeof PRODUCT_TENANT_ADMINISTRATION_BASE;
  };
  user: {
    id: typeof PRODUCT_USER_ADMINISTRATION_ID;
    version: typeof PRODUCT_USER_ADMINISTRATION_VERSION;
    freeze: typeof PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION;
    base: typeof PRODUCT_USER_ADMINISTRATION_BASE;
  };
  configuration: {
    id: typeof PRODUCT_SYSTEM_CONFIGURATION_ID;
    version: typeof PRODUCT_SYSTEM_CONFIGURATION_VERSION;
    freeze: typeof PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION;
    base: typeof PRODUCT_SYSTEM_CONFIGURATION_BASE;
  };
  operations: {
    id: typeof PRODUCT_OPERATIONS_CONSOLE_ID;
    version: typeof PRODUCT_OPERATIONS_CONSOLE_VERSION;
    freeze: typeof PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION;
    base: typeof PRODUCT_OPERATIONS_CONSOLE_BASE;
  };
  compliance: {
    id: typeof PRODUCT_COMPLIANCE_GOVERNANCE_ID;
    version: typeof PRODUCT_COMPLIANCE_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_COMPLIANCE_GOVERNANCE_BASE;
  };
  adminAudit: {
    id: typeof PRODUCT_ADMIN_AUDIT_ID;
    version: typeof PRODUCT_ADMIN_AUDIT_VERSION;
    freeze: typeof PRODUCT_ADMIN_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_ADMIN_AUDIT_BASE;
  };
};

export type ProductAdminFreezeLock = {
  version: typeof PRODUCT_ADMIN_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_ADMIN_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_ADMIN_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID;
  signoff: typeof PRODUCT_ADMIN_SIGNOFF_VERSION;
  analyticsBaseline: typeof ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID;
  customerBaseline: typeof ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID;
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
  phases: ProductAdminPhaseVersions;
  components: ProductAdminComponentLock[];
  readOnly: true;
};

export const PRODUCT_ADMIN_COMPONENT_LOCK: ProductAdminComponentLock[] = [
  {
    id: "admin",
    path: "lib/product/admin/",
    label: "Product Admin Foundation",
    required: true,
  },
  {
    id: "tenant",
    path: "lib/product/tenant/",
    label: "Product Tenant Administration",
    required: true,
  },
  {
    id: "user",
    path: "lib/product/user/",
    label: "Product User Administration",
    required: true,
  },
  {
    id: "configuration",
    path: "lib/product/configuration/",
    label: "Product System Configuration",
    required: true,
  },
  {
    id: "operations",
    path: "lib/product/operations/",
    label: "Product Operations Console",
    required: true,
  },
  {
    id: "compliance",
    path: "lib/product/compliance/",
    label: "Product Compliance Governance",
    required: true,
  },
  {
    id: "admin-audit",
    path: "lib/product/admin-audit/",
    label: "Product Admin Audit",
    required: true,
  },
  {
    id: "admin-freeze",
    path: "lib/product/admin-baseline/",
    label: "Product Admin Governance Freeze",
    required: true,
  },
];

export const PRODUCT_ADMIN_PHASE_VERSIONS: ProductAdminPhaseVersions = {
  admin: {
    id: PRODUCT_ADMIN_FOUNDATION_ID,
    version: PRODUCT_ADMIN_FOUNDATION_VERSION,
    freeze: PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_ADMIN_FOUNDATION_BASE,
  },
  tenant: {
    id: PRODUCT_TENANT_ADMINISTRATION_ID,
    version: PRODUCT_TENANT_ADMINISTRATION_VERSION,
    freeze: PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
    base: PRODUCT_TENANT_ADMINISTRATION_BASE,
  },
  user: {
    id: PRODUCT_USER_ADMINISTRATION_ID,
    version: PRODUCT_USER_ADMINISTRATION_VERSION,
    freeze: PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
    base: PRODUCT_USER_ADMINISTRATION_BASE,
  },
  configuration: {
    id: PRODUCT_SYSTEM_CONFIGURATION_ID,
    version: PRODUCT_SYSTEM_CONFIGURATION_VERSION,
    freeze: PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
    base: PRODUCT_SYSTEM_CONFIGURATION_BASE,
  },
  operations: {
    id: PRODUCT_OPERATIONS_CONSOLE_ID,
    version: PRODUCT_OPERATIONS_CONSOLE_VERSION,
    freeze: PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
    base: PRODUCT_OPERATIONS_CONSOLE_BASE,
  },
  compliance: {
    id: PRODUCT_COMPLIANCE_GOVERNANCE_ID,
    version: PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
    freeze: PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  },
  adminAudit: {
    id: PRODUCT_ADMIN_AUDIT_ID,
    version: PRODUCT_ADMIN_AUDIT_VERSION,
    freeze: PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
    base: PRODUCT_ADMIN_AUDIT_BASE,
  },
};

export const PRODUCT_ADMIN_FREEZE_LOCK: ProductAdminFreezeLock = {
  version: PRODUCT_ADMIN_BASELINE_FREEZE_VERSION,
  base: PRODUCT_ADMIN_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_ADMIN_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
  signoff: PRODUCT_ADMIN_SIGNOFF_VERSION,
  analyticsBaseline: ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
  customerBaseline: ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
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
  phases: PRODUCT_ADMIN_PHASE_VERSIONS,
  components: PRODUCT_ADMIN_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductAdminFreezeLockIntact(
  lock: ProductAdminFreezeLock = PRODUCT_ADMIN_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-admin-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-admin-baseline-v1" &&
    lock.base === PRODUCT_ADMIN_AUDIT_ID &&
    lock.phases.admin.id === PRODUCT_ADMIN_FOUNDATION_ID &&
    lock.phases.admin.base === ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID &&
    lock.phases.tenant.base === PRODUCT_ADMIN_FOUNDATION_ID &&
    lock.phases.user.base === PRODUCT_TENANT_ADMINISTRATION_ID &&
    lock.phases.configuration.base === PRODUCT_USER_ADMINISTRATION_ID &&
    lock.phases.operations.base === PRODUCT_SYSTEM_CONFIGURATION_ID &&
    lock.phases.compliance.base === PRODUCT_OPERATIONS_CONSOLE_ID &&
    lock.phases.adminAudit.base === PRODUCT_COMPLIANCE_GOVERNANCE_ID &&
    lock.phases.adminAudit.id === PRODUCT_ADMIN_AUDIT_ID &&
    lock.components.length === 8
  );
}
