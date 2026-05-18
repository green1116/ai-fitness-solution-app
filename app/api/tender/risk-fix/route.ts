import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TenderRiskRow = {
  requirement: string;
  response?: string;
  status?: string;
  ref?: string;
  note?: string;
  risk?: string;
  source?: string;
};

type RiskFixRequestBody = {
  planId?: string;
  riskId?: string;
  technicalRows?: TenderRiskRow[];
  businessRows?: TenderRiskRow[];
};

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

function isBusinessRef(ref: string) {
  return /^B-/i.test(ref);
}

function isTechnicalRef(ref: string) {
  return /^T-/i.test(ref);
}

function buildFallbackTechnicalResponse(row: TenderRiskRow) {
  const req = normalizeText(row.requirement);
  return [
    "我方已充分理解并响应本条技术要求。",
    req ? `针对“${req.slice(0, 80)}${req.length > 80 ? "..." : ""}”` : "",
    "我方将严格按照招标文件、合同约定及项目实施要求，提供符合规范的产品、配置、实施与技术支持服务。",
    "如本条涉及参数、性能、兼容性、安装调试或交付要求，我方将在投标响应文件及实施阶段提供对应说明、证明材料与执行保障。",
  ]
    .filter(Boolean)
    .join("");
}

function buildFallbackBusinessResponse(row: TenderRiskRow) {
  const req = normalizeText(row.requirement);
  return [
    "我方已充分理解并响应本条商务要求。",
    req ? `针对“${req.slice(0, 80)}${req.length > 80 ? "..." : ""}”` : "",
    "我方承诺按招标文件及合同约定履行相关责任与义务，确保项目组织、交付、服务、质保及商务配合工作满足要求。",
    "如本条涉及时限、售后、付款、履约、质保、联系人、保证金或其他商务事项，我方将在投标文件中提供明确承诺与执行安排。",
  ]
    .filter(Boolean)
    .join("");
}

function fixOneRow(row: TenderRiskRow) {
  const ref = normalizeText(row.ref);
  const existingResponse = normalizeText(row.response);
  const isBiz = isBusinessRef(ref);

  const nextResponse =
    existingResponse.length >= 24
      ? existingResponse
      : isBiz
        ? buildFallbackBusinessResponse(row)
        : buildFallbackTechnicalResponse(row);

  return {
    ...row,
    response: nextResponse,
    status: "响应",
    note: normalizeText(row.note),
    risk: "已补强",
    source: row.source ?? "risk-fix",
  };
}

function fixRowsByRiskId(
  riskId: string,
  technicalRows: TenderRiskRow[],
  businessRows: TenderRiskRow[]
) {
  let touchedTechnical = 0;
  let touchedBusiness = 0;

  const nextTechnicalRows = technicalRows.map((row) => {
    const ref = normalizeText(row.ref);
    if (ref === riskId || (!riskId && isTechnicalRef(ref))) {
      touchedTechnical += 1;
      return fixOneRow(row);
    }
    return row;
  });

  const nextBusinessRows = businessRows.map((row) => {
    const ref = normalizeText(row.ref);
    if (ref === riskId || (!riskId && isBusinessRef(ref))) {
      touchedBusiness += 1;
      return fixOneRow(row);
    }
    return row;
  });

  return {
    nextTechnicalRows,
    nextBusinessRows,
    touchedTechnical,
    touchedBusiness,
  };
}

function fixRowsByTopRiskGroup(
  riskId: string,
  technicalRows: TenderRiskRow[],
  businessRows: TenderRiskRow[]
) {
  const id = normalizeText(riskId).toUpperCase();

  if (!id) {
    return fixRowsByRiskId("", technicalRows, businessRows);
  }

  // 当前先做最小闭环：
  // 1) 如果 riskId 正好对应某行 ref，则只修这一行
  // 2) 如果 riskId 是聚合风险（如 R-01），则优先修所有空 response / 待确认行
  const exactTechnicalExists = technicalRows.some(
    (r) => normalizeText(r.ref).toUpperCase() === id
  );
  const exactBusinessExists = businessRows.some(
    (r) => normalizeText(r.ref).toUpperCase() === id
  );

  if (exactTechnicalExists || exactBusinessExists) {
    return fixRowsByRiskId(id, technicalRows, businessRows);
  }

  let touchedTechnical = 0;
  let touchedBusiness = 0;

  const nextTechnicalRows = technicalRows.map((row) => {
    const shouldFix =
      normalizeText(row.response).length < 24 ||
      normalizeText(row.status) === "待确认";

    if (!shouldFix) return row;
    touchedTechnical += 1;
    return fixOneRow(row);
  });

  const nextBusinessRows = businessRows.map((row) => {
    const shouldFix =
      normalizeText(row.response).length < 24 ||
      normalizeText(row.status) === "待确认";

    if (!shouldFix) return row;
    touchedBusiness += 1;
    return fixOneRow(row);
  });

  return {
    nextTechnicalRows,
    nextBusinessRows,
    touchedTechnical,
    touchedBusiness,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as RiskFixRequestBody | null;
    const planId = normalizeText(body?.planId);
    const riskId = normalizeText(body?.riskId);
    const technicalRows = Array.isArray(body?.technicalRows) ? body!.technicalRows! : [];
    const businessRows = Array.isArray(body?.businessRows) ? body!.businessRows! : [];

    if (!planId) {
      return json(400, {
        ok: false,
        message: "缺少 planId",
      });
    }

    if (!technicalRows.length && !businessRows.length) {
      return json(400, {
        ok: false,
        message: "缺少 technicalRows / businessRows，无法执行自动补强。",
      });
    }

    const {
      nextTechnicalRows,
      nextBusinessRows,
      touchedTechnical,
      touchedBusiness,
    } = fixRowsByTopRiskGroup(riskId, technicalRows, businessRows);

    return json(200, {
      ok: true,
      planId,
      riskId,
      message: "已生成并写入补强响应内容。",
      touched: {
        technical: touchedTechnical,
        business: touchedBusiness,
      },
      technicalRows: nextTechnicalRows,
      businessRows: nextBusinessRows,
    });
  } catch (error) {
    console.error("[tender/risk-fix] failed", error);
    return json(500, {
      ok: false,
      message: "自动补强失败",
    });
  }
}