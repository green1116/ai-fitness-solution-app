/**
 * V80 POST-LAUNCH P4 — Autonomous growth entry (spec exports)
 */
export { V80_POSTLAUNCH_AUTONOMY_VERSION, V80_POSTLAUNCH_AUTONOMY_FREEZE_VERSION } from "./autonomy.types";
export type {
  AutonomousLeadSignal,
  SelfGeneratingSalesStep,
  AutonomousExpansionRule,
  ClosedLoopFlywheelStage,
  AutonomyManifest,
  AutonomousGrowthReport,
} from "./autonomy.types";

export { AUTONOMOUS_LEAD_GENERATION, isAutonomousLeadGenerationComplete } from "./autonomy.lead-generation.spec";
export { SELF_GENERATING_SALES_MOTION, isSelfGeneratingSalesMotionComplete } from "./autonomy.sales-motion.spec";
export { AUTONOMOUS_EXPANSION_ENGINE, isAutonomousExpansionEngineComplete } from "./autonomy.expansion-engine.spec";
export { CLOSED_LOOP_GROWTH_FLYWHEEL, isClosedLoopGrowthFlywheelComplete } from "./autonomy.flywheel.spec";

export {
  buildAutonomousGrowth,
  buildAutonomyManifest,
  assertAutonomousGrowthPass,
  formatAutonomySummary,
  runAutonomousGrowth,
} from "./autonomy.builder";
