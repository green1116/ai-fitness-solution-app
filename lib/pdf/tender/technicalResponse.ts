/**
 * 技术响应表：行结构 + 列配置（含状态徽章列，与 businessResponse 对齐）
 */
import type { TenderTableColumn } from "@/lib/pdf/tender/renderTenderTablePdf";

export type TechnicalResponseTableRow = {
  no: string;
  requirement: string;
  status: string;
  response: string;
  note: string;
};

export const TECHNICAL_RESPONSE_TABLE_COLS: readonly TenderTableColumn<TechnicalResponseTableRow>[] =
  [
    { key: "no", title: "序号", width: 34, cellKind: "center-text" },
    { key: "requirement", title: "招标要求", width: 150 },
    { key: "status", title: "响应情况", width: 54, cellKind: "status-badge" },
    { key: "response", title: "投标响应", width: 190 },
    { key: "note", title: "备注", width: 64 },
  ];
