import { computeAlignmentScore } from "../alignment";
import type { AlignmentAssessment } from "../alignment";
import { computeInitiativeScore } from "../initiatives";
import { computeObjectiveScore, type PlanningHorizon } from "../objectives";
import type { RoadmapSnapshot } from "../roadmap";
import type { StrategicSummary } from "./types";

export function buildStrategicSummary(input: {
  deploymentId: string;
  horizons: PlanningHorizon[];
  roadmap: RoadmapSnapshot;
  alignment: AlignmentAssessment;
}): StrategicSummary {
  const strategyScore = Math.round(
    (computeObjectiveScore(input.roadmap.objectives) + input.roadmap.roadmapScore) / 2,
  );
  const alignmentScore = computeAlignmentScore(input.alignment);
  const planningScore = Math.round(
    (input.roadmap.roadmapScore +
      computeInitiativeScore(input.roadmap.initiatives) +
      input.horizons.length * 20) /
      3,
  );

  return {
    summaryId: `strategic-summary-${input.deploymentId}`,
    strategyScore,
    alignmentScore,
    planningScore,
    horizons: input.horizons,
    roadmap: input.roadmap,
    alignment: input.alignment,
  };
}
