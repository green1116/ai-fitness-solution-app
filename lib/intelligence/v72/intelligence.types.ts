/**
 * V72 P1 — Intelligence catalog types (read-only)
 */

export const V72_INTELLIGENCE_VERSION = "v72-intelligence-catalog-1" as const;
export const V72_INTELLIGENCE_FREEZE_VERSION = "v72-intelligence-catalog-freeze-1" as const;

export type IntelligenceStatus = "draft" | "active" | "paused" | "archived";

export type InsightSeverity = "low" | "medium" | "high" | "critical";

export type TrendDirection = "up" | "down" | "stable" | "volatile";

export type ConfidenceLevel = "low" | "medium" | "high";

export type IntelligenceCatalogEntry = {
  id: string;
  insight: string;
  signal: string;
  metric: string;
  event: string;
  anomaly: boolean;
  trend: TrendDirection;
  owner: string;
  status: IntelligenceStatus;
  source: string;
  severity: InsightSeverity;
  confidence: ConfidenceLevel;
  required: boolean;
  description: string;
};

export type IntelligenceCatalogManifest = {
  version: typeof V72_INTELLIGENCE_VERSION;
  entryCount: number;
  sourceCount: number;
  severityCount: number;
  catalogComplete: boolean;
  insights: IntelligenceCatalogEntry[];
  summary: string;
};

export type IntelligenceCatalogSignals = {
  catalogComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type IntelligenceCatalogReport = {
  version: typeof V72_INTELLIGENCE_VERSION;
  freezeVersion: typeof V72_INTELLIGENCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  manifest: IntelligenceCatalogManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
