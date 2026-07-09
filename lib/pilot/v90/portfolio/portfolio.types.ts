/**
 * V90 — Portfolio intelligence & segmentation types
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { ExpansionQueueItem } from "@/lib/pilot/v89";
import type { GrowthPlanningQueueItem } from "@/lib/pilot/v88";
import type { RevenueQueueItem } from "@/lib/pilot/v87";

export const V90_PORTFOLIO_VERSION = "v90-portfolio-1";

export type PortfolioSegment =
  | "enterprise"
  | "high_value"
  | "at_risk"
  | "expansion_ready"
  | "active"
  | "dormant"
  | "churn_rescue"
  | "release_ready"
  | "follow_up_needed";

export type PortfolioActionBadge =
  | "expand"
  | "retain"
  | "rescue"
  | "follow_up"
  | "monitor";

export type PortfolioAccountRow = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  segments: PortfolioSegment[];
  primarySegment: PortfolioSegment;
  segmentHealthScore: number;
  expansionPotential: number;
  churnExposure: number;
  expectedValue: number;
  rankScore: number;
  rankPosition: number;
  nextAction: string;
  actionBadge: PortfolioActionBadge;
  riskScore: number;
  renewalLikelihood: number;
  daysUntilRenewal: number;
  account: AccountHealthRow;
  expansionItem: ExpansionQueueItem | null;
  growthItem: GrowthPlanningQueueItem | null;
  revenueItem: RevenueQueueItem | null;
  readOnly: true;
};

export type SegmentIntelligence = {
  segment: PortfolioSegment;
  label: string;
  accountCount: number;
  segmentHealthScore: number;
  expansionPotential: number;
  churnExposure: number;
  expectedValue: number;
  readOnly: true;
};

export type PortfolioPrioritization = {
  topAccounts: PortfolioAccountRow[];
  topExpansionTargets: PortfolioAccountRow[];
  topRescueAccounts: PortfolioAccountRow[];
  nextActionBySegment: Record<PortfolioSegment, string>;
  readOnly: true;
};

export type PortfolioDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  segmentCards: SegmentIntelligence[];
  prioritization: PortfolioPrioritization;
  rankedAccounts: PortfolioAccountRow[];
  summary: {
    totalAccounts: number;
    enterprise: number;
    highValue: number;
    atRisk: number;
    expansionReady: number;
    churnRescue: number;
    avgHealthScore: number;
    totalExpectedValue: number;
  };
  readOnly: true;
};

export type PortfolioAccountDetail = {
  sessionId: string;
  account: PortfolioAccountRow;
  actionHistory: Array<{
    id: string;
    action: string;
    timestamp: string;
    note?: string;
    source: "expansion" | "growth" | "portfolio";
  }>;
  readOnly: true;
};

export const SEGMENT_LABELS: Record<PortfolioSegment, string> = {
  enterprise: "企业级",
  high_value: "高价值",
  at_risk: "高风险",
  expansion_ready: "扩展就绪",
  active: "活跃",
  dormant: "沉默",
  churn_rescue: "流失救援",
  release_ready: "发布就绪",
  follow_up_needed: "需跟进",
};

export const SEGMENT_NEXT_ACTIONS: Record<PortfolioSegment, string> = {
  enterprise: "企业级客户战略回顾",
  high_value: "高价值客户留存计划",
  at_risk: "风险干预与续约确认",
  expansion_ready: "推进扩展提案",
  active: "持续培育与增值",
  dormant: "唤醒触达",
  churn_rescue: "紧急流失救援",
  release_ready: "监控交付与采用",
  follow_up_needed: "客户成功跟进",
};
