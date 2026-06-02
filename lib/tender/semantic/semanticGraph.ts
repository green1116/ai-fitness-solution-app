import type { SemanticOverview, TenderSemanticGraph } from "./types";

export function summarizeSemanticGraph(graph: TenderSemanticGraph): SemanticOverview {
  const risksByType: SemanticOverview["risksByType"] = {
    technical: 0,
    commercial: 0,
    delivery: 0,
    procurement: 0,
    compliance: 0,
  };

  for (const r of graph.risks) {
    risksByType[r.riskType] += 1;
  }

  let complianceCovered = 0;
  let compliancePartial = 0;
  let complianceMissing = 0;
  for (const c of graph.compliance) {
    if (c.responseStatus === "covered") complianceCovered += 1;
    else if (c.responseStatus === "partial") compliancePartial += 1;
    else complianceMissing += 1;
  }

  return {
    sectionCount: graph.sections.length,
    requirementCount: graph.requirements.length,
    scoringCount: graph.scoringItems.length,
    riskCount: graph.risks.length,
    complianceCovered,
    compliancePartial,
    complianceMissing,
    risksByType,
  };
}
