/**
 * V94 — Executive briefing & decision support types
 */

import type { GovernanceActionEntry } from "@/lib/pilot/v92";
import type { DrilldownLink, ExecutiveMetrics, ExecutiveSummary } from "@/lib/pilot/v93";

export const V94_EXECUTIVE_BRIEFING_VERSION = "v94-executive-briefing-1";

export type BriefingPriority = "critical" | "high" | "medium";

export type KeyRiskItem = {
  sessionId: string;
  label: string;
  severity: BriefingPriority;
  exposure: number;
  riskScore: number;
  readOnly: true;
};

export type KeyOpportunityItem = {
  sessionId: string;
  label: string;
  value: number;
  expansionPotential: number;
  readOnly: true;
};

export type PendingDecisionItem = {
  sessionId: string;
  label: string;
  priority: BriefingPriority;
  ownerId?: string;
  ownerName?: string;
  dueDate?: string;
  recommendedAction: string;
  readOnly: true;
};

export type BriefingContent = {
  narrative: string;
  keyRisks: KeyRiskItem[];
  keyOpportunities: KeyOpportunityItem[];
  pendingDecisions: PendingDecisionItem[];
  readOnly: true;
};

export type DecisionSupportItem = {
  sessionId: string;
  projectName?: string;
  recommendedAction: string;
  priorityDecision: BriefingPriority;
  ownerId?: string;
  ownerName?: string;
  dueDate: string;
  rankScore: number;
  expectedValue: number;
  readOnly: true;
};

export type BriefingPackStatus = "draft" | "issued" | "acted";

export type BriefingPack = {
  id: string;
  organizationId: string;
  title: string;
  generatedAt: string;
  status: BriefingPackStatus;
  summary: ExecutiveSummary;
  briefing: BriefingContent;
  decisionSupport: DecisionSupportItem[];
  keyMetrics: ExecutiveMetrics;
  drilldownLinks: DrilldownLink[];
  decisionLog: GovernanceActionEntry[];
  readOnly: true;
};

export type BriefingActionType =
  | "generate_briefing_pack"
  | "record_briefing_action"
  | "mark_decision_acted";

export type BriefingActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: BriefingActionType;
  briefingId?: string;
  sessionId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type ExecutiveBriefingDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  summary: ExecutiveSummary;
  briefing: BriefingContent;
  decisionSupport: DecisionSupportItem[];
  keyMetrics: ExecutiveMetrics;
  packs: BriefingPack[];
  recentActions: BriefingActionEntry[];
  readOnly: true;
};

export type BriefingPackDetail = {
  pack: BriefingPack;
  actionHistory: BriefingActionEntry[];
  readOnly: true;
};
