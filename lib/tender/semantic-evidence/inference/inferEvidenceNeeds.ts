import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type {
  EvidenceNeedPriority,
  EvidenceNeedSource,
  SemanticEvidenceNeed,
} from "../types";

let needSeq = 0;

function nextNeedId() {
  needSeq += 1;
  return `need-${needSeq}`;
}

function typesFromText(text: string): EvidenceType[] {
  const types = new Set<EvidenceType>();
  if (/ISO|CE|认证|证书|资质|许可/.test(text)) types.add("certification");
  if (/检测|检验|报告|测试/.test(text)) types.add("test_report");
  if (/案例|业绩|合同|经验/.test(text)) types.add("case_study");
  if (/质保|保修/.test(text)) types.add("warranty");
  if (/SLA|售后|响应|服务/.test(text)) types.add("sla");
  if (/图纸|布置|安装/.test(text)) types.add("drawing");
  if (/参数|规格|功率|速度|尺寸|kg|km/.test(text)) types.add("datasheet");
  return types.size ? [...types] : ["datasheet"];
}

function pushNeed(
  list: SemanticEvidenceNeed[],
  partial: Omit<SemanticEvidenceNeed, "id">,
) {
  const dup = list.find(
    (n) =>
      n.requirementId === partial.requirementId &&
      n.source === partial.source &&
      n.rationale === partial.rationale,
  );
  if (dup) return;
  list.push({ id: nextNeedId(), ...partial });
}

/**
 * 确定性推断：语义图 → evidence 需求清单
 */
export function inferSemanticEvidenceNeeds(
  graph: TenderSemanticGraph,
): SemanticEvidenceNeed[] {
  needSeq = 0;
  const needs: SemanticEvidenceNeed[] = [];

  for (const req of graph.requirements) {
    const text = req.normalizedRequirement || req.requirement;
    const priority: EvidenceNeedPriority =
      req.importance === "mandatory"
        ? "mandatory"
        : req.importance === "preferred"
          ? "preferred"
          : "optional";

    if (req.evidenceRequired || req.importance === "mandatory") {
      pushNeed(needs, {
        requirementId: req.id,
        requirementText: text,
        expectedTypes: typesFromText(text),
        priority,
        source: "requirement",
        rationale: "requirement.evidence_required",
        relatedScoringItemIds: req.relatedScoringItems,
        relatedRiskIds: req.relatedRisks,
      });
    }

    if (req.measurable && req.category === "technical") {
      pushNeed(needs, {
        requirementId: req.id,
        requirementText: text,
        expectedTypes: ["datasheet", "test_report"],
        priority: req.importance === "mandatory" ? "mandatory" : "preferred",
        source: "requirement",
        rationale: "requirement.measurable_technical",
        relatedScoringItemIds: req.relatedScoringItems,
      });
    }

    if (req.category === "qualification") {
      pushNeed(needs, {
        requirementId: req.id,
        requirementText: text,
        expectedTypes: ["certification", "case_study"],
        priority: "mandatory",
        source: "requirement",
        rationale: "requirement.qualification",
      });
    }
  }

  for (const item of graph.scoringItems) {
    const focus = [
      item.title,
      ...item.evidenceNeeded,
      ...item.evaluationFocus,
    ].join(" ");
    const types = typesFromText(focus);
    for (const reqId of graph.requirements
      .filter((r) => r.relatedScoringItems?.includes(item.id))
      .map((r) => r.id)) {
      pushNeed(needs, {
        requirementId: reqId,
        requirementText: focus.slice(0, 120),
        expectedTypes: types,
        priority: "preferred",
        source: "scoring",
        rationale: "scoring.evidence_needed",
        relatedScoringItemIds: [item.id],
      });
    }
  }

  for (const risk of graph.risks) {
    if (risk.severity !== "high" && risk.severity !== "medium") continue;
    for (const reqId of risk.linkedRequirements || []) {
      pushNeed(needs, {
        requirementId: reqId,
        requirementText: risk.description.slice(0, 120),
        expectedTypes: ["case_study", "test_report", "certification"],
        priority: risk.severity === "high" ? "mandatory" : "preferred",
        source: "risk",
        rationale: "risk.high_severity",
        relatedRiskIds: [risk.id],
      });
    }
  }

  for (const node of graph.compliance) {
    if (node.responseStatus !== "missing") continue;
    pushNeed(needs, {
      requirementId: node.requirementId,
      requirementText: `符合性节点 ${node.requirementId}`,
      expectedTypes: typesFromText(node.requirementId),
      priority: "mandatory",
      source: "compliance",
      rationale: "compliance.missing",
      relatedScoringItemIds: node.linkedScoringItems,
      relatedRiskIds: node.linkedRisks,
    });
  }

  return needs;
}

export function resetEvidenceNeedSequence() {
  needSeq = 0;
}
