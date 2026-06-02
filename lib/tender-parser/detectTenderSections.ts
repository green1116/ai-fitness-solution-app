import type { ParsedTenderSection, TenderTextBlock } from "@/lib/tender-parser/types";

function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function detectCategory(text: string): ParsedTenderSection["category"] {
  if (hasAny(text, ["评标办法", "评分标准", "评分细则", "综合评分", "商务分", "技术分", "价格分"])) {
    return "evaluation";
  }
  if (hasAny(text, ["技术要求", "采购需求", "设备要求", "参数要求", "功能要求", "建设内容", "实施要求"])) {
    return "technical";
  }
  if (hasAny(text, ["商务要求", "付款方式", "交货期限", "交付地点", "售后服务", "质保期", "合同条款"])) {
    return "business";
  }
  if (hasAny(text, ["资格", "资质", "业绩", "授权", "营业执照"])) return "qualification";
  if (hasAny(text, ["合同", "违约", "争议解决"])) return "contract";
  if (hasAny(text, ["招标公告", "投标须知", "项目概况"])) return "notice";
  return "other";
}

export function detectTenderSections(blocks: TenderTextBlock[]): ParsedTenderSection[] {
  return (blocks || []).map((b, i) => {
    const merged = `${b.heading || ""}\n${b.text}`;
    return {
      id: `SEC-${String(i + 1).padStart(3, "0")}`,
      title: b.heading || `区块${i + 1}`,
      category: detectCategory(merged),
      text: b.text,
    };
  });
}

