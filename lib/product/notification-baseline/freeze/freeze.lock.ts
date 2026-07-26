/**
 * Product Notification — Governance Freeze lock (read-only)
 * Freezes Foundation → Template → Channel → Delivery → Preference → Routing → Audit
 * BASE: enterprise-product-notification-audit-v1
 * Isolated namespace: lib/product/notification-baseline
 * Does not modify upstream notification module sources
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
import {
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
} from "../../channel/management/management.constants";
import {
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
} from "../../delivery/management/management.constants";
import {
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
} from "../../notification/foundation/foundation.constants";
import {
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "../../notification-audit/management/management.constants";
import {
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "../../notification-template/management/management.constants";
import {
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "../../preference/management/management.constants";
import {
  PRODUCT_ROUTING_ENGINE_BASE,
  PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
  PRODUCT_ROUTING_ENGINE_ID,
  PRODUCT_ROUTING_ENGINE_VERSION,
} from "../../routing/management/management.constants";

export const PRODUCT_NOTIFICATION_SIGNOFF_VERSION =
  "product-notification-baseline-signoff-1" as const;

export const PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION =
  "product-notification-baseline-freeze-1" as const;

export const PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE =
  "enterprise-product-notification-audit-v1" as const;

export const PRODUCT_NOTIFICATION_BASELINE_ID =
  "enterprise-product-notification-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID =
  "enterprise-product-notification-baseline-v1" as const;

export type ProductNotificationComponentId =
  | "notification-foundation"
  | "notification-template"
  | "channel"
  | "delivery"
  | "preference"
  | "routing"
  | "notification-audit"
  | "notification-freeze";

export type ProductNotificationComponentLock = {
  id: ProductNotificationComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductNotificationPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_NOTIFICATION_FOUNDATION_ID;
    version: typeof PRODUCT_NOTIFICATION_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_NOTIFICATION_FOUNDATION_BASE;
  };
  template: {
    id: typeof PRODUCT_TEMPLATE_MANAGEMENT_ID;
    version: typeof PRODUCT_TEMPLATE_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_TEMPLATE_MANAGEMENT_BASE;
  };
  channel: {
    id: typeof PRODUCT_CHANNEL_MANAGEMENT_ID;
    version: typeof PRODUCT_CHANNEL_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_CHANNEL_MANAGEMENT_BASE;
  };
  delivery: {
    id: typeof PRODUCT_DELIVERY_ENGINE_ID;
    version: typeof PRODUCT_DELIVERY_ENGINE_VERSION;
    freeze: typeof PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_DELIVERY_ENGINE_BASE;
  };
  preference: {
    id: typeof PRODUCT_PREFERENCE_MANAGEMENT_ID;
    version: typeof PRODUCT_PREFERENCE_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_PREFERENCE_MANAGEMENT_BASE;
  };
  routing: {
    id: typeof PRODUCT_ROUTING_ENGINE_ID;
    version: typeof PRODUCT_ROUTING_ENGINE_VERSION;
    freeze: typeof PRODUCT_ROUTING_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_ROUTING_ENGINE_BASE;
  };
  notificationAudit: {
    id: typeof PRODUCT_NOTIFICATION_AUDIT_ID;
    version: typeof PRODUCT_NOTIFICATION_AUDIT_VERSION;
    freeze: typeof PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_NOTIFICATION_AUDIT_BASE;
  };
};

export type ProductNotificationFreezeLock = {
  version: typeof PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_NOTIFICATION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID;
  signoff: typeof PRODUCT_NOTIFICATION_SIGNOFF_VERSION;
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
  phases: ProductNotificationPhaseVersions;
  components: ProductNotificationComponentLock[];
  readOnly: true;
};

export const PRODUCT_NOTIFICATION_COMPONENT_LOCK: ProductNotificationComponentLock[] =
  [
    {
      id: "notification-foundation",
      path: "lib/product/notification/",
      label: "Product Notification Foundation",
      required: true,
    },
    {
      id: "notification-template",
      path: "lib/product/notification-template/",
      label: "Product Notification Template Management",
      required: true,
    },
    {
      id: "channel",
      path: "lib/product/channel/",
      label: "Product Channel Management",
      required: true,
    },
    {
      id: "delivery",
      path: "lib/product/delivery/",
      label: "Product Delivery Engine",
      required: true,
    },
    {
      id: "preference",
      path: "lib/product/preference/",
      label: "Product Preference Management",
      required: true,
    },
    {
      id: "routing",
      path: "lib/product/routing/",
      label: "Product Routing Engine",
      required: true,
    },
    {
      id: "notification-audit",
      path: "lib/product/notification-audit/",
      label: "Product Notification Audit",
      required: true,
    },
    {
      id: "notification-freeze",
      path: "lib/product/notification-baseline/",
      label: "Product Notification Governance Freeze",
      required: true,
    },
  ];

export const PRODUCT_NOTIFICATION_PHASE_VERSIONS: ProductNotificationPhaseVersions =
  {
    foundation: {
      id: PRODUCT_NOTIFICATION_FOUNDATION_ID,
      version: PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
      freeze: PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
      base: PRODUCT_NOTIFICATION_FOUNDATION_BASE,
    },
    template: {
      id: PRODUCT_TEMPLATE_MANAGEMENT_ID,
      version: PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
      freeze: PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
      base: PRODUCT_TEMPLATE_MANAGEMENT_BASE,
    },
    channel: {
      id: PRODUCT_CHANNEL_MANAGEMENT_ID,
      version: PRODUCT_CHANNEL_MANAGEMENT_VERSION,
      freeze: PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
      base: PRODUCT_CHANNEL_MANAGEMENT_BASE,
    },
    delivery: {
      id: PRODUCT_DELIVERY_ENGINE_ID,
      version: PRODUCT_DELIVERY_ENGINE_VERSION,
      freeze: PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
      base: PRODUCT_DELIVERY_ENGINE_BASE,
    },
    preference: {
      id: PRODUCT_PREFERENCE_MANAGEMENT_ID,
      version: PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
      freeze: PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
      base: PRODUCT_PREFERENCE_MANAGEMENT_BASE,
    },
    routing: {
      id: PRODUCT_ROUTING_ENGINE_ID,
      version: PRODUCT_ROUTING_ENGINE_VERSION,
      freeze: PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
      base: PRODUCT_ROUTING_ENGINE_BASE,
    },
    notificationAudit: {
      id: PRODUCT_NOTIFICATION_AUDIT_ID,
      version: PRODUCT_NOTIFICATION_AUDIT_VERSION,
      freeze: PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
      base: PRODUCT_NOTIFICATION_AUDIT_BASE,
    },
  };

export const PRODUCT_NOTIFICATION_FREEZE_LOCK: ProductNotificationFreezeLock = {
  version: PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
  base: PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_NOTIFICATION_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  signoff: PRODUCT_NOTIFICATION_SIGNOFF_VERSION,
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
  phases: PRODUCT_NOTIFICATION_PHASE_VERSIONS,
  components: PRODUCT_NOTIFICATION_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductNotificationFreezeLockIntact(
  lock: ProductNotificationFreezeLock = PRODUCT_NOTIFICATION_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-notification-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-notification-baseline-v1" &&
    lock.base === PRODUCT_NOTIFICATION_AUDIT_ID &&
    lock.phases.foundation.id === PRODUCT_NOTIFICATION_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID &&
    lock.phases.template.base === PRODUCT_NOTIFICATION_FOUNDATION_ID &&
    lock.phases.channel.base === PRODUCT_TEMPLATE_MANAGEMENT_ID &&
    lock.phases.delivery.base === PRODUCT_CHANNEL_MANAGEMENT_ID &&
    lock.phases.preference.base === PRODUCT_DELIVERY_ENGINE_ID &&
    lock.phases.routing.base === PRODUCT_PREFERENCE_MANAGEMENT_ID &&
    lock.phases.notificationAudit.base === PRODUCT_ROUTING_ENGINE_ID &&
    lock.phases.notificationAudit.id === PRODUCT_NOTIFICATION_AUDIT_ID &&
    lock.components.length === 8
  );
}
