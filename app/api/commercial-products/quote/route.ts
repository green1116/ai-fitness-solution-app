import { NextRequest, NextResponse } from "next/server";
import {
  PRODUCT_SKU,
  SLA_TIER,
  PROJECT_COMPLEXITY,
  type ProductSku,
  type ProjectComplexity,
  type SlaTier,
} from "@/lib/commercial-products/shared/constants";
import { createQuote } from "@/lib/commercial-products/access-layer/light";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

function parseQuoteBody(body: Record<string, unknown>) {
  const sku = String(body.sku ?? "").trim() as ProductSku;
  const projectName = String(body.projectName ?? "").trim();
  const areaSqm = Number(body.areaSqm);
  const headcount = Number(body.headcount);
  const budgetCny = Number(body.budgetCny);
  const complexityRaw = body.complexity ? String(body.complexity) : undefined;
  const slaTierRaw = body.slaTier ? String(body.slaTier) : undefined;

  if (!PRODUCT_SKU.includes(sku)) {
    return { error: { code: "INVALID_SKU", message: "sku 无效" } };
  }

  if (!projectName) {
    return { error: { code: "MISSING_PROJECT_NAME", message: "缺少 projectName" } };
  }

  if (!Number.isFinite(areaSqm) || areaSqm <= 0) {
    return { error: { code: "INVALID_AREA", message: "areaSqm 须为正数" } };
  }

  if (!Number.isFinite(headcount) || headcount <= 0) {
    return { error: { code: "INVALID_HEADCOUNT", message: "headcount 须为正数" } };
  }

  if (!Number.isFinite(budgetCny) || budgetCny <= 0) {
    return { error: { code: "INVALID_BUDGET", message: "budgetCny 须为正数" } };
  }

  if (complexityRaw && !PROJECT_COMPLEXITY.includes(complexityRaw as ProjectComplexity)) {
    return { error: { code: "INVALID_COMPLEXITY", message: "complexity 无效" } };
  }

  if (slaTierRaw && !SLA_TIER.includes(slaTierRaw as SlaTier)) {
    return { error: { code: "INVALID_SLA_TIER", message: "slaTier 无效" } };
  }

  return {
    request: {
      sku,
      projectName,
      areaSqm,
      headcount,
      budgetCny,
      complexity: complexityRaw as ProjectComplexity | undefined,
      slaTier: slaTierRaw as SlaTier | undefined,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = parseQuoteBody(body);

    if ("error" in parsed && parsed.error) {
      return NextResponse.json(
        { ok: false, ...parsed.error },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const response = createQuote(parsed.request!);
    return NextResponse.json(response, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "quote failed";
    return NextResponse.json(
      { ok: false, code: "QUOTE_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
