import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentIndex";
import {
  buildDeviationAttachmentAdvice,
  resolveDeviationRiskLevel,
} from "@/lib/pdf/tender/deviationAdvisor";
import type {
  TenderDeviationRow,
  TenderDeviationScene,
} from "@/lib/pdf/tender/deviationTypes";
import { withRefPrefix } from "@/lib/pdf/tender/refs/refFormat";
import { normalizeTenderDisplayStatus } from "@/lib/pdf/tender/statusStyle";

type DeviationRow = {
  clause: string;
  status: string;
  deviation: string;
  riskLevel: string;
  adviceAttachments: string;
};

export type RenderDeviationTablePdfInput = {
  title: string;
  rows: TenderDeviationRow[];
  scene?: TenderDeviationScene;
  attachmentRefs?: TenderAttachmentRefMap;
};

export type RenderDeviationTablePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "clause", title: "条款 / 要求", width: 122 },
  { key: "status", title: "当前状态", width: 58, cellKind: "status-badge" as const },
  { key: "deviation", title: "偏离说明", width: 140 },
  { key: "riskLevel", title: "风险等级", width: 48, cellKind: "center-text" as const },
  { key: "adviceAttachments", title: "建议补充附件", width: 139, cellKind: "risk-muted" as const },
] as const;

export async function renderDeviationTablePdf(
  input: RenderDeviationTablePdfInput
): Promise<RenderDeviationTablePdfResult> {
  const scene: TenderDeviationScene =
    input.scene ||
    (String(input.title || "").includes("商务")
      ? "business_deviation"
      : "technical_deviation");

  const rows: DeviationRow[] = (input.rows || []).map((row) => {
    const status = normalizeTenderDisplayStatus(row.status || "无此项");
    const riskLevel =
      String(row.riskLevel || "").trim() ||
      resolveDeviationRiskLevel(scene, status);
    const adviceAttachments =
      String(row.adviceAttachments || "").trim() ||
      buildDeviationAttachmentAdvice({
        scene,
        status,
        currentAdvice: row.adviceAttachments,
        attachmentRefs: input.attachmentRefs,
      });

    return {
      clause: withRefPrefix(row.refId, row.clause || "-"),
      status,
      deviation: String(row.deviation || row.remark || "").trim() || "-",
      riskLevel,
      adviceAttachments: adviceAttachments || "-",
    };
  });

  const rendered = await renderTenderTablePdf<DeviationRow>({
    title: input.title || "偏离表",
    rows,
    columns: [...TABLE_COLS],
  });
  return { bytes: rendered.bytes, pageCount: rendered.pageCount };
}

