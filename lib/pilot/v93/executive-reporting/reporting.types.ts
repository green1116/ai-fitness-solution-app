/**
 * V93 — Executive reporting & board packet types
 */

import type { GovernanceActionEntry } from "@/lib/pilot/v92";

export const V93_EXECUTIVE_REPORTING_VERSION = "v93-executive-reporting-1";

export type PortfolioSummary = {
  totalAccounts: number;
  enterprise: number;
  expansionReady: number;
  activeGovernance: number;
  avgHealthScore: number;
  readOnly: true;
};

export type RiskSummary = {
  atRisk: number;
  rescue: number;
  blocked: number;
  totalChurnExposure: number;
  avgRiskScore: number;
  readOnly: true;
};

export type ValueSummary = {
  totalExpectedValue: number;
  totalExpansionPotential: number;
  topAccountValue: number;
  readOnly: true;
};

export type DecisionSummary = {
  approved: number;
  deferred: number;
  blocked: number;
  pending: number;
  totalDecisions: number;
  readOnly: true;
};

export type ExecutiveSummary = {
  portfolio: PortfolioSummary;
  risk: RiskSummary;
  value: ValueSummary;
  decisions: DecisionSummary;
  readOnly: true;
};

export type ExecutiveMetrics = {
  governanceQueueSize: number;
  decisionsRecorded: number;
  packetsGenerated: number;
  exportsCount: number;
  reviewedPackets: number;
  readOnly: true;
};

export type DrilldownLink = {
  sessionId: string;
  label: string;
  href: string;
  readOnly: true;
};

export type BoardPacketStatus = "draft" | "scheduled" | "reviewed" | "exported";

export type BoardPacket = {
  id: string;
  organizationId: string;
  title: string;
  generatedAt: string;
  status: BoardPacketStatus;
  summary: ExecutiveSummary;
  metrics: ExecutiveMetrics;
  decisionHistory: GovernanceActionEntry[];
  drilldownLinks: DrilldownLink[];
  scheduledReviewAt?: string;
  reviewedAt?: string;
  exportedAt?: string;
  readOnly: true;
};

export type ReportActionType =
  | "generate_packet"
  | "schedule_review"
  | "mark_reviewed"
  | "export_summary";

export type ReportActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: ReportActionType;
  packetId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type ExecutiveReportingDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  summary: ExecutiveSummary;
  metrics: ExecutiveMetrics;
  packets: BoardPacket[];
  recentDecisions: GovernanceActionEntry[];
  readOnly: true;
};

export type BoardPacketDetail = {
  packet: BoardPacket;
  actionHistory: ReportActionEntry[];
  readOnly: true;
};

export type ExportSummaryResult = {
  organizationId: string;
  exportedAt: string;
  format: "json";
  payload: ExecutiveSummary;
  readOnly: true;
};
