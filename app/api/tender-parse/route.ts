import { NextRequest, NextResponse } from "next/server";
import { buildParsedTenderResult } from "@/lib/tender-parser/buildParsedTenderResult";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawText = String((body as any)?.rawText || "").trim();
    const sourceName = String((body as any)?.sourceName || "").trim();

    if (!rawText) {
      return json(400, {
        ok: false,
        code: "RAW_TEXT_REQUIRED",
        message: "rawText is required",
      });
    }

    const parsed = buildParsedTenderResult({
      sourceName: sourceName || undefined,
      rawText,
    });

    return json(200, {
      ok: true,
      sourceName: parsed.sourceName || null,
      summary: {
        sectionCount: parsed.sections.length,
        technicalCount: parsed.technicalRequirements.length,
        businessCount: parsed.businessRequirements.length,
        scoreCount: parsed.scoreCriteria.length,
        warnings: parsed.warnings || [],
      },
      sections: parsed.sections,
      technicalRequirements: parsed.technicalRequirements,
      businessRequirements: parsed.businessRequirements,
      scoreCriteria: parsed.scoreCriteria,
      warnings: parsed.warnings || [],
    });
  } catch (error: any) {
    return json(500, {
      ok: false,
      code: "TENDER_PARSE_INTERNAL_ERROR",
      message: error?.message || "Unknown error",
    });
  }
}

