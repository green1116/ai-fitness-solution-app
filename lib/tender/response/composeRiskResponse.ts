import type { SemanticRisk } from "@/lib/tender/semantic/types";

import { finalizeBlock } from "./responseQuality";
import type { TenderResponseBlock } from "./types";
import { nextBlockId } from "./responseUtils";

const SEVERITY_LABEL = {
  low: "低",
  medium: "中",
  high: "高",
} as const;

function composeRiskParagraph(risk: SemanticRisk): string {
  const sev = SEVERITY_LABEL[risk.severity];
  const mitigation =
    risk.mitigation ||
    "建立专项管控机制，明确责任人与复核节点，实施过程中动态跟踪并留存记录。";

  return [
    `【${risk.title}】（风险等级：${sev}）`,
    risk.description,
    `应对策略：${mitigation}`,
    "责任边界：我方负责方案设计与供货组织，现场条件、第三方配合及政策变化导致的偏差，按合同约定协商处理。",
    "交付控制点：关键里程碑复核、参数对照表签认、验收前联合检查。",
    "相关技术/商务条款已在响应正文中逐项闭环，便于纳入 PDF「风险与对策」章节。",
  ].join(" ");
}

/**
 * 语义风险 → 风险对策段落
 */
export function composeRiskResponse(risks: SemanticRisk[]): TenderResponseBlock[] {
  const ordered = [...risks].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.severity] - rank[b.severity];
  });

  let seq = 0;
  return ordered.map((risk) => {
    seq += 1;
    return finalizeBlock(
      {
        id: nextBlockId("RR", seq),
        title: risk.title,
        type: "risk",
        relatedRiskIds: [risk.id],
        relatedRequirementIds: risk.linkedRequirements,
        relatedScoringItemIds: risk.linkedScoringItems,
        content: composeRiskParagraph(risk),
        confidence:
          risk.severity === "high"
            ? "medium"
            : risk.severity === "medium"
              ? "medium"
              : "high",
        sectionRef: "风险与对策章节",
      },
      "对策细节以项目实施计划及合同条款为准",
    );
  });
}
