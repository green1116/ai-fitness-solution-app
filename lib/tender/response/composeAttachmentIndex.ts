import type {
  SemanticRequirement,
  SemanticRisk,
  SemanticScoringItem,
} from "@/lib/tender/semantic/types";

import { finalizeBlock } from "./responseQuality";
import type { AttachmentIndexItem, TenderResponseBlock } from "./types";
import { extractEvidenceRefs, nextBlockId, quoteRequirement } from "./responseUtils";

const MATERIAL_CATALOG: { pattern: RegExp; title: string; reason: string }[] = [
  { pattern: /营业执照/, title: "营业执照", reason: "主体资格证明" },
  { pattern: /资质|证书|ISO/i, title: "资质证书", reason: "资格审查与合规证明" },
  { pattern: /检测报告|检验报告/, title: "检测报告", reason: "技术参数可核验" },
  { pattern: /类似案例|业绩|合同/, title: "类似案例材料", reason: "业绩与评分支撑" },
  { pattern: /培训/, title: "培训方案", reason: "实施与交付能力说明" },
  { pattern: /验收/, title: "验收清单", reason: "验收口径与交付闭环" },
  { pattern: /SLA|售后|服务承诺/, title: "SLA / 售后承诺", reason: "服务响应可核验" },
];

function inferIndexItems(
  requirements: SemanticRequirement[],
  scoringItems: SemanticScoringItem[],
  risks: SemanticRisk[],
): AttachmentIndexItem[] {
  const items: AttachmentIndexItem[] = [];
  const seen = new Set<string>();

  for (const req of requirements) {
    const text = `${req.title} ${req.requirement}`;
    for (const cat of MATERIAL_CATALOG) {
      if (!cat.pattern.test(text) || seen.has(cat.title)) continue;
      seen.add(cat.title);
      items.push({
        title: cat.title,
        reason: `${cat.reason}（对应招标条款：${quoteRequirement(req.requirement, 36)}）`,
        linkedRequirementIds: [req.id],
      });
    }
    const refs = extractEvidenceRefs(req.requirement);
    for (const ref of refs) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      items.push({
        title: ref,
        reason: `招标要求需提交${ref}`,
        linkedRequirementIds: [req.id],
      });
    }
  }

  for (const item of scoringItems) {
    for (const ev of item.evidenceNeeded) {
      if (seen.has(ev)) continue;
      seen.add(ev);
      items.push({
        title: ev,
        reason: `支撑评分项「${quoteRequirement(item.title, 32)}」`,
        linkedScoringItemIds: [item.id],
      });
    }
  }

  for (const risk of risks) {
    if (/资质|ISO|证书|业绩/.test(risk.description)) {
      const t = "合规与资质证明材料";
      if (!seen.has(t)) {
        seen.add(t);
        items.push({
          title: t,
          reason: `缓释风险：${risk.title}`,
          linkedRequirementIds: risk.linkedRequirements,
        });
      }
    }
  }

  if (!items.length) {
    return [
      {
        title: "投标函及授权书",
        reason: "法定投标主体与签署有效性",
      },
      {
        title: "技术参数响应表",
        reason: "技术条款逐项响应",
      },
      {
        title: "商务偏离表",
        reason: "商务条款响应与偏离说明",
      },
    ];
  }

  return items;
}

function indexItemsToBlock(
  items: AttachmentIndexItem[],
  relatedReqIds: string[],
): TenderResponseBlock {
  const lines = items.map(
    (it, i) =>
      `${i + 1}. ${it.title} — ${it.reason}${
        it.linkedScoringItemIds?.length
          ? ` [评分项 ${it.linkedScoringItemIds.join(",")}]`
          : ""
      }`,
  );

  return finalizeBlock(
    {
      id: "ATT-0001",
      title: "投标附件索引建议",
      type: "attachment",
      relatedRequirementIds: relatedReqIds,
      content: [
        "建议按以下索引组织投标附件，确保资格审查与评分材料完整、可检索：",
        "",
        ...lines,
        "",
        "上述材料按招标格式装订归档，原件/复印件加盖公章后随投标文件提交；具体份数以招标附件目录为准。",
      ].join("\n"),
      confidence: items.length >= 3 ? "high" : "medium",
      evidenceRefs: items.map((i) => i.title),
      sectionRef: "附件索引章节",
    },
    "附件清单以招标格式要求最终确认",
  );
}

export type AttachmentIndexResult = {
  items: AttachmentIndexItem[];
  blocks: TenderResponseBlock[];
};

/**
 * requirements / scoring / risks → 附件索引建议
 */
export function composeAttachmentIndex(
  requirements: SemanticRequirement[],
  scoringItems: SemanticScoringItem[] = [],
  risks: SemanticRisk[] = [],
): AttachmentIndexResult {
  const attachmentReqs = requirements.filter(
    (r) =>
      r.category === "attachment" ||
      r.evidenceRequired ||
      /附件|证明材料|证书|报告|复印件/.test(r.requirement),
  );

  const items = inferIndexItems(
    attachmentReqs.length ? attachmentReqs : requirements,
    scoringItems,
    risks,
  );

  const relatedReqIds = [
    ...new Set(items.flatMap((i) => i.linkedRequirementIds || [])),
  ];

  return {
    items,
    blocks: [indexItemsToBlock(items, relatedReqIds)],
  };
}
