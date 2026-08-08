/**
 * V80 Pilot P7 — Multi-document intake schema (session-local)
 */

import type { TenderParseResult } from "@/lib/tender/types";

import type { TenderRequirements } from "./requirements.schema";

export type IntakeDocumentType =
  | "primary"
  | "addendum"
  | "annex"
  | "drawing"
  | "qa"
  | "other";

/** Higher number wins when reconciling conflicts / superseded clauses */
export const INTAKE_DOC_TYPE_PRIORITY: Record<IntakeDocumentType, number> = {
  addendum: 100,
  qa: 90,
  primary: 80,
  annex: 60,
  drawing: 40,
  other: 30,
};

export type IntakeDocumentEntry = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  docType: IntakeDocumentType;
  /** Upload order within session (0-based) */
  order: number;
  /** Effective priority = type priority + order boost for same type */
  priority: number;
  parseResult: TenderParseResult;
  requirements?: TenderRequirements;
  uploadedAt: string;
  status: "parsed" | "extracted" | "failed";
  errorMessage?: string;
};

export type RequirementConflictKind = "duplicate" | "conflict" | "superseded";

export type RequirementConflictResolution =
  | "auto_keep_priority"
  | "auto_dedupe"
  | "pending_review"
  | "manual_keep"
  | "manual_drop";

export type RequirementConflict = {
  id: string;
  listKey: string;
  kind: RequirementConflictKind;
  message: string;
  winnerItemId?: string;
  loserItemIds: string[];
  sourceDocumentIds: string[];
  resolution: RequirementConflictResolution;
};

export type MultiDocConsolidationState = {
  conflicts: RequirementConflict[];
  consolidatedAt: string;
  documentCount: number;
  keptItemCount: number;
  droppedItemCount: number;
};

export function inferIntakeDocumentType(fileName: string): IntakeDocumentType {
  const n = fileName.toLowerCase();
  if (/补遗|澄清|addendum|amend/.test(n)) return "addendum";
  if (/答疑|qa|q&a|问答/.test(n)) return "qa";
  if (/图纸|drawing|cad/.test(n)) return "drawing";
  if (/附件|annex|appendix|附表/.test(n)) return "annex";
  if (/招标|标书|tender|rfp|主文件|正式/.test(n)) return "primary";
  return "other";
}

export function computeDocumentPriority(
  docType: IntakeDocumentType,
  order: number,
): number {
  // Later uploads of same/higher class get slight boost (addenda often arrive later)
  return INTAKE_DOC_TYPE_PRIORITY[docType] * 1000 + order;
}
