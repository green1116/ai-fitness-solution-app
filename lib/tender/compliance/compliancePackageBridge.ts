import type { TechnicalCompliancePackage } from "./types";

/**
 * PDF / plan 可注入内容（不改 V1 版式）
 */
export function mapCompliancePackageToPlanContent(
  pkg: TechnicalCompliancePackage,
): {
  complianceResponses: string[];
  matrixMarkdown: string;
  deviationNotes: string[];
} {
  const matrixMarkdown = [
    "| 招标要求 | SKU | 要求值 | 实测/标称 | 结果 |",
    "| --- | --- | --- | --- | --- |",
    ...pkg.matrix.map(
      (r) =>
        `| ${r.requirementText.slice(0, 24)} | ${r.skuName || "—"} | ${r.requiredValue || "—"} | ${r.actualValue || "—"} | ${r.result} |`,
    ),
  ].join("\n");

  const deviationNotes = pkg.deviations.map(
    (d) => `[${d.severity}] ${d.description}${d.suggestedFix ? `；建议：${d.suggestedFix}` : ""}`,
  );

  return {
    complianceResponses: pkg.responses,
    matrixMarkdown,
    deviationNotes,
  };
}
