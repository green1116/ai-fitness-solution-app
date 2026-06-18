import { NextRequest, NextResponse } from "next/server";
import {
  PRODUCT_SKU,
  PROJECT_COMPLEXITY,
  SLA_TIER,
  type ProductSku,
  type ProjectComplexity,
  type SlaTier,
} from "@/lib/commercial-products/shared/constants";
import {
  registerQuoteSnapshotHeavy,
  resolveQuoteSnapshotForPdfHeavy,
  runSummaryPdfRuntimeHeavy,
} from "@/lib/commercial-products/access-layer/runtime/heavy-summary-pdf";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const quoteId = String(params.get("quoteId") ?? "").trim();

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_QUOTE_ID", message: "缺少 quoteId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const skuRaw = params.get("sku")?.trim();
    const projectName = params.get("projectName")?.trim();
    const areaSqm = Number(params.get("areaSqm"));
    const headcount = Number(params.get("headcount"));
    const budgetCny = Number(params.get("budgetCny"));
    const complexityRaw = params.get("complexity")?.trim();
    const slaTierRaw = params.get("slaTier")?.trim();

    const hasRebuildParams =
      skuRaw &&
      projectName &&
      PRODUCT_SKU.includes(skuRaw as ProductSku) &&
      Number.isFinite(areaSqm) &&
      areaSqm > 0 &&
      Number.isFinite(headcount) &&
      headcount > 0 &&
      Number.isFinite(budgetCny) &&
      budgetCny > 0;

    let snapshot;
    if (hasRebuildParams) {
      if (complexityRaw && !PROJECT_COMPLEXITY.includes(complexityRaw as ProjectComplexity)) {
        return NextResponse.json(
          { ok: false, code: "INVALID_COMPLEXITY", message: "complexity 无效" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      if (slaTierRaw && !SLA_TIER.includes(slaTierRaw as SlaTier)) {
        return NextResponse.json(
          { ok: false, code: "INVALID_SLA_TIER", message: "slaTier 无效" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      snapshot = await resolveQuoteSnapshotForPdfHeavy({
        quoteId,
        rebuildRequest: {
          sku: skuRaw as ProductSku,
          projectName,
          areaSqm,
          headcount,
          budgetCny,
          complexity: complexityRaw as ProjectComplexity | undefined,
          slaTier: slaTierRaw as SlaTier | undefined,
        },
      });
      await registerQuoteSnapshotHeavy(snapshot);
    }

    const result = await runSummaryPdfRuntimeHeavy({
      quoteId,
      snapshot,
    });

    return new NextResponse(Buffer.from(result.buffer), {
      status: 200,
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": result.pdfMeta.mimeType,
        "Content-Disposition": `attachment; filename="${result.pdfMeta.filename}"`,
        "X-Quote-Id": result.quoteId,
        "X-PDF-Page-Count": String(result.pdfMeta.pageCount),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "summary pdf failed";
    return NextResponse.json(
      { ok: false, code: "SUMMARY_PDF_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
