/**
 * Product Customer — Customer Foundation Manager
 */

import {
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
} from "./foundation/foundation.constants";
import {
  assertCustomerFoundationReadinessReady,
  evaluateCustomerFoundationReadiness,
} from "./foundation/foundation.readiness";
import type {
  CustomerManagerStatus,
  CustomerReadinessResult,
  CustomerRegistryManifest,
} from "./foundation/foundation.types";
import {
  clearLifecycleEvents,
  getLifecycleEvent,
  listLifecycleEvents,
  transitionLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  CustomerLifecycleEvent,
  TransitionLifecycleInput,
} from "./lifecycle/lifecycle.types";
import {
  clearCustomers,
  getCustomer,
  listCustomers,
  registerCustomer,
  updateCustomerStatus,
} from "./profile/profile.registry";
import type {
  CustomerProfile,
  RegisterCustomerInput,
  UpdateCustomerStatusInput,
} from "./profile/profile.types";
import {
  clearRelationships,
  getRelationship,
  linkRelationship,
  listRelationships,
} from "./relationship/relationship.registry";
import type {
  CustomerRelationship,
  LinkRelationshipInput,
} from "./relationship/relationship.types";
import {
  assignSegment,
  clearSegments,
  getSegment,
  listSegments,
} from "./segment/segment.registry";
import type {
  AssignSegmentInput,
  CustomerSegmentAssignment,
} from "./segment/segment.types";

export type CustomerManagerSnapshot = {
  managerId: string;
  status: CustomerManagerStatus;
  layerId: typeof PRODUCT_CUSTOMER_FOUNDATION_ID;
  version: typeof PRODUCT_CUSTOMER_FOUNDATION_VERSION;
  profileCount: number;
  relationshipCount: number;
  segmentCount: number;
  lifecycleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerManager = {
  initialize: () => CustomerManagerSnapshot;
  start: () => CustomerManagerSnapshot;
  stop: () => CustomerManagerSnapshot;
  status: () => CustomerManagerSnapshot;
  registerCustomer: (input: RegisterCustomerInput) => CustomerProfile;
  updateCustomerStatus: (
    input: UpdateCustomerStatusInput,
  ) => CustomerProfile;
  linkRelationship: (input: LinkRelationshipInput) => CustomerRelationship;
  assignSegment: (input: AssignSegmentInput) => CustomerSegmentAssignment;
  transitionLifecycle: (
    input: TransitionLifecycleInput,
  ) => CustomerLifecycleEvent;
  evaluateReadiness: () => CustomerReadinessResult;
  manifest: () => CustomerRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCustomerRegistryManifest(): CustomerRegistryManifest {
  return {
    foundationId: PRODUCT_CUSTOMER_FOUNDATION_ID,
    version: PRODUCT_CUSTOMER_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_FOUNDATION_BASE,
    profileCount: listCustomers().length,
    relationshipCount: listRelationships().length,
    segmentCount: listSegments().length,
    lifecycleCount: listLifecycleEvents().length,
  };
}

export function clearCustomerFoundationLayer(): void {
  clearLifecycleEvents();
  clearSegments();
  clearRelationships();
  clearCustomers();
}

export function createCustomerManager(options?: {
  managerId?: string;
}): CustomerManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cus-mgr");
  let state: CustomerManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CustomerManagerSnapshot {
    const reg = getCustomerRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CUSTOMER_FOUNDATION_ID,
      version: PRODUCT_CUSTOMER_FOUNDATION_VERSION,
      profileCount: reg.profileCount,
      relationshipCount: reg.relationshipCount,
      segmentCount: reg.segmentCount,
      lifecycleCount: reg.lifecycleCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CustomerManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCustomerFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CustomerManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CustomerManagerSnapshot {
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
    registerCustomer: (input) => {
      assertRunning("registerCustomer");
      return registerCustomer(input);
    },
    updateCustomerStatus: (input) => {
      assertRunning("updateCustomerStatus");
      return updateCustomerStatus(input);
    },
    linkRelationship: (input) => {
      assertRunning("linkRelationship");
      return linkRelationship(input);
    },
    assignSegment: (input) => {
      assertRunning("assignSegment");
      return assignSegment(input);
    },
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionLifecycle(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerFoundationReadiness();
    },
    manifest: getCustomerRegistryManifest,
  };
}

export {
  assertCustomerFoundationReadinessReady,
  getCustomer,
  getLifecycleEvent,
  getRelationship,
  getSegment,
  listCustomers,
  listLifecycleEvents,
  listRelationships,
  listSegments,
};
