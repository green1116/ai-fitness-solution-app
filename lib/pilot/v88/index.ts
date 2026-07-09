/**
 * V88 — Growth planning & forecast control
 */

export {
  V88_GROWTH_PLANNING_VERSION,
  type GrowthForecastSummary,
  type GrowthOpsActionEntry,
  type GrowthOpsActionType,
  type GrowthOpsRecord,
  type GrowthOpsStatus,
  type GrowthOutcome,
  type GrowthPlanningDashboard,
  type GrowthPlanningDetail,
  type GrowthPlanningQueue,
  type GrowthPlanningQueueItem,
} from "./growth-planning/growth-ops.types";

export {
  clearGrowthOpsStoreForTests,
  getGrowthOpsRecord,
  getOrCreateGrowthOpsRecord,
  listGrowthOpsActions,
  listGrowthOpsRecordsForOrg,
} from "./growth-planning/growth-ops.store";

export {
  buildGrowthForecastSummary,
  computeExpansionPotential,
  computePredictedValue,
  isHighValueAccount,
} from "./growth-planning/growth-forecast.service";

export {
  buildGrowthPlanningPipeline,
  buildGrowthPlanningQueueItem,
  classifyPlanningQueue,
} from "./growth-planning/growth-pipeline.service";

export {
  assignGrowthOwner,
  classifyPlanningQueueForOrg,
  logGrowthOutcome,
  markGrowthExpanded,
  markGrowthLost,
  markGrowthRetained,
  scheduleExpansionFollowUp,
} from "./growth-planning/growth-control.service";

export {
  buildGrowthPlanningDashboard,
  buildGrowthPlanningDetail,
} from "./growth-planning/growth-dashboard.service";
