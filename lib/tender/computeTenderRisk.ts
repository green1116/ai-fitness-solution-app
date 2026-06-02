import { buildDefaultTenderAttachmentIndexRows } from "@/lib/pdf/tender/attachmentIndex";
import { buildParsedTenderResult } from "@/lib/tender-parser/buildParsedTenderResult";

export type TenderRiskStatus =
  | "满足"
  | "响应"
  | "待确认"
  | "部分满足"
  | "偏离"
  | "无此项";

export type TenderRiskRowInput = {
  requirement?: string;
  response?: string;
  status?: string;
  ref?: string;
  risk?: string;
};

export type TenderRiskComputed = {
  level: "safe" | "caution" | "high";
  score: number;
  summary: {
    techPending: number;
    bizPending: number;
    deviations: number;
    missingAttachments: number;
  };
  missingAttachments: string[];
  topRisks: string[];
};

export const DEFAULT_TENDER_ATTACHMENT_CODES =
  buildDefaultTenderAttachmentIndexRows().map((r) => r.code);

export function normalizeTenderRiskStatus(s?: string): TenderRiskStatus {
  if (!s) return "无此项";
  if (s.includes("满足")) return "满足";
  if (s.includes("响应")) return "响应";
  if (s.includes("待确认")) return "待确认";
  if (s.includes("部分")) return "部分满足";
  if (s.includes("偏离")) return "偏离";
  return "无此项";
}

function calcRiskScore(input: {
  techPending: number;
  bizPending: number;
  deviations: number;
  missingAttachments: number;
}) {
  let score = 100;
  score -= input.techPending * 1.5;
  score -= input.bizPending * 1.2;
  score -= input.deviations * 3;
  score -= input.missingAttachments * 5;
  return Math.max(0, Math.round(score));
}

function resolveRiskLevel(score: number) {
  if (score >= 85) return "safe";
  if (score >= 70) return "caution";
  return "high";
}

function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

function hasEffectiveResponse(row: TenderRiskRowInput) {
  const response = normalizeText(row.response);
  const status = normalizeTenderRiskStatus(row.status);
  const risk = normalizeText(row.risk);

  // 明确已响应
  if (status === "响应" || status === "满足") return true;

  // 自动补强后标记
  if (risk === "已补强") return true;

  // 有足够长度的响应文本，也视为有效
  if (response.length >= 20) return true;

  return false;
}

export function rowsFromParsedTenderText(rawText: string): {
  technicalRows: TenderRiskRowInput[];
  businessRows: TenderRiskRowInput[];
} {
  const parsed = buildParsedTenderResult({
    rawText: rawText.trim(),
  });

  const technicalRows: TenderRiskRowInput[] =
    parsed.technicalRequirements.map((r, i) => {
      let status: TenderRiskStatus = "响应";
      if (r.priority === "must") status = "待确认";
      else if (r.priority === "preferred") status = "部分满足";
      return {
        requirement: r.text?.slice(0, 120),
        status,
        ref: `T-${String(i + 1).padStart(2, "0")}`,
      };
    });

  const businessRows: TenderRiskRowInput[] =
    parsed.businessRequirements.map((r, i) => {
      let status: TenderRiskStatus = "响应";
      if (r.priority === "must") status = "待确认";
      else if (r.priority === "preferred") status = "部分满足";
      return {
        requirement: r.text?.slice(0, 120),
        status,
        ref: `B-${String(i + 1).padStart(2, "0")}`,
      };
    });

  return { technicalRows, businessRows };
}

/**
 * 与 `/api/tender-risk` 一致：由技术/商务行 + 附件编号列表计算风险结论。
 */
export function computeTenderRiskFromRows(input: {
  technicalRows: TenderRiskRowInput[];
  businessRows: TenderRiskRowInput[];
  attachments: string[];
}): TenderRiskComputed {
  const { technicalRows, businessRows, attachments } = input;

  let techPending = 0;
  let bizPending = 0;
  let deviations = 0;
  const riskRefs: string[] = [];

  const scan = (rows: TenderRiskRowInput[], type: "tech" | "biz") => {
    for (const r of rows) {
      const s = normalizeTenderRiskStatus(r.status);
      const effective = hasEffectiveResponse(r);

      // 只有“待确认”且没有有效响应时，才计入 pending
      if (s === "待确认" && !effective) {
        if (type === "tech") techPending++;
        else bizPending++;
        if (r.ref) riskRefs.push(r.ref);
      }

      // “部分满足 / 偏离”如果已经补强并给出有效响应，则不再计入 deviation
      const shouldCountDeviation =
        (s === "偏离" || s === "部分满足") && !effective;

      if (shouldCountDeviation) {
        deviations++;
        if (r.ref) riskRefs.push(r.ref);
      }
    }
  };

  scan(technicalRows, "tech");
  scan(businessRows, "biz");

  const requiredAttachments = (technicalRows || [])
    .map((r) => r.ref)
    .filter((r): r is string => !!r?.startsWith("A-"));

  const missingAttachments = requiredAttachments.filter(
    (r) => !attachments.includes(r)
  );

  const score = calcRiskScore({
    techPending,
    bizPending,
    deviations,
    missingAttachments: missingAttachments.length,
  });

  const level = resolveRiskLevel(score);

  return {
    level,
    score,
    summary: {
      techPending,
      bizPending,
      deviations,
      missingAttachments: missingAttachments.length,
    },
    missingAttachments,
    topRisks: Array.from(new Set(riskRefs)).slice(0, 5),
  };
}