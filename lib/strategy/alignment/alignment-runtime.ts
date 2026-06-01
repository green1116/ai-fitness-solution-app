import type { RoadmapSnapshot } from "../roadmap";
import type { AlignmentAssessment } from "./types";

export function buildAlignmentAssessment(input: {
  deploymentId: string;
  roadmap: RoadmapSnapshot;
}): AlignmentAssessment {
  const base = input.roadmap.roadmapScore;
  const runtimeAlignment = Math.min(100, Math.round(base * 0.95 + 5));
  const governanceAlignment = Math.min(100, Math.round(base * 0.92 + 8));
  const trustAlignment = Math.min(100, Math.round(base * 0.9 + 10));
  const executiveAlignment = Math.min(100, Math.round(base * 0.88 + 12));

  return {
    assessmentId: `alignment-${input.deploymentId}`,
    runtimeAlignment,
    governanceAlignment,
    trustAlignment,
    executiveAlignment,
  };
}

export function computeAlignmentScore(assessment: AlignmentAssessment): number {
  const { runtimeAlignment, governanceAlignment, trustAlignment, executiveAlignment } = assessment;
  return Math.round(
    (runtimeAlignment + governanceAlignment + trustAlignment + executiveAlignment) / 4,
  );
}
