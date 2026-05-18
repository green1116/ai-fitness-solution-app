import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  requirement?: string;
  response?: string;
  status?: string;
  ref?: string;
  risk?: string;
  note?: string;
  source?: string;
};

type OptimizeRequestBody = {
  technicalRows?: Row[];
  businessRows?: Row[];
};

function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

function isBusinessRef(ref: string) {
  return /^B-/i.test(ref);
}

function isTechnicalRef(ref: string) {
  return /^T-/i.test(ref);
}

function buildFallbackTechnicalResponse(row: Row) {
  const req = normalizeText(row.requirement);
  return [
    "我方已充分理解并响应本条技术要求。",
    req ? `针对“${req.slice(0, 80)}${req.length > 80 ? "..." : ""}”` : "",
    "我方将严格按照招标文件及合同约定执行相关技术规范与实施要求，确保设备配置、性能指标、安装调试及交付成果满足项目要求。",
    "如涉及参数、性能、兼容性、实施细节、验收标准或技术保障要求，我方将在投标文件及实施阶段提供完整说明、执行方案与配套保障措施。",
  ]
    .filter(Boolean)
    .join("");
}

function buildFallbackBusinessResponse(row: Row) {
  const req = normalizeText(row.requirement);
  return [
    "我方已充分理解并响应本条商务要求。",
    req ? `针对“${req.slice(0, 80)}${req.length > 80 ? "..." : ""}”` : "",
    "我方承诺按照招标文件及合同约定履行相关商务条款，确保交付进度、售后服务、质保承诺、履约配合及项目组织安排满足采购要求。",
    "如涉及付款方式、服务期限、质保责任、违约责任、履约要求或其他商务事项，我方将提供明确承诺及执行保障。",
  ]
    .filter(Boolean)
    .join("");
}

function fixTechnicalRow(row: Row) {
  const existingResponse = normalizeText(row.response);

  const nextResponse =
    existingResponse.length >= 24
      ? existingResponse
      : buildFallbackTechnicalResponse(row);

  return {
    ...row,
    response: nextResponse,
    status: "响应",
    risk: "已补强",
    source: row.source ?? "tender-optimize",
  };
}

function fixBusinessRow(row: Row) {
  const existingResponse = normalizeText(row.response);

  const nextResponse =
    existingResponse.length >= 24
      ? existingResponse
      : buildFallbackBusinessResponse(row);

  return {
    ...row,
    response: nextResponse,
    status: "响应",
    risk: "已补强",
    source: row.source ?? "tender-optimize",
  };
}

function optimizeTechnicalRows(rows: Row[]) {
  let touched = 0;

  const nextRows = rows.map((row) => {
    const before = normalizeText(row.response);

    const nextRow = fixTechnicalRow(row);

    if (normalizeText(nextRow.response) !== before) {
      touched += 1;
    }

    return nextRow;
  });

  return { nextRows, touched };
}

function optimizeBusinessRows(rows: Row[]) {
  let touched = 0;

  const nextRows = rows.map((row) => {
    const before = normalizeText(row.response);

    const nextRow = fixBusinessRow(row);

    if (normalizeText(nextRow.response) !== before) {
      touched += 1;
    }

    return nextRow;
  });

  return { nextRows, touched };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as OptimizeRequestBody | null;

    const technicalRows: Row[] = Array.isArray(body?.technicalRows)
      ? body!.technicalRows!
      : [];
    const businessRows: Row[] = Array.isArray(body?.businessRows)
      ? body!.businessRows!
      : [];

    const {
      nextRows: optimizedTechnical,
      touched: touchedTechnical,
    } = optimizeTechnicalRows(technicalRows);

    const {
      nextRows: optimizedBusiness,
      touched: touchedBusiness,
    } = optimizeBusinessRows(businessRows);

    console.log("[tender-optimize]", {
      technicalInput: technicalRows.length,
      businessInput: businessRows.length,
      touchedTechnical,
      touchedBusiness,
      technicalPreview: optimizedTechnical.slice(0, 3).map((row) => ({
        ref: normalizeText(row.ref),
        responseLength: normalizeText(row.response).length,
        status: normalizeText(row.status),
      })),
      businessPreview: optimizedBusiness.slice(0, 3).map((row) => ({
        ref: normalizeText(row.ref),
        responseLength: normalizeText(row.response).length,
        status: normalizeText(row.status),
      })),
    });

    return NextResponse.json({
      ok: true,
      touched: {
        technical: touchedTechnical,
        business: touchedBusiness,
      },
      technicalRows: optimizedTechnical,
      businessRows: optimizedBusiness,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "optimize error";

    console.error("[tender-optimize] failed", e);

    return NextResponse.json(
      {
        ok: false,
        code: "OPTIMIZE_FAILED",
        message,
      },
      { status: 500 }
    );
  }
}