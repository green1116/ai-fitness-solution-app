/**
 * Product Customer Activity — public exports
 * Isolated namespace: lib/product/customer-activity
 */

export {
  ACTIVITY_EVENT_KINDS,
  ACTIVITY_SESSION_STATUSES,
  CUSTOMER_ACTIVITY_MANAGER_STATUSES,
  CUSTOMER_ACTIVITY_READINESS_VERDICTS,
  ENGAGEMENT_LEVELS,
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
  TIMELINE_ENTRY_KINDS,
} from "./activity/activity.constants";

export type {
  CustomerActivityManagerStatus,
  CustomerActivityReadinessCheck,
  CustomerActivityReadinessResult,
  CustomerActivityReadinessVerdict,
  CustomerActivityRegistryManifest,
} from "./activity/activity.types";

export type {
  ActivityEventKind,
  CustomerActivityEvent,
  EventMetadata,
  RecordActivityEventInput,
} from "./event/event.types";

export {
  clearActivityEvents,
  getActivityEvent,
  listActivityEvents,
  recordActivityEvent,
} from "./event/event.registry";

export type {
  ActivitySessionStatus,
  CloseActivitySessionInput,
  CustomerActivitySession,
  OpenActivitySessionInput,
  SessionMetadata,
} from "./session/session.types";

export {
  clearActivitySessions,
  closeActivitySession,
  getActivitySession,
  listActivitySessions,
  openActivitySession,
} from "./session/session.registry";

export type {
  CustomerActivityEngagement,
  EngagementLevel,
  EngagementMetadata,
  ScoreEngagementInput,
} from "./engagement/engagement.types";

export {
  clearEngagements,
  getEngagement,
  listEngagements,
  scoreEngagement,
} from "./engagement/engagement.registry";

export type {
  AppendTimelineEntryInput,
  CustomerActivityTimelineEntry,
  TimelineEntryKind,
  TimelineMetadata,
} from "./timeline/timeline.types";

export {
  appendTimelineEntry,
  clearTimelineEntries,
  getTimelineEntry,
  listTimelineEntries,
} from "./timeline/timeline.registry";

export {
  assertCustomerActivityReadinessReady,
  evaluateCustomerActivityReadiness,
} from "./activity/activity.readiness";

export {
  clearCustomerActivityLayer,
  createCustomerActivityManager,
  getCustomerActivityRegistryManifest,
  type CustomerActivityManager,
  type CustomerActivityManagerSnapshot,
} from "./customer-activity.manager";

export {
  assertProductCustomerActivityReleaseGatePass,
  checkProductCustomerActivityReleaseGate,
  PRODUCT_CUSTOMER_ACTIVITY_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
