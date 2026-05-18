// app/api/tender-risk/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  computeTenderRiskFromRows,
  DEFAULT_TENDER_ATTACHMENT_CODES,
  rowsFromParsedTenderText,
} from "@/lib/tender/computeTenderRisk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TenderRiskRow = {
  requirement?: string;
  response?: string;
  status?: string;
  ref?: string;
  risk?: string;
  note?: string;
  source?: string;
};

function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

function isRowResponded(row: TenderRiskRow) {
  const response = normalizeText(row.response);
  const status = normalizeText(row.status);

  if (response.length >= 24) return true;
  if (status === "响应" && response.length >= 12) return true;

  return false;
}

function normalizeRespondedRow(row: TenderRiskRow): TenderRiskRow {
  if (!isRowResponded(row)) return row;

  return {
    ...row,
    status: "响应",
    risk:
      normalizeText(row.risk) && normalizeText(row.risk) !== "待确认"
        ? row.risk
        : "已响应",
  };
}

function normalizeRows(rows: TenderRiskRow[]) {
  return rows.map(normalizeRespondedRow);
}

function countPending(rows: TenderRiskRow[]) {
  return rows.reduce((acc, row) => {
    return acc + (isRowResponded(row) ? 0 : 1);
  }, 0);
}

function buildTopRisks(rows: TenderRiskRow[], limit = 5) {
  return rows
    .filter((row) => !isRowResponded(row))
    .map((row) => normalizeText(row.ref))
    .filter(Boolean)
    .slice(0, limit);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const rawText = String((body as any)?.rawText || "").trim();

    let technicalRows: TenderRiskRow[] = Array.isArray((body as any)?.technicalRows)
      ? (body as any).technicalRows
      : [];
    let businessRows: TenderRiskRow[] = Array.isArray((body as any)?.businessRows)
      ? (body as any).businessRows
      : [];
    let attachments: string[] = Array.isArray((body as any)?.attachments)
      ? (body as any).attachments.map(String)
      : [];

    if (rawText && technicalRows.length === 0 && businessRows.length === 0) {
      const derived = rowsFromParsedTenderText(rawText);
      technicalRows = derived.technicalRows as TenderRiskRow[];
      businessRows = derived.businessRows as TenderRiskRow[];

      if (!attachments.length) {
        attachments = [...DEFAULT_TENDER_ATTACHMENT_CODES];
      }
    }

    const nextTechnicalRows = normalizeRows(technicalRows);
    const nextBusinessRows = normalizeRows(businessRows);

    const computed = computeTenderRiskFromRows({
      technicalRows: nextTechnicalRows,
      businessRows: nextBusinessRows,
      attachments,
    });

    const techPending = countPending(nextTechnicalRows);
    const bizPending = countPending(nextBusinessRows);
    const nextTopRisks = [
      ...buildTopRisks(nextTechnicalRows, 5),
      ...buildTopRisks(nextBusinessRows, 5),
    ].slice(0, 5);

    const nextSummary = {
      ...computed.summary,
      techPending,
      bizPending,
    };

    console.log("[tender-risk]", {
      technicalRows: nextTechnicalRows.length,
      businessRows: nextBusinessRows.length,
      techPending,
      bizPending,
      computedSummary: computed.summary,
      finalSummary: nextSummary,
      topRisks: nextTopRisks.length ? nextTopRisks : computed.topRisks,
    });

    return NextResponse.json({
      ok: true,
      level: computed.level,
      score: computed.score,
      summary: nextSummary,
      missingAttachments: computed.missingAttachments,
      topRisks: nextTopRisks.length ? nextTopRisks : computed.topRisks,
      technicalRows: nextTechnicalRows,
      businessRows: nextBusinessRows,
    });
  } catch (e: any) {
    console.error("[tender-risk] failed", e);

    return NextResponse.json(
      {
        ok: false,
        code: "RISK_INTERNAL_ERROR",
        message: e?.message || "risk calc failed",
      },
      { status: 500 }
    );
  }
}