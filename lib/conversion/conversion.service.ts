/**
 * V64 P2 — Conversion Optimization System public API
 */

export type {
  ConversionMetrics,
  ConversionThresholds,
  ConversionVariant,
  ConversionLoopResult,
  FunnelStepMetrics,
  ConversionExperimentType,
} from "./conversion.types";

export { computeConversionThresholds } from "./conversion.types";

export { aggregateConversionMetrics } from "./core/conversion.context";
export { runConversionEngine, autoImproveConversionLoop } from "./core/conversion.engine";

export { analyzeFunnelPerformance } from "./funnel/funnel.analyzer";
export { optimizeConversionFunnel } from "./funnel/funnel.optimizer";
export { describeConversionFunnel } from "./funnel/funnel.steps";

export {
  generateABVariants,
  testConversionRates,
  selectBestPerformingVariant,
  runAbExperiment,
} from "./ab-testing/ab.engine";

export { splitAndTrack, assignVariant } from "./ab-testing/ab.splitter";
export { recordAbEvent, getAbEventsSnapshot, clearAbStoreForTests } from "./ab-testing/ab.tracker";

export { optimizeLandingPage } from "./landing/landing.optimizer";
export { generateLandingVariants } from "./landing/landing.variant.engine";

export { optimizeDemoFlow } from "./demo/demo.flow.optimizer";
export { optimizeDemoConversion } from "./demo/demo.conversion.optimizer";

export { optimizeCTAButtons } from "./cta/cta.optimizer";
export { generateCTAVariants } from "./cta/cta.variants";
