import type {
  SemanticRequirement,
  SemanticScoringItem,
} from "@/lib/tender/semantic/types";

import { finalizeBlock } from "./responseQuality";
import type { TenderResponseBlock } from "./types";
import { nextBlockId, quoteRequirement } from "./responseUtils";

function sectionRefLabel(
  item: SemanticScoringItem,
  linkedReqs: SemanticRequirement[],
): string {
  if (linkedReqs[0]?.sourceSectionId) {
    return `招标章节 ${linkedReqs[0].sourceSectionId}`;
  }
  if (item.relatedSections[0]) {
    return `语义章节 ${item.relatedSections[0]}`;
  }
  return "评分响应章节";
}

function composeScoringParagraph(
  item: SemanticScoringItem,
  linkedReqs: SemanticRequirement[],
): string {
  const title = quoteRequirement(item.title, 56);
  const focus =
    item.evaluationFocus.length > 0
      ? item.evaluationFocus.join("、")
      : "标准化配置框架、可替换 SKU 机制与可扩展交付逻辑";
  const evidence =
    item.evidenceNeeded.length > 0
      ? item.evidenceNeeded.join("、")
      : "技术方案说明、案例与证明材料";

  const sectionHint = sectionRefLabel(item, linkedReqs);

  return `针对「${title}」评分点，本方案通过${focus}形成响应，可结合${evidence}等附件材料提供证明支撑；对应正文见${sectionHint}，便于评标委员会核验与打分。`;
}

/**
 * 评分项 → 评分响应段落
 */
export function composeScoringResponse(
  scoringItems: SemanticScoringItem[],
  requirements: SemanticRequirement[],
): TenderResponseBlock[] {
  let seq = 0;
  return scoringItems.map((item) => {
    seq += 1;
    const linkedReqs: SemanticRequirement[] = [];
    for (const req of requirements) {
      if (req.relatedScoringItems?.includes(item.id)) linkedReqs.push(req);
    }
    if (!linkedReqs.length) {
      const byTitle = requirements.find(
        (r) =>
          item.title.includes(r.title.slice(0, 4)) ||
          r.title.includes(item.title.slice(0, 4)),
      );
      if (byTitle) linkedReqs.push(byTitle);
    }

    const sectionRef = sectionRefLabel(item, linkedReqs);

    return finalizeBlock(
      {
        id: nextBlockId("SR", seq),
        title: item.title.slice(0, 48) || `评分响应 ${seq}`,
        type: "scoring",
        sectionId: item.relatedSections[0],
        relatedScoringItemIds: [item.id],
        relatedRequirementIds: linkedReqs.map((r) => r.id).slice(0, 6),
        content: composeScoringParagraph(item, linkedReqs),
        confidence:
          item.evidenceNeeded.length >= 2 ? "high" : "medium",
        evidenceRefs: item.evidenceNeeded.length
          ? item.evidenceNeeded
          : undefined,
        sectionRef,
      },
      "响应策略与证明材料见评分响应表及附件索引",
    );
  });
}
