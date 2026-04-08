import type {
  TechnicalDeviationRow,
  TechnicalResponseRow,
} from "@/lib/pdf/tender/types";

function summarizeResponse(input: string, max = 32): string {
  const s = String(input || "").replace(/\s+/g, " ").trim();
  if (!s) return "已作响应";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}...`;
}

export function buildTechnicalDeviationRows(
  rows: TechnicalResponseRow[]
): TechnicalDeviationRow[] {
  return (rows || []).map((row, idx) => {
    const lowConfidence =
      typeof row.confidence === "number" && row.confidence < 0.35;

    return {
      id: row.id || `TD-${String(idx + 1).padStart(3, "0")}`,
      clause: row.requirement,
      responseSummary: summarizeResponse(row.response),
      deviationStatus: "无偏离",
      deviationType: "完全响应",
      note: lowConfidence ? "相关内容已在技术方案中响应，建议复核。" : "",
    };
  });
}

