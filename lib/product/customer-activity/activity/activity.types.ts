/**
 * Product Customer Activity — readiness / manifest types
 */

import type {
  CUSTOMER_ACTIVITY_MANAGER_STATUSES,
  CUSTOMER_ACTIVITY_READINESS_VERDICTS,
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
} from "./activity.constants";

export type CustomerActivityReadinessVerdict =
  (typeof CUSTOMER_ACTIVITY_READINESS_VERDICTS)[number];
export type CustomerActivityManagerStatus =
  (typeof CUSTOMER_ACTIVITY_MANAGER_STATUSES)[number];

export type CustomerActivityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerActivityReadinessResult = {
  verdict: CustomerActivityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerActivityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CustomerActivityRegistryManifest = {
  activityId: typeof PRODUCT_CUSTOMER_ACTIVITY_ID;
  version: typeof PRODUCT_CUSTOMER_ACTIVITY_VERSION;
  freezeVersion: typeof PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION;
  base: typeof PRODUCT_CUSTOMER_ACTIVITY_BASE;
  eventCount: number;
  sessionCount: number;
  engagementCount: number;
  timelineCount: number;
};
