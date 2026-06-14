/**
 * V22 Dynamic Procurement Intelligence — dynamic pricing & lead-time data layer.
 * Phase 1: channel pricing / project pricing / discount rules / lead-time intelligence.
 * Phase 2: procurement bundle aggregation.
 * Phase 3: commercial bundle (V20 catalog + V21 supplier + V22 procurement).
 * No Runtime. No Dashboard.
 */

export * from "./shared/types";
export * from "./channel-pricing";
export * from "./project-pricing";
export * from "./discount-rules";
export * from "./lead-time-intelligence";
export * from "./validation";
export * from "./report";
export {
  buildProcurementSnapshot,
  buildProcurementBundle,
} from "./bridge/procurement-bridge";
export {
  buildCommercialBundle,
  resolveRegionFromCity,
} from "./bridge/commercial-bridge";
