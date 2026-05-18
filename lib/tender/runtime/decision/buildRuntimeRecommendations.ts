import type { EvidenceDecisionResult } from "@/lib/tender/evidence/runtime/types";
import type { EvidenceTraceLog } from "@/lib/tender/evidence/trace/types";
import type { BidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";
import type {
  RuntimeRecommendation,
  RuntimeRecommendationPriority,
  RuntimeScoringImpact,
} from "../types";

let recSeq = 0;

function nextRecId() {
  recSeq += 1;
  return `rec-${recSeq}`;
}

function pushRec(
  list: RuntimeRecommendation[],
  partial: Omit<RuntimeRecommendation, "id">,
) {
  list.push({ id: nextRecId(), ...partial });
}

const PRIORITY_ORDER: Record<RuntimeRecommendationPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export type BuildRuntimeRecommendationsInput = {
  evidenceDecision?: EvidenceDecisionResult;
  gate?: BidDecisionGateResult;
  scoringImpact?: RuntimeScoringImpact;
  trace?: EvidenceTraceLog;
};

/**
 * 合并 evidence / gate / scoring 建议为优先级排序列表
 */
export function buildRuntimeRecommendations(
  input: BuildRuntimeRecommendationsInput,
): RuntimeRecommendation[] {
  recSeq = 0;
  const recs: RuntimeRecommendation[] = [];

  if (input.evidenceDecision?.action === "block") {
    for (const reason of input.evidenceDecision.reasons.slice(0, 3)) {
      pushRec(recs, {
        priority: "critical",
        category: "evidence",
        title: "证据阻断项",
        description: reason,
        suggestedAction:
          input.evidenceDecision.suggestedNextSteps[0] ||
          "补充关键证据后重新运行 workflow",
      });
    }
  }

  if (input.gate?.action === "block") {
    for (const reason of input.gate.reasons.slice(0, 2)) {
      pushRec(recs, {
        priority: "critical",
        category: "score",
        title: "评分门闸阻断",
        description: reason,
        suggestedAction:
          input.gate.suggestedNextSteps[0] || "完成评分诊断所列补强动作",
      });
    }
  }

  if (input.evidenceDecision?.meta.mandatoryUnsupportedCount) {
    pushRec(recs, {
      priority: "high",
      category: "compliance",
      title: "强制性要求缺证据",
      description: `${input.evidenceDecision.meta.mandatoryUnsupportedCount} 项强制性要求尚无证据支撑`,
      suggestedAction: "优先补齐资质证书、检测报告等硬性证明材料",
    });
  }

  if (input.scoringImpact && input.scoringImpact.affectedScoringItemIds.length > 0) {
    pushRec(recs, {
      priority: "high",
      category: "score",
      title: "评分项受证据缺口影响",
      description: input.scoringImpact.narrative,
      suggestedAction: `针对 ${input.scoringImpact.affectedScoringItemIds.length} 个关联评分项补充证据材料`,
      relatedScoringItemIds: input.scoringImpact.affectedScoringItemIds.slice(0, 5),
    });
  }

  if (input.gate?.meta.missingAttachmentCount) {
    pushRec(recs, {
      priority: "high",
      category: "attachment",
      title: "缺少关键附件",
      description: `缺少 ${input.gate.meta.missingAttachmentCount} 项关键附件引用`,
      suggestedAction: "补齐投标函、授权书、资质证明等附件索引",
    });
  }

  for (const step of input.evidenceDecision?.suggestedNextSteps ?? []) {
    if (recs.some((r) => r.suggestedAction === step)) continue;
    pushRec(recs, {
      priority: input.evidenceDecision?.action === "warn" ? "medium" : "low",
      category: "evidence",
      title: "证据补强建议",
      description: step,
      suggestedAction: step,
    });
  }

  for (const step of input.gate?.suggestedNextSteps ?? []) {
    if (recs.some((r) => r.suggestedAction === step)) continue;
    pushRec(recs, {
      priority: "medium",
      category: "general",
      title: "投标流程建议",
      description: step,
      suggestedAction: step,
    });
  }

  const unsupportedEvents =
    input.trace?.events.filter((e) => e.kind === "coverage_evaluated") ?? [];
  for (const evt of unsupportedEvents.slice(0, 3)) {
    if (evt.metrics?.linkedCount !== 0) continue;
    const rid = evt.refs?.requirementId;
    if (!rid || recs.some((r) => r.relatedRequirementIds?.includes(rid))) continue;
    pushRec(recs, {
      priority: "medium",
      category: "evidence",
      title: "无证据要求",
      description: evt.message,
      suggestedAction: "为该要求关联 SKU 参数表或检测报告",
      relatedRequirementIds: [rid],
    });
  }

  return recs
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 12);
}
