/**
 * Product Metering — Usage Metering public exports
 * Isolated namespace: lib/product/metering
 */

export {
  AGGREGATION_WINDOWS,
  METER_STATUSES,
  METER_UNITS,
  METERING_MANAGER_STATUSES,
  METERING_READINESS_VERDICTS,
  PRODUCT_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
  RATING_RESULTS,
} from "./usage/usage.constants";

export type {
  MeteringManagerStatus,
  MeteringReadinessCheck,
  MeteringReadinessResult,
  MeteringReadinessVerdict,
  MeteringRegistryManifest,
} from "./usage/usage.types";

export type {
  MeterMetadata,
  MeterStatus,
  MeterUnit,
  RegisterMeterInput,
  UpdateMeterStatusInput,
  UsageMeter,
} from "./meter/meter.types";

export {
  clearMeters,
  getMeter,
  listMeters,
  registerMeter,
  updateMeterStatus,
} from "./meter/meter.registry";

export type {
  EventMetadata,
  RecordUsageEventInput,
  UsageEvent,
} from "./event/event.types";

export {
  clearUsageEvents,
  getUsageEvent,
  listUsageEvents,
  recordUsageEvent,
} from "./event/event.registry";

export type {
  AggregateMetadata,
  AggregateUsageInput,
  AggregationWindow,
  UsageAggregate,
} from "./aggregate/aggregate.types";

export {
  aggregateUsage,
  clearAggregates,
  getAggregate,
  listAggregates,
} from "./aggregate/aggregate.registry";

export type {
  RateUsageInput,
  RatingMetadata,
  RatingResult,
  UsageRating,
} from "./rating/rating.types";

export {
  clearRatings,
  getRating,
  listRatings,
  rateUsage,
} from "./rating/rating.registry";

export {
  assertUsageMeteringReadinessReady,
  evaluateUsageMeteringReadiness,
} from "./usage/usage.readiness";

export {
  clearUsageMeteringLayer,
  createMeteringManager,
  getMeteringRegistryManifest,
  type MeteringManager,
  type MeteringManagerSnapshot,
} from "./metering.manager";

export {
  assertProductMeteringReleaseGatePass,
  checkProductMeteringReleaseGate,
  PRODUCT_METERING_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
