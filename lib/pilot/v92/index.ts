/**
 * V92 — Executive portfolio governance & board review
 */

export {
  V92_BOARD_GOVERNANCE_VERSION,
  EXECUTIVE_QUEUE_LABELS,
  type BoardAccountView,
  type BoardGovernanceDashboard,
  type BoardGovernanceDetail,
  type ExecutiveQueue,
  type ExecutiveQueueItem,
  type GovernanceActionEntry,
  type GovernanceActionType,
  type GovernanceOutcome,
  type GovernanceRecord,
  type GovernanceStatus,
} from "./board-governance/governance.types";

export {
  clearGovernanceStoreForTests,
  getGovernanceRecord,
  getOrCreateGovernanceRecord,
  listGovernanceActions,
  listGovernanceRecordsForOrg,
} from "./board-governance/governance.store";

export { buildBoardAccountView } from "./board-governance/board-review.service";

export {
  buildExecutiveGovernancePipeline,
  buildExecutiveQueueItem,
  classifyExecutiveQueue,
} from "./board-governance/governance-pipeline.service";

export {
  assignExecutiveOwner,
  markGovernanceApproved,
  markGovernanceBlocked,
  markGovernanceDeferred,
  recordGovernanceDecision,
  scheduleBoardReview,
} from "./board-governance/governance-action.service";

export {
  buildBoardGovernanceDashboard,
  buildBoardGovernanceDetail,
} from "./board-governance/board-dashboard.service";
