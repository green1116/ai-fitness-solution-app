import { buildAlignmentAssessment } from "../alignment";
import { buildDefaultStrategicInitiatives } from "../initiatives";
import {
  buildDefaultStrategicObjectives,
  buildPlanningHorizons,
  STRATEGIC_PLANNING_RUNTIME_VERSION,
} from "../objectives";
import { buildRoadmapSnapshot } from "../roadmap";
import { buildStrategicSummary } from "../reports";
import type { StrategicPlanningReport } from "../reports";

export function runStrategicPlanning(input?: {
  deploymentId?: string;
}): StrategicPlanningReport {
  const deploymentId = input?.deploymentId ?? "strategic-planning-default";
  const objectives = buildDefaultStrategicObjectives();
  const horizons = buildPlanningHorizons();
  const initiatives = buildDefaultStrategicInitiatives();
  const roadmap = buildRoadmapSnapshot({ deploymentId, objectives, initiatives });
  const alignment = buildAlignmentAssessment({ deploymentId, roadmap });
  const summary = buildStrategicSummary({ deploymentId, horizons, roadmap, alignment });

  const report: StrategicPlanningReport = {
    version: STRATEGIC_PLANNING_RUNTIME_VERSION,
    reportId: `strategic-planning-${deploymentId}`,
    deploymentId,
    strategyScore: summary.strategyScore,
    alignmentScore: summary.alignmentScore,
    planningScore: summary.planningScore,
    summary,
    runtimeSummary: [
      `strategic-planning id=${deploymentId}`,
      `objectives=${objectives.length}`,
      `initiatives=${initiatives.length}`,
      `horizons=${horizons.length}`,
      `roadmapScore=${roadmap.roadmapScore}`,
      `strategyScore=${summary.strategyScore}`,
      `alignmentScore=${summary.alignmentScore}`,
      `planningScore=${summary.planningScore}`,
    ].join(" "),
  };

  return report;
}
