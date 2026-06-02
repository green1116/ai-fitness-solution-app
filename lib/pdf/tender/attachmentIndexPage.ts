import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import {
  buildDefaultTenderAttachmentIndexRows,
  type TenderAttachmentIndexRow,
} from "@/lib/pdf/tender/attachmentIndex";
import { formatResponseRefs, formatScoreRefs } from "@/lib/pdf/tender/refs/refFormat";
import { normalizeTenderRef } from "@/lib/pdf/tender/scoreSectionFormat";

type AttachmentIndexRenderRow = {
  code: string;
  name: string;
  purpose: string;
  relatedScoreItems: string;
  remark: string;
};

export type RenderAttachmentIndexPagePdfInput = {
  title?: string;
  subtitle?: string;
  footnote?: string;
  rows?: TenderAttachmentIndexRow[];
};

export type RenderAttachmentIndexPagePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
  refPageMap: Record<string, number>;
};

const ATTACHMENT_INDEX_SUBTITLE =
  "本页用于列示本投标文件建议附具的证明材料及其对应用途，便于评审查阅与索引。";

const ATTACHMENT_INDEX_FOOTNOTE =
  "说明：建议本页所列附件与评分项对照页、技术响应表、商务响应表保持一致。";

const TABLE_COLS = [
  { key: "code", title: "附件编号", width: 52, cellKind: "center-text" as const },
  { key: "name", title: "附件名称", width: 92 },
  { key: "purpose", title: "对应用途", width: 132 },
  { key: "relatedScoreItems", title: "建议对应评分项", width: 132 },
  { key: "remark", title: "备注", width: 99 },
] as const;

export async function renderAttachmentIndexPagePdf(
  input?: RenderAttachmentIndexPagePdfInput
): Promise<RenderAttachmentIndexPagePdfResult> {
  const sourceRows =
    input?.rows && input.rows.length > 0
      ? input.rows
      : buildDefaultTenderAttachmentIndexRows();

  const rows: AttachmentIndexRenderRow[] = sourceRows.map((r) => ({
    code: r.code,
    name: r.name,
    purpose: r.purpose,
    relatedScoreItems:
      r.relatedScoreIds?.length
        ? `${r.relatedScoreItems}（${formatScoreRefs(r.relatedScoreIds)}）`
        : r.relatedScoreItems,
    remark: [
      (r.remark || "").trim(),
      r.relatedResponseRefIds?.length
        ? `关联响应条款：${formatResponseRefs(r.relatedResponseRefIds)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n") || "-",
  }));

  const rendered = await renderTenderTablePdf<AttachmentIndexRenderRow>({
    title: input?.title || "附件索引页",
    subtitle: input?.subtitle ?? ATTACHMENT_INDEX_SUBTITLE,
    continuationTitle: `${input?.title || "附件索引页"}（续）`,
    rows,
    columns: [...TABLE_COLS],
    footnote: input?.footnote ?? ATTACHMENT_INDEX_FOOTNOTE,
    getRefKey: (row) => {
      const c = normalizeTenderRef(String(row.code || ""));
      return /^A-\d{2,3}$/.test(c) ? c : undefined;
    },
  });
  return {
    bytes: rendered.bytes,
    pageCount: rendered.pageCount,
    refPageMap: rendered.refPageMap,
  };
}

