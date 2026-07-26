/**
 * Product Marketplace — Governance Freeze lock (read-only)
 * Freezes Foundation → Connector → Partner → App → Surface → Integration Governance → Audit
 * BASE: enterprise-product-marketplace-audit-v1
 * Isolated namespace: lib/product/marketplace-baseline
 * Does not modify upstream marketplace module sources
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
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import {
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
} from "../../marketplace/management/management.constants";
import {
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
} from "../../connector/management/management.constants";
import {
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "../../partner/management/management.constants";
import {
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
} from "../../app/management/management.constants";
import {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
} from "../../marketplace-surface/management/management.constants";
import {
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
} from "../../integration-governance/management/management.constants";
import {
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "../../marketplace-audit/management/management.constants";

export const PRODUCT_MARKETPLACE_SIGNOFF_VERSION =
  "product-marketplace-baseline-signoff-1" as const;

export const PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION =
  "product-marketplace-baseline-freeze-1" as const;

export const PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE =
  "enterprise-product-marketplace-audit-v1" as const;

export const PRODUCT_MARKETPLACE_BASELINE_ID =
  "enterprise-product-marketplace-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID =
  "enterprise-product-marketplace-baseline-v1" as const;

export type ProductMarketplaceComponentId =
  | "marketplace-foundation"
  | "connector"
  | "partner"
  | "app"
  | "marketplace-surface"
  | "integration-governance"
  | "marketplace-audit"
  | "marketplace-freeze";

export type ProductMarketplaceComponentLock = {
  id: ProductMarketplaceComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductMarketplacePhaseVersions = {
  foundation: {
    id: typeof PRODUCT_MARKETPLACE_FOUNDATION_ID;
    version: typeof PRODUCT_MARKETPLACE_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_MARKETPLACE_FOUNDATION_BASE;
  };
  connector: {
    id: typeof PRODUCT_CONNECTOR_FRAMEWORK_ID;
    version: typeof PRODUCT_CONNECTOR_FRAMEWORK_VERSION;
    freeze: typeof PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION;
    base: typeof PRODUCT_CONNECTOR_FRAMEWORK_BASE;
  };
  partner: {
    id: typeof PRODUCT_PARTNER_MANAGEMENT_ID;
    version: typeof PRODUCT_PARTNER_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_PARTNER_MANAGEMENT_BASE;
  };
  app: {
    id: typeof PRODUCT_APP_REGISTRY_ID;
    version: typeof PRODUCT_APP_REGISTRY_VERSION;
    freeze: typeof PRODUCT_APP_REGISTRY_FREEZE_VERSION;
    base: typeof PRODUCT_APP_REGISTRY_BASE;
  };
  surface: {
    id: typeof PRODUCT_MARKETPLACE_SURFACE_ID;
    version: typeof PRODUCT_MARKETPLACE_SURFACE_VERSION;
    freeze: typeof PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION;
    base: typeof PRODUCT_MARKETPLACE_SURFACE_BASE;
  };
  integrationGovernance: {
    id: typeof PRODUCT_INTEGRATION_GOVERNANCE_ID;
    version: typeof PRODUCT_INTEGRATION_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_INTEGRATION_GOVERNANCE_BASE;
  };
  marketplaceAudit: {
    id: typeof PRODUCT_MARKETPLACE_AUDIT_ID;
    version: typeof PRODUCT_MARKETPLACE_AUDIT_VERSION;
    freeze: typeof PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_MARKETPLACE_AUDIT_BASE;
  };
};

export type ProductMarketplaceFreezeLock = {
  version: typeof PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_MARKETPLACE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID;
  signoff: typeof PRODUCT_MARKETPLACE_SIGNOFF_VERSION;
  apiBaseline: typeof ENTERPRISE_PRODUCT_API_BASELINE_ID;
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
  phases: ProductMarketplacePhaseVersions;
  components: ProductMarketplaceComponentLock[];
  readOnly: true;
};

export const PRODUCT_MARKETPLACE_COMPONENT_LOCK: ProductMarketplaceComponentLock[] =
  [
    {
      id: "marketplace-foundation",
      path: "lib/product/marketplace/",
      label: "Product Marketplace Foundation",
      required: true,
    },
    {
      id: "connector",
      path: "lib/product/connector/",
      label: "Product Connector Framework",
      required: true,
    },
    {
      id: "partner",
      path: "lib/product/partner/",
      label: "Product Partner Management",
      required: true,
    },
    {
      id: "app",
      path: "lib/product/app/",
      label: "Product App Registry",
      required: true,
    },
    {
      id: "marketplace-surface",
      path: "lib/product/marketplace-surface/",
      label: "Product Marketplace Surface",
      required: true,
    },
    {
      id: "integration-governance",
      path: "lib/product/integration-governance/",
      label: "Product Integration Governance",
      required: true,
    },
    {
      id: "marketplace-audit",
      path: "lib/product/marketplace-audit/",
      label: "Product Marketplace Audit",
      required: true,
    },
    {
      id: "marketplace-freeze",
      path: "lib/product/marketplace-baseline/",
      label: "Product Marketplace Governance Freeze",
      required: true,
    },
  ];

export const PRODUCT_MARKETPLACE_PHASE_VERSIONS: ProductMarketplacePhaseVersions =
  {
    foundation: {
      id: PRODUCT_MARKETPLACE_FOUNDATION_ID,
      version: PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
      freeze: PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
      base: PRODUCT_MARKETPLACE_FOUNDATION_BASE,
    },
    connector: {
      id: PRODUCT_CONNECTOR_FRAMEWORK_ID,
      version: PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
      freeze: PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
      base: PRODUCT_CONNECTOR_FRAMEWORK_BASE,
    },
    partner: {
      id: PRODUCT_PARTNER_MANAGEMENT_ID,
      version: PRODUCT_PARTNER_MANAGEMENT_VERSION,
      freeze: PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
      base: PRODUCT_PARTNER_MANAGEMENT_BASE,
    },
    app: {
      id: PRODUCT_APP_REGISTRY_ID,
      version: PRODUCT_APP_REGISTRY_VERSION,
      freeze: PRODUCT_APP_REGISTRY_FREEZE_VERSION,
      base: PRODUCT_APP_REGISTRY_BASE,
    },
    surface: {
      id: PRODUCT_MARKETPLACE_SURFACE_ID,
      version: PRODUCT_MARKETPLACE_SURFACE_VERSION,
      freeze: PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
      base: PRODUCT_MARKETPLACE_SURFACE_BASE,
    },
    integrationGovernance: {
      id: PRODUCT_INTEGRATION_GOVERNANCE_ID,
      version: PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
      freeze: PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
      base: PRODUCT_INTEGRATION_GOVERNANCE_BASE,
    },
    marketplaceAudit: {
      id: PRODUCT_MARKETPLACE_AUDIT_ID,
      version: PRODUCT_MARKETPLACE_AUDIT_VERSION,
      freeze: PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
      base: PRODUCT_MARKETPLACE_AUDIT_BASE,
    },
  };

export const PRODUCT_MARKETPLACE_FREEZE_LOCK: ProductMarketplaceFreezeLock = {
  version: PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
  base: PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_MARKETPLACE_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  signoff: PRODUCT_MARKETPLACE_SIGNOFF_VERSION,
  apiBaseline: ENTERPRISE_PRODUCT_API_BASELINE_ID,
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
  phases: PRODUCT_MARKETPLACE_PHASE_VERSIONS,
  components: PRODUCT_MARKETPLACE_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductMarketplaceFreezeLockIntact(
  lock: ProductMarketplaceFreezeLock = PRODUCT_MARKETPLACE_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-marketplace-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-marketplace-baseline-v1" &&
    lock.base === PRODUCT_MARKETPLACE_AUDIT_ID &&
    lock.phases.foundation.id === PRODUCT_MARKETPLACE_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_API_BASELINE_ID &&
    lock.phases.connector.base === PRODUCT_MARKETPLACE_FOUNDATION_ID &&
    lock.phases.partner.base === PRODUCT_CONNECTOR_FRAMEWORK_ID &&
    lock.phases.app.base === PRODUCT_PARTNER_MANAGEMENT_ID &&
    lock.phases.surface.base === PRODUCT_APP_REGISTRY_ID &&
    lock.phases.integrationGovernance.base ===
      PRODUCT_MARKETPLACE_SURFACE_ID &&
    lock.phases.marketplaceAudit.base === PRODUCT_INTEGRATION_GOVERNANCE_ID &&
    lock.phases.marketplaceAudit.id === PRODUCT_MARKETPLACE_AUDIT_ID &&
    lock.components.length === 8
  );
}
