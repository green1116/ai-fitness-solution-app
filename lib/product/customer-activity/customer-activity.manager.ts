/**
 * Product Customer Activity — Customer Activity Manager
 */

import {
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
} from "./activity/activity.constants";
import {
  assertCustomerActivityReadinessReady,
  evaluateCustomerActivityReadiness,
} from "./activity/activity.readiness";
import type {
  CustomerActivityManagerStatus,
  CustomerActivityReadinessResult,
  CustomerActivityRegistryManifest,
} from "./activity/activity.types";
import {
  clearEngagements,
  getEngagement,
  listEngagements,
  scoreEngagement,
} from "./engagement/engagement.registry";
import type {
  CustomerActivityEngagement,
  ScoreEngagementInput,
} from "./engagement/engagement.types";
import {
  clearActivityEvents,
  getActivityEvent,
  listActivityEvents,
  recordActivityEvent,
} from "./event/event.registry";
import type {
  CustomerActivityEvent,
  RecordActivityEventInput,
} from "./event/event.types";
import {
  clearActivitySessions,
  closeActivitySession,
  getActivitySession,
  listActivitySessions,
  openActivitySession,
} from "./session/session.registry";
import type {
  CloseActivitySessionInput,
  CustomerActivitySession,
  OpenActivitySessionInput,
} from "./session/session.types";
import {
  appendTimelineEntry,
  clearTimelineEntries,
  getTimelineEntry,
  listTimelineEntries,
} from "./timeline/timeline.registry";
import type {
  AppendTimelineEntryInput,
  CustomerActivityTimelineEntry,
} from "./timeline/timeline.types";

export type CustomerActivityManagerSnapshot = {
  managerId: string;
  status: CustomerActivityManagerStatus;
  layerId: typeof PRODUCT_CUSTOMER_ACTIVITY_ID;
  version: typeof PRODUCT_CUSTOMER_ACTIVITY_VERSION;
  eventCount: number;
  sessionCount: number;
  engagementCount: number;
  timelineCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerActivityManager = {
  initialize: () => CustomerActivityManagerSnapshot;
  start: () => CustomerActivityManagerSnapshot;
  stop: () => CustomerActivityManagerSnapshot;
  status: () => CustomerActivityManagerSnapshot;
  recordActivityEvent: (
    input: RecordActivityEventInput,
  ) => CustomerActivityEvent;
  openActivitySession: (
    input: OpenActivitySessionInput,
  ) => CustomerActivitySession;
  closeActivitySession: (
    input: CloseActivitySessionInput,
  ) => CustomerActivitySession;
  scoreEngagement: (
    input: ScoreEngagementInput,
  ) => CustomerActivityEngagement;
  appendTimelineEntry: (
    input: AppendTimelineEntryInput,
  ) => CustomerActivityTimelineEntry;
  evaluateReadiness: () => CustomerActivityReadinessResult;
  manifest: () => CustomerActivityRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCustomerActivityRegistryManifest(): CustomerActivityRegistryManifest {
  return {
    activityId: PRODUCT_CUSTOMER_ACTIVITY_ID,
    version: PRODUCT_CUSTOMER_ACTIVITY_VERSION,
    freezeVersion: PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_ACTIVITY_BASE,
    eventCount: listActivityEvents().length,
    sessionCount: listActivitySessions().length,
    engagementCount: listEngagements().length,
    timelineCount: listTimelineEntries().length,
  };
}

export function clearCustomerActivityLayer(): void {
  clearTimelineEntries();
  clearEngagements();
  clearActivitySessions();
  clearActivityEvents();
}

export function createCustomerActivityManager(options?: {
  managerId?: string;
}): CustomerActivityManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cact-mgr");
  let state: CustomerActivityManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CustomerActivityManagerSnapshot {
    const reg = getCustomerActivityRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CUSTOMER_ACTIVITY_ID,
      version: PRODUCT_CUSTOMER_ACTIVITY_VERSION,
      eventCount: reg.eventCount,
      sessionCount: reg.sessionCount,
      engagementCount: reg.engagementCount,
      timelineCount: reg.timelineCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CustomerActivityManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCustomerActivityLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CustomerActivityManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CustomerActivityManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    recordActivityEvent: (input) => {
      assertRunning("recordActivityEvent");
      return recordActivityEvent(input);
    },
    openActivitySession: (input) => {
      assertRunning("openActivitySession");
      return openActivitySession(input);
    },
    closeActivitySession: (input) => {
      assertRunning("closeActivitySession");
      return closeActivitySession(input);
    },
    scoreEngagement: (input) => {
      assertRunning("scoreEngagement");
      return scoreEngagement(input);
    },
    appendTimelineEntry: (input) => {
      assertRunning("appendTimelineEntry");
      return appendTimelineEntry(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerActivityReadiness();
    },
    manifest: getCustomerActivityRegistryManifest,
  };
}

export {
  assertCustomerActivityReadinessReady,
  getActivityEvent,
  getActivitySession,
  getEngagement,
  getTimelineEntry,
  listActivityEvents,
  listActivitySessions,
  listEngagements,
  listTimelineEntries,
};
