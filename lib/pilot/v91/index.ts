/**
 * V91 — Portfolio ops & strategic actions
 */

export {
  V91_PORTFOLIO_OPS_VERSION,
  OPS_QUEUE_LABELS,
  type AccountStrategyView,
  type PortfolioOpsActionEntry,
  type PortfolioOpsActionType,
  type PortfolioOpsDashboard,
  type PortfolioOpsDetail,
  type PortfolioOpsOutcome,
  type PortfolioOpsQueue,
  type PortfolioOpsQueueItem,
  type PortfolioOpsRecord,
  type PortfolioOpsStatus,
} from "./portfolio-ops/portfolio-ops.types";

export {
  clearPortfolioOpsStoreForTests,
  getPortfolioOpsRecord,
  getOrCreatePortfolioOpsRecord,
  listPortfolioOpsActions,
  listPortfolioOpsRecordsForOrg,
} from "./portfolio-ops/portfolio-ops.store";

export { buildAccountStrategyView } from "./portfolio-ops/account-strategy.service";

export {
  buildPortfolioOpsPipeline,
  buildPortfolioOpsQueueItem,
  classifyPortfolioOpsQueue,
} from "./portfolio-ops/portfolio-ops-pipeline.service";

export {
  assignPortfolioOwner,
  markPortfolioCompleted,
  markPortfolioDeferred,
  markPortfolioLost,
  recordStrategicAction,
  scheduleStrategicReview,
} from "./portfolio-ops/strategic-action.service";

export {
  buildPortfolioOpsDashboard,
  buildPortfolioOpsDetail,
} from "./portfolio-ops/portfolio-ops-dashboard.service";
