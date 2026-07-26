/**
 * Product API — Governance Freeze lock (read-only)
 * Freezes Foundation → Authentication → Gateway → SDK → Portal → Governance → Audit
 * BASE: enterprise-product-api-audit-v1
 * Isolated namespace: lib/product/api-baseline
 * Does not modify upstream API module sources
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
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../../admin-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID } from "../../notification-baseline/freeze/freeze.lock";
import {
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
} from "../../api/management/management.constants";
import {
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "../../api-authentication/management/management.constants";
import {
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
} from "../../api-gateway/management/management.constants";
import {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
} from "../../api-sdk/management/management.constants";
import {
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
} from "../../api-portal/management/management.constants";
import {
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "../../api-governance/management/management.constants";
import {
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "../../api-audit/management/management.constants";

export const PRODUCT_API_SIGNOFF_VERSION =
  "product-api-baseline-signoff-1" as const;

export const PRODUCT_API_BASELINE_FREEZE_VERSION =
  "product-api-baseline-freeze-1" as const;

export const PRODUCT_API_BASELINE_FREEZE_BASE =
  "enterprise-product-api-audit-v1" as const;

export const PRODUCT_API_BASELINE_ID =
  "enterprise-product-api-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_API_BASELINE_ID =
  "enterprise-product-api-baseline-v1" as const;

export type ProductApiComponentId =
  | "api-foundation"
  | "api-authentication"
  | "api-gateway"
  | "api-sdk"
  | "api-portal"
  | "api-governance"
  | "api-audit"
  | "api-freeze";

export type ProductApiComponentLock = {
  id: ProductApiComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductApiPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_API_FOUNDATION_ID;
    version: typeof PRODUCT_API_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_API_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_API_FOUNDATION_BASE;
  };
  authentication: {
    id: typeof PRODUCT_API_AUTHENTICATION_ID;
    version: typeof PRODUCT_API_AUTHENTICATION_VERSION;
    freeze: typeof PRODUCT_API_AUTHENTICATION_FREEZE_VERSION;
    base: typeof PRODUCT_API_AUTHENTICATION_BASE;
  };
  gateway: {
    id: typeof PRODUCT_API_GATEWAY_ID;
    version: typeof PRODUCT_API_GATEWAY_VERSION;
    freeze: typeof PRODUCT_API_GATEWAY_FREEZE_VERSION;
    base: typeof PRODUCT_API_GATEWAY_BASE;
  };
  sdk: {
    id: typeof PRODUCT_API_SDK_ID;
    version: typeof PRODUCT_API_SDK_VERSION;
    freeze: typeof PRODUCT_API_SDK_FREEZE_VERSION;
    base: typeof PRODUCT_API_SDK_BASE;
  };
  portal: {
    id: typeof PRODUCT_API_PORTAL_ID;
    version: typeof PRODUCT_API_PORTAL_VERSION;
    freeze: typeof PRODUCT_API_PORTAL_FREEZE_VERSION;
    base: typeof PRODUCT_API_PORTAL_BASE;
  };
  governance: {
    id: typeof PRODUCT_API_GOVERNANCE_ID;
    version: typeof PRODUCT_API_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_API_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_API_GOVERNANCE_BASE;
  };
  apiAudit: {
    id: typeof PRODUCT_API_AUDIT_ID;
    version: typeof PRODUCT_API_AUDIT_VERSION;
    freeze: typeof PRODUCT_API_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_API_AUDIT_BASE;
  };
};

export type ProductApiFreezeLock = {
  version: typeof PRODUCT_API_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_API_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_API_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_API_BASELINE_ID;
  signoff: typeof PRODUCT_API_SIGNOFF_VERSION;
  notificationBaseline: typeof ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID;
  adminBaseline: typeof ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID;
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
  phases: ProductApiPhaseVersions;
  components: ProductApiComponentLock[];
  readOnly: true;
};

export const PRODUCT_API_COMPONENT_LOCK: ProductApiComponentLock[] = [
  {
    id: "api-foundation",
    path: "lib/product/api/",
    label: "Product API Foundation",
    required: true,
  },
  {
    id: "api-authentication",
    path: "lib/product/api-authentication/",
    label: "Product API Authentication",
    required: true,
  },
  {
    id: "api-gateway",
    path: "lib/product/api-gateway/",
    label: "Product API Gateway",
    required: true,
  },
  {
    id: "api-sdk",
    path: "lib/product/api-sdk/",
    label: "Product API SDK",
    required: true,
  },
  {
    id: "api-portal",
    path: "lib/product/api-portal/",
    label: "Product API Developer Portal",
    required: true,
  },
  {
    id: "api-governance",
    path: "lib/product/api-governance/",
    label: "Product API Governance",
    required: true,
  },
  {
    id: "api-audit",
    path: "lib/product/api-audit/",
    label: "Product API Audit",
    required: true,
  },
  {
    id: "api-freeze",
    path: "lib/product/api-baseline/",
    label: "Product API Governance Freeze",
    required: true,
  },
];

export const PRODUCT_API_PHASE_VERSIONS: ProductApiPhaseVersions = {
  foundation: {
    id: PRODUCT_API_FOUNDATION_ID,
    version: PRODUCT_API_FOUNDATION_VERSION,
    freeze: PRODUCT_API_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_API_FOUNDATION_BASE,
  },
  authentication: {
    id: PRODUCT_API_AUTHENTICATION_ID,
    version: PRODUCT_API_AUTHENTICATION_VERSION,
    freeze: PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
    base: PRODUCT_API_AUTHENTICATION_BASE,
  },
  gateway: {
    id: PRODUCT_API_GATEWAY_ID,
    version: PRODUCT_API_GATEWAY_VERSION,
    freeze: PRODUCT_API_GATEWAY_FREEZE_VERSION,
    base: PRODUCT_API_GATEWAY_BASE,
  },
  sdk: {
    id: PRODUCT_API_SDK_ID,
    version: PRODUCT_API_SDK_VERSION,
    freeze: PRODUCT_API_SDK_FREEZE_VERSION,
    base: PRODUCT_API_SDK_BASE,
  },
  portal: {
    id: PRODUCT_API_PORTAL_ID,
    version: PRODUCT_API_PORTAL_VERSION,
    freeze: PRODUCT_API_PORTAL_FREEZE_VERSION,
    base: PRODUCT_API_PORTAL_BASE,
  },
  governance: {
    id: PRODUCT_API_GOVERNANCE_ID,
    version: PRODUCT_API_GOVERNANCE_VERSION,
    freeze: PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_API_GOVERNANCE_BASE,
  },
  apiAudit: {
    id: PRODUCT_API_AUDIT_ID,
    version: PRODUCT_API_AUDIT_VERSION,
    freeze: PRODUCT_API_AUDIT_FREEZE_VERSION,
    base: PRODUCT_API_AUDIT_BASE,
  },
};

export const PRODUCT_API_FREEZE_LOCK: ProductApiFreezeLock = {
  version: PRODUCT_API_BASELINE_FREEZE_VERSION,
  base: PRODUCT_API_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_API_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_API_BASELINE_ID,
  signoff: PRODUCT_API_SIGNOFF_VERSION,
  notificationBaseline: ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  adminBaseline: ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
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
  phases: PRODUCT_API_PHASE_VERSIONS,
  components: PRODUCT_API_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductApiFreezeLockIntact(
  lock: ProductApiFreezeLock = PRODUCT_API_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-api-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-api-baseline-v1" &&
    lock.base === PRODUCT_API_AUDIT_ID &&
    lock.phases.foundation.id === PRODUCT_API_FOUNDATION_ID &&
    lock.phases.foundation.base ===
      ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID &&
    lock.phases.authentication.base === PRODUCT_API_FOUNDATION_ID &&
    lock.phases.gateway.base === PRODUCT_API_AUTHENTICATION_ID &&
    lock.phases.sdk.base === PRODUCT_API_GATEWAY_ID &&
    lock.phases.portal.base === PRODUCT_API_SDK_ID &&
    lock.phases.governance.base === PRODUCT_API_PORTAL_ID &&
    lock.phases.apiAudit.base === PRODUCT_API_GOVERNANCE_ID &&
    lock.phases.apiAudit.id === PRODUCT_API_AUDIT_ID &&
    lock.components.length === 8
  );
}
