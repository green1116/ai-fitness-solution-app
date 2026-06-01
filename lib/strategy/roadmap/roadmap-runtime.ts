import { computeInitiativeScore } from "../initiatives";
import { computeObjectiveScore } from "../objectives";
import type { StrategicInitiative } from "../initiatives";
import type { StrategicObjective } from "../objectives";
import type { RoadmapSnapshot } from "./types";

export function buildRoadmapSnapshot(input: {
  deploymentId: string;
  objectives: StrategicObjective[];
  initiatives: StrategicInitiative[];
}): RoadmapSnapshot {
  const objectiveScore = computeObjectiveScore(input.objectives);
  const initiativeScore = computeInitiativeScore(input.initiatives);
  const coverageRatio =
    input.objectives.length === 0
      ? 0
      : input.initiatives.filter((init) =>
          input.objectives.some((obj) => obj.id === init.objectiveId),
        ).length / input.objectives.length;
  const coverageScore = Math.round(Math.min(1, coverageRatio) * 100);
  const roadmapScore = Math.round((objectiveScore + initiativeScore + coverageScore) / 3);

  return {
    snapshotId: `roadmap-${input.deploymentId}`,
    objectives: input.objectives,
    initiatives: input.initiatives,
    roadmapScore,
  };
}
