/**
 * Product Metering — Usage Metering Manager
 */

import {
  aggregateUsage,
  clearAggregates,
  getAggregate,
  listAggregates,
} from "./aggregate/aggregate.registry";
import type {
  AggregateUsageInput,
  UsageAggregate,
} from "./aggregate/aggregate.types";
import {
  clearUsageEvents,
  getUsageEvent,
  listUsageEvents,
  recordUsageEvent,
} from "./event/event.registry";
import type {
  RecordUsageEventInput,
  UsageEvent,
} from "./event/event.types";
import {
  clearMeters,
  getMeter,
  listMeters,
  registerMeter,
  updateMeterStatus,
} from "./meter/meter.registry";
import type {
  RegisterMeterInput,
  UpdateMeterStatusInput,
  UsageMeter,
} from "./meter/meter.types";
import {
  clearRatings,
  getRating,
  listRatings,
  rateUsage,
} from "./rating/rating.registry";
import type { RateUsageInput, UsageRating } from "./rating/rating.types";
import {
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
} from "./usage/usage.constants";
import {
  assertUsageMeteringReadinessReady,
  evaluateUsageMeteringReadiness,
} from "./usage/usage.readiness";
import type {
  MeteringManagerStatus,
  MeteringReadinessResult,
  MeteringRegistryManifest,
} from "./usage/usage.types";

export type MeteringManagerSnapshot = {
  managerId: string;
  status: MeteringManagerStatus;
  layerId: typeof PRODUCT_USAGE_METERING_ID;
  version: typeof PRODUCT_USAGE_METERING_VERSION;
  meterCount: number;
  eventCount: number;
  aggregateCount: number;
  ratingCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MeteringManager = {
  initialize: () => MeteringManagerSnapshot;
  start: () => MeteringManagerSnapshot;
  stop: () => MeteringManagerSnapshot;
  status: () => MeteringManagerSnapshot;
  registerMeter: (input: RegisterMeterInput) => UsageMeter;
  updateMeterStatus: (input: UpdateMeterStatusInput) => UsageMeter;
  recordUsageEvent: (input: RecordUsageEventInput) => UsageEvent;
  aggregateUsage: (input: AggregateUsageInput) => UsageAggregate;
  rateUsage: (input: RateUsageInput) => UsageRating;
  evaluateReadiness: () => MeteringReadinessResult;
  manifest: () => MeteringRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMeteringRegistryManifest(): MeteringRegistryManifest {
  return {
    foundationId: PRODUCT_USAGE_METERING_ID,
    version: PRODUCT_USAGE_METERING_VERSION,
    freezeVersion: PRODUCT_USAGE_METERING_FREEZE_VERSION,
    base: PRODUCT_USAGE_METERING_BASE,
    meterCount: listMeters().length,
    eventCount: listUsageEvents().length,
    aggregateCount: listAggregates().length,
    ratingCount: listRatings().length,
  };
}

export function clearUsageMeteringLayer(): void {
  clearRatings();
  clearAggregates();
  clearUsageEvents();
  clearMeters();
}

export function createMeteringManager(options?: {
  managerId?: string;
}): MeteringManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-met-mgr");
  let state: MeteringManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MeteringManagerSnapshot {
    const reg = getMeteringRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_USAGE_METERING_ID,
      version: PRODUCT_USAGE_METERING_VERSION,
      meterCount: reg.meterCount,
      eventCount: reg.eventCount,
      aggregateCount: reg.aggregateCount,
      ratingCount: reg.ratingCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): MeteringManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearUsageMeteringLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MeteringManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MeteringManagerSnapshot {
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
    registerMeter: (input) => {
      assertRunning("registerMeter");
      return registerMeter(input);
    },
    updateMeterStatus: (input) => {
      assertRunning("updateMeterStatus");
      return updateMeterStatus(input);
    },
    recordUsageEvent: (input) => {
      assertRunning("recordUsageEvent");
      return recordUsageEvent(input);
    },
    aggregateUsage: (input) => {
      assertRunning("aggregateUsage");
      return aggregateUsage(input);
    },
    rateUsage: (input) => {
      assertRunning("rateUsage");
      return rateUsage(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateUsageMeteringReadiness();
    },
    manifest: getMeteringRegistryManifest,
  };
}

export {
  assertUsageMeteringReadinessReady,
  getAggregate,
  getMeter,
  getRating,
  getUsageEvent,
  listAggregates,
  listMeters,
  listRatings,
  listUsageEvents,
};
