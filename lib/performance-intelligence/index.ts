/**
 * V46 Performance Intelligence — Phase 1.
 * Read-only extension over V44 Win-Loss / V45 Project Delivery.
 */
export * from "./shared/constants";
export * from "./shared/types";

export { buildOutcomeRegistry } from "@/lib/win-loss-intelligence";
export { buildProjectDeliveryFoundationContext } from "@/lib/project-delivery-intelligence";

export * from "./performance-foundation/performance-types";
export { buildPerformanceRegistry } from "./performance-foundation/performance-registry";
export { calculatePerformanceMetrics } from "./performance-foundation/performance-metrics";
export { buildPerformanceContext } from "./performance-foundation/performance-context";
export { validatePerformanceFoundation } from "./performance-foundation/performance-validation";

export * from "./benchmark-layer/benchmark-types";
export { buildBrandBenchmarkRegistry } from "./benchmark-layer/brand-benchmark-registry";
export { buildSupplierBenchmarkRegistry } from "./benchmark-layer/supplier-benchmark-registry";
export { buildProductBenchmarkRegistry } from "./benchmark-layer/product-benchmark-registry";
export { buildProjectBenchmarkRegistry } from "./benchmark-layer/project-benchmark-registry";
export { buildBenchmarkContext } from "./benchmark-layer/benchmark-context";
export { validateBenchmarkLayer } from "./benchmark-layer/benchmark-validation";
