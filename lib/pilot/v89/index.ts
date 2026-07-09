/**
 * V89 — Expansion ops & account growth
 */

export {
  V89_EXPANSION_OPS_VERSION,
  type AccountGrowthView,
  type ExpansionOpsActionEntry,
  type ExpansionOpsActionType,
  type ExpansionOpsDashboard,
  type ExpansionOpsDetail,
  type ExpansionOpsRecord,
  type ExpansionOpsStatus,
  type ExpansionOutcome,
  type ExpansionQueue,
  type ExpansionQueueItem,
  mapPlanningToExpansionQueue,
} from "./expansion-ops/expansion-ops.types";

export {
  clearExpansionOpsStoreForTests,
  getExpansionOpsRecord,
  getOrCreateExpansionOpsRecord,
  listExpansionOpsActions,
  listExpansionOpsRecordsForOrg,
} from "./expansion-ops/expansion-ops.store";

export { buildAccountGrowthView } from "./expansion-ops/account-growth.service";

export {
  buildExpansionPipeline,
  buildExpansionQueueItem,
  qualifyExpansionQueue,
} from "./expansion-ops/expansion-pipeline.service";

export {
  assignExpansionOwner,
  markExpansionExpanded,
  markExpansionLost,
  markExpansionRetained,
  recordExpansionProposal,
  scheduleExpansionFollowUp,
} from "./expansion-ops/expansion-control.service";

export {
  buildExpansionOpsDashboard,
  buildExpansionOpsDetail,
} from "./expansion-ops/expansion-dashboard.service";
