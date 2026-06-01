import type { AlignmentAssessment } from "../alignment";
import type { PlanningHorizon } from "../objectives";
import type { RoadmapSnapshot } from "../roadmap";
import type { STRATEGIC_PLANNING_RUNTIME_VERSION } from "../objectives";

export interface StrategicSummary {
  summaryId: string;
  strategyScore: number;
  alignmentScore: number;
  planningScore: number;
  horizons: PlanningHorizon[];
  roadmap: RoadmapSnapshot;
  alignment: AlignmentAssessment;
}

export interface StrategicPlanningReport {
  version: typeof STRATEGIC_PLANNING_RUNTIME_VERSION;
  reportId: string;
  deploymentId: string;
  strategyScore: number;
  alignmentScore: number;
  planningScore: number;
  summary: StrategicSummary;
  runtimeSummary: string;
}
