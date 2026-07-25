/**
 * Product KPI — Scorecard types
 */

export type ScorecardMetadata = Record<string, unknown>;

export type KpiScorecard = {
  id: string;
  name: string;
  kpiIds: string[];
  onTrackCount: number;
  detail: string;
  metadata: ScorecardMetadata;
  builtAt: string;
};

export type BuildScorecardInput = {
  id?: string;
  name: string;
  kpiIds: string[];
  metadata?: ScorecardMetadata;
};
