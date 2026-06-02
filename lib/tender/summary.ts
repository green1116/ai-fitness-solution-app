export type TenderDisplayStatus =
  | "满足"
  | "响应"
  | "待确认"
  | "部分满足"
  | "偏离"
  | "无此项";

export type TenderResponseRowLite = {
  status?: TenderDisplayStatus;
  requirement?: string;
  response?: string;
  note?: string;
};

export type TenderResponseSummary = {
  total: number;
  satisfied: number;
  responded: number;
  pending: number;
  partial: number;
  deviated: number;
  none: number;
};

export function summarizeTenderResponses(
  rows: TenderResponseRowLite[]
): TenderResponseSummary {
  const out: TenderResponseSummary = {
    total: rows.length,
    satisfied: 0,
    responded: 0,
    pending: 0,
    partial: 0,
    deviated: 0,
    none: 0,
  };

  for (const row of rows) {
    switch (row.status) {
      case "满足":
        out.satisfied += 1;
        break;
      case "响应":
        out.responded += 1;
        break;
      case "待确认":
        out.pending += 1;
        break;
      case "部分满足":
        out.partial += 1;
        break;
      case "偏离":
        out.deviated += 1;
        break;
      case "无此项":
      default:
        out.none += 1;
        break;
    }
  }

  return out;
}

export function buildTenderResponseFootnote(
  kind: "technical" | "business",
  summary: TenderResponseSummary
): string {
  const label = kind === "technical" ? "技术响应表" : "商务响应表";

  if (summary.pending > 0) {
    return `注：本${label}中“待确认”条目共 ${summary.pending} 项，建议结合资质附件、检测报告、品牌授权、正式报价清单及响应承诺文件进行人工复核。`;
  }

  if (summary.partial > 0 || summary.deviated > 0) {
    return `注：本${label}已完成规则化响应生成；其中“部分满足”或“偏离”条目建议重点复核，最终以正式投标文件、附件资料及合同约定为准。`;
  }

  return `注：本${label}已完成规则化响应生成；涉及最终参数、资质证明、交付安排及合同约定内容，仍以正式投标文件为准。`;
}
