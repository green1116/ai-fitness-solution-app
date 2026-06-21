/**
 * V65 — Business Universe public API
 */

export type {
  SaaSInstance,
  IndustryUniverse,
  UniverseRevenueGraph,
  UniverseLoopResult,
  UniverseThresholds,
} from "./universe.types";

export { computeUniverseThresholds, UNIVERSE_INDUSTRY_CATALOG } from "./universe.types";

export { generateSaaSInstance, listGeneratableIndustries } from "./product.generator";
export { cloneBusinessModel, deployNewSaaS } from "./factory.engine";
export { createIndustryUniverse, buildBusinessUniverse, getUniverseSummary } from "./universe.builder";
export { buildUniverseRevenueGraph, analyzeRevenueMatrix } from "./revenue.universe";

export {
  registerSaaSInstance,
  getSaaSInstancesSnapshot,
  clearUniverseStoreForTests,
} from "./universe.store";

export {
  autoCreateSaaS,
  autoScaleSaaS,
  findIndustriesNeedingInstances,
  listManagedSaaS,
} from "@/lib/orchestration/saas.manager";

export {
  autoOptimizeUniverse,
  autoAllocateResources,
  runUniverseOrchestrator,
} from "@/lib/orchestration/universe.orchestrator";

export { routeBusinessOperation, resolveInstanceForIndustry } from "@/lib/orchestration/business.router";
