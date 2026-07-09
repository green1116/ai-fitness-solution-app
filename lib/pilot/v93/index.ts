/**
 * V93 — Executive reporting & board packet
 */

export {
  V93_EXECUTIVE_REPORTING_VERSION,
  type BoardPacket,
  type BoardPacketDetail,
  type BoardPacketStatus,
  type DecisionSummary,
  type DrilldownLink,
  type ExecutiveMetrics,
  type ExecutiveReportingDashboard,
  type ExecutiveSummary,
  type ExportSummaryResult,
  type PortfolioSummary,
  type ReportActionEntry,
  type ReportActionType,
  type RiskSummary,
  type ValueSummary,
} from "./executive-reporting/reporting.types";

export {
  clearReportCacheForTests,
  getBoardPacket,
  listBoardPackets,
  listPacketActions,
  listReportActions,
} from "./executive-reporting/report-cache";

export {
  buildDecisionSummary,
  buildDrilldownLinks,
  buildExecutiveMetrics,
  buildExecutiveSummary,
  buildPortfolioSummary,
  buildRiskSummary,
  buildValueSummary,
  collectRecentDecisions,
} from "./executive-reporting/reporting.service";

export {
  exportExecutiveSummary,
  generateBoardPacket,
  markPacketReviewed,
  schedulePacketReview,
} from "./executive-reporting/board-packet.service";

export {
  buildBoardPacketDetail,
  buildExecutiveReportingDashboard,
} from "./executive-reporting/executive-dashboard.service";
