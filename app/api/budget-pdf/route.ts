// app/api/budget-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  renderBudgetPdfBuffer,
  type BudgetPdfSection,
  type BudgetPdfInput,
} from "@/lib/pdf/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function parseBool(v: string | null) {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
}

function parseNum(v: string | null) {
  if (!v) return undefined;
  const x = Number(v);
  return Number.isFinite(x) ? x : undefined;
}

function parseSections(v: string | null): BudgetPdfSection[] | undefined {
  const raw = (v || "").trim();
  if (!raw) return undefined;

  const allow = new Set<BudgetPdfSection>([
    "header",
    "overall",
    "compare",
    "table",
    "brands",
    "supplement",
    "remarks",
  ]);

  const arr = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as BudgetPdfSection[];

  const out = arr.filter((k) => allow.has(k));
  return out.length ? out : undefined;
}

// 用于 response header，避免非 ASCII 导致某些环境 header 乱码
function asciiSafe(s: string) {
  return String(s || "").replace(/[^\x20-\x7E]/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    // --- 与前端 DownloadBudgetPdfButton 对齐 ---
    const companyName = (searchParams.get("companyName") || "未命名企业").trim();

    // 50/100/200（你的类型里是 CompanySize）
    const companySize = Number(searchParams.get("companySize") || "100") as any;

    // low/mid/high
    const budgetTier = (searchParams.get("budgetTier") || "mid") as any;

    // 参与率：兼容 rate / participationRate 两种
    const participationRate =
      parseNum(searchParams.get("participationRate")) ??
      parseNum(searchParams.get("rate"));

    // 面积：兼容 spaceSqm / area
    const spaceSqm =
      parseNum(searchParams.get("spaceSqm")) ?? parseNum(searchParams.get("area"));

    // 目标：general/fatloss/strength/rehab
    const goal = (searchParams.get("goal") || "general") as any;

    // 偏好：兼容 smart/quiet，也兼容 preferSmart/preferQuiet
    const preferSmart =
      parseBool(searchParams.get("preferSmart")) || parseBool(searchParams.get("smart"));
    const preferQuiet =
      parseBool(searchParams.get("preferQuiet")) || parseBool(searchParams.get("quiet"));

    // 模块：sections=header,overall,table,...
    const sections = parseSections(searchParams.get("sections"));

    const input: BudgetPdfInput = {
      planId,
      companyName,
      companySize,
      budgetTier,
      ...(typeof participationRate === "number" ? { participationRate } : {}),
      ...(typeof spaceSqm === "number" ? { spaceSqm } : {}),
      ...(goal && goal !== "general" ? { goal } : {}),
      ...(preferSmart ? { preferSmart } : {}),
      ...(preferQuiet ? { preferQuiet } : {}),
    };

    const pdfVersion =
      searchParams.get("pdfVersion") ||
      `BUDGET_PDF_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_01`;

    const buf = await renderBudgetPdfBuffer(input, {
      pdfVersion,
      ...(sections ? { sections } : {}),
    });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="budget-${planId}.pdf"`,
        "X-PDF-KIND": "BUDGET",
        "X-PDF-VERSION": asciiSafe(pdfVersion),
      },
    });
  } catch (e: any) {
    return json(500, "BUDGET_PDF_INTERNAL_ERROR", e?.message || "Internal error", {
      name: e?.name,
      stack: e?.stack,
      hint: "Check lib/pdf/budget.ts (should delegate to lib/pdf/renderBudget.ts) and ensure public/fonts/NotoSansSC-Regular.ttf exists.",
    });
  }
}
