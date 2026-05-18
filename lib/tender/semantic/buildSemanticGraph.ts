import type { TenderIntelligenceResult, TenderRequirement } from "@/lib/tender/types";

import { buildComplianceGraph } from "./semanticCompliance";
import { buildSemanticRequirements, attachRequirementRelations } from "./semanticRequirements";
import { buildSemanticRisks, mapRiskIdsToRequirements } from "./semanticRisks";
import { buildSemanticScoringItems } from "./semanticScoring";
import {
  buildSemanticSections,
  linkSectionRelations,
} from "./semanticSections";
import { summarizeSemanticGraph } from "./semanticGraph";
import type { SemanticOverview, TenderSemanticGraph } from "./types";

function mapRequirementToSection(
  requirements: TenderRequirement[],
  sections: TenderIntelligenceResult["sections"],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const req of requirements) {
    const snippet = req.requirement.slice(0, 24);
    if (!snippet) continue;
    for (const sec of sections) {
      if (sec.content.includes(snippet)) {
        map.set(req.id, sec.id);
        break;
      }
    }
  }
  return map;
}

function invertSectionLinks(
  sections: { id: string }[],
  reqToSection: Map<string, string>,
  reqIds: string[],
): Map<string, string[]> {
  const bySection = new Map<string, string[]>();
  for (const reqId of reqIds) {
    const secId = reqToSection.get(reqId);
    if (!secId) continue;
    const cur = bySection.get(secId) || [];
    cur.push(reqId);
    bySection.set(secId, cur);
  }
  for (const s of sections) {
    if (!bySection.has(s.id)) bySection.set(s.id, []);
  }
  return bySection;
}

export type BuildSemanticGraphResult = {
  graph: TenderSemanticGraph;
  overview: SemanticOverview;
};

/**
 * parseResult → semantic graph pipeline
 */
export function buildSemanticGraph(
  parseResult: TenderIntelligenceResult,
): BuildSemanticGraphResult {
  let sections = buildSemanticSections(parseResult.sections);

  const reqSectionMap = mapRequirementToSection(
    parseResult.requirements,
    parseResult.sections,
  );

  let requirements = buildSemanticRequirements(
    parseResult.requirements,
    reqSectionMap,
  );

  const scoringItems = buildSemanticScoringItems(sections);
  const risks = buildSemanticRisks(requirements, scoringItems);

  const riskByReq = mapRiskIdsToRequirements(risks);
  const scoringByReq = new Map<string, string[]>();
  for (const item of scoringItems) {
    for (const secId of item.relatedSections) {
      const secReqs = sections.find((s) => s.id === secId)?.linkedRequirements;
      void secReqs;
    }
  }
  for (const req of requirements) {
    const linked = scoringItems
      .filter(
        (s) =>
          s.scoringCategory === req.category ||
          s.title.includes(req.title.slice(0, 4)),
      )
      .map((s) => s.id)
      .slice(0, 3);
    if (linked.length) scoringByReq.set(req.id, linked);
  }

  requirements = attachRequirementRelations(requirements, riskByReq, scoringByReq);

  const compliance = buildComplianceGraph(
    requirements,
    sections,
    scoringItems,
    risks,
  );

  const reqIds = requirements.map((r) => r.id);
  const reqToSec = new Map<string, string>();
  for (const [reqId, secId] of reqSectionMap) reqToSec.set(reqId, secId);

  const scoringBySection = new Map<string, string[]>();
  for (const item of scoringItems) {
    for (const sid of item.relatedSections) {
      const cur = scoringBySection.get(sid) || [];
      cur.push(item.id);
      scoringBySection.set(sid, cur);
    }
  }

  const riskBySection = new Map<string, string[]>();
  for (const risk of risks) {
    for (const reqId of risk.linkedRequirements || []) {
      const sid = reqToSec.get(reqId);
      if (!sid) continue;
      const cur = riskBySection.get(sid) || [];
      cur.push(risk.id);
      riskBySection.set(sid, cur);
    }
  }

  sections = linkSectionRelations(
    sections,
    invertSectionLinks(sections, reqToSec, reqIds),
    scoringBySection,
    riskBySection,
  );

  const graph: TenderSemanticGraph = {
    sections,
    requirements,
    scoringItems,
    risks,
    compliance,
  };

  return { graph, overview: summarizeSemanticGraph(graph) };
}
