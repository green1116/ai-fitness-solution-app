// app/api/v1/plan/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { jwtVerify } from "jose";
import { buildPlanBundle } from "@/lib/plan/builder";
import { renderBundle } from "@/lib/pdf/render-bundle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function readPlanFromPlansDir(planId: string) {
  const p = path.join(process.cwd(), "plans", `${planId}.json`);
  if (!fs.existsSync(p)) return null;

  try {
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function pickFirstString(...vals: any[]) {
  for (const v of vals) {
    const ss = String(v ?? "").trim();
    if (ss) return ss;
  }
  return "";
}

function pickFirstNumber(...vals: any[]) {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function extractCompanyFromStored(stored: any) {
  const root = stored || {};
  const meta = root.meta || {};
  const input = root.input || {};
  const plan = root.plan || {};
  const profile = root.profile || root.companyProfile || {};
  const company = root.company || {};
  const data = root.data || {};

  const industry = pickFirstString(
    root.industry,
    meta.industry,
    input.industry,
    plan.industry,
    profile.industry,
    company.industry,
    data.industry,
    root.sceneIndustry,
    root.trade
  );

  const companySize = pickFirstNumber(
    root.companySize,
    root.company_size,
    meta.companySize,
    meta.company_size,
    input.companySize,
    input.company_size,
    plan.companySize,
    profile.companySize,
    profile.company_size,
    company.companySize,
    company.company_size,
    data.companySize,
    data.company_size,
    root.size,
    root.headcount
  );

  const areaSize = pickFirstNumber(
    root.areaSize,
    root.area,
    root.area_size,
    meta.areaSize,
    meta.area,
    meta.area_size,
    input.areaSize,
    input.area,
    input.area_size,
    plan.areaSize,
    profile.areaSize,
    profile.area,
    profile.area_size,
    company.areaSize,
    company.area,
    data.areaSize,
    data.area,
    root.squareMeters,
    root.m2
  );

  let budgetRange = pickFirstString(
    root.budgetRange,
    root.budget_range,
    meta.budgetRange,
    meta.budget_range,
    input.budgetRange,
    input.budget_range,
    plan.budgetRange,
    profile.budgetRange,
    company.budgetRange,
    data.budgetRange,
    root.budget,
    meta.budget,
    input.budget,
    plan.budget,
    profile.budget,
    company.budget,
    root.budgetTier,
    root.budget_level
  );

  const bMin = pickFirstNumber(
    root.budgetMin,
    meta.budgetMin,
    input.budgetMin,
    plan.budgetMin,
    profile.budgetMin,
    company.budgetMin,
    data.budgetMin,
    root.budget_min
  );
  const bMax = pickFirstNumber(
    root.budgetMax,
    meta.budgetMax,
    input.budgetMax,
    plan.budgetMax,
    profile.budgetMax,
    company.budgetMax,
    data.budgetMax,
    root.budget_max
  );

  if (!budgetRange && bMin && bMax) {
    budgetRange = `${bMin}-${bMax}万`;
  }

  return { industry, companySize, areaSize, budgetRange };
}

async function verifyDownloadTokenIfRequired(body: any) {
  const requireToken = Boolean(body?.requireToken);
  if (!requireToken) return;

  const token = String(body?.downloadToken || "").trim();
  if (!token) {
    throw new Error("缺少 downloadToken（requireToken=true 时必须提供）");
  }

  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    throw new Error("服务端未配置 DOWNLOAD_TOKEN_SECRET，无法验证 downloadToken");
  }

  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);

  const tokenPlanId = String((payload as any)?.planId || "").trim();
  if (tokenPlanId && body?.planId && tokenPlanId !== body.planId) {
    throw new Error(`downloadToken planId 不匹配：token=${tokenPlanId}, body=${body.planId}`);
  }
}

function bundleToPdfSections(bundle: any): Array<{ title: string; body: string }> {
  const candidates = [
    bundle?.sections,
    bundle?.pages,
    bundle?.items,
    bundle?.content,
    bundle?.blocks,
    bundle?.chapters,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((s: any, idx: number) => ({
        title: String(
          s?.title ||
            s?.heading ||
            s?.name ||
            s?.label ||
            s?.chapterTitle ||
            `Section ${idx + 1}`
        ),
        body: String(
          s?.body ||
            s?.content ||
            s?.text ||
            s?.markdown ||
            s?.summary ||
            ""
        ),
      }));
    }
  }

  if (bundle && typeof bundle === "object") {
    return [
      {
        title: String(bundle.title || bundle.name || "Plan Bundle"),
        body: JSON.stringify(bundle, null, 2),
      },
    ];
  }

  return [{ title: "Plan Bundle", body: String(bundle ?? "") }];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const options = body?.options || {};
    const company = body?.company || {};

    await verifyDownloadTokenIfRequired(body);

    const includePdf = Boolean(options.includePdf ?? true);
    const includeCompare = Boolean(options.includeCompare ?? true);

    const planId =
      String(company.planId || body?.planId || "").trim() || crypto.randomUUID();

    let industry = String(company.industry || "").trim();
    let companySize = Number(company.companySize || 0);
    let areaSize = Number(company.areaSize || 0);
    let budgetRange = String(company.budgetRange || "").trim();

    let usedDefaults = false;

    if (!industry || !companySize || !areaSize || !budgetRange) {
      const stored = readPlanFromPlansDir(planId);
      if (stored) {
        const extracted = extractCompanyFromStored(stored);
        industry = industry || extracted.industry;
        companySize = companySize || extracted.companySize;
        areaSize = areaSize || extracted.areaSize;
        budgetRange = budgetRange || extracted.budgetRange;
      }
    }

    if (!industry || !companySize || !areaSize || !budgetRange) {
      usedDefaults = true;
      industry = industry || "互联网";
      companySize = companySize || 200;
      areaSize = areaSize || 120;
      budgetRange = budgetRange || "10-20万";
    }

    const bundle = buildPlanBundle({
      planId,
      industry,
      companySize,
      areaSize,
      budgetRange,
      includeCompare,
    });

    let pdfBase64: string | null = null;
    if (includePdf) {
      const pdfSections = bundleToPdfSections(bundle as any);
      const pdfBytes = await renderBundle(pdfSections);
      pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    }

    return json(200, {
      ok: true,
      data: {
        usedDefaults,
        bundle,
        pdf: includePdf
          ? {
              fileName: `plan-bundle-${planId}.pdf`,
              base64: pdfBase64,
              contentType: "application/pdf",
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error("[v1/plan/generate] error:", err);
    return json(500, {
      ok: false,
      code: "INTERNAL_ERROR",
      message: err?.message || "服务器内部错误",
      extra: { name: err?.name, stack: err?.stack },
    });
  }
}