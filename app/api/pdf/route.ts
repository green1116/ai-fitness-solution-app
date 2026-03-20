// app/api/pdf/route.ts
if (process.env.NODE_ENV !== "production") {
  console.log("[PDF_ROUTE]", "20260312_TOKEN_GUARD_UNIFIED");
}

import { NextRequest, NextResponse } from "next/server";
import {
  BUDGET_ENGINE_FP,
  BUDGET_PDF_VERSION,
  renderBudgetPdfBuffer,
} from "@/lib/pdf/budgetRender";
import { getBudgetSummary } from "@/lib/services/budgetService";
import { renderPdf } from "@/lib/pdf/render";
import {
  parseTenderLevel,
  parseTheme,
  resolvePreset,
  type TenderLevel,
} from "@/lib/pdf/presets";
import { logPdfDownloadSafe, getReqIp } from "@/lib/audit/pdfLog";
import { requireAndConsumeDownloadToken } from "@/lib/download-token";
import { webcrypto } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isInternalPack(req: NextRequest) {
  const flag = (req.headers.get("x-internal-pack") || "").trim();
  const secret = (req.headers.get("x-internal-pack-secret") || "").trim();
  const expect = (process.env.INTERNAL_PACK_SECRET || "").trim();
  return flag === "1" && !!expect && secret === expect;
}

type Mode = "preview" | "full" | "budget";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function safeStr(v: any, fallback = "") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function pick<T extends string>(v: any, allowed: readonly T[], fallback: T): T {
  const s = String(v || "").trim() as T;
  return (allowed as readonly string[]).includes(s) ? s : fallback;
}

function toInt(v: any, fallback: number) {
  const s = String(v ?? "").trim();
  if (!s) return fallback;
  const n = Number(s);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

function normalizePdfBytes(out: any): Uint8Array | null {
  if (!out) return null;

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(out)) {
    return new Uint8Array(out);
  }
  if (out instanceof Uint8Array) return out;
  if (out instanceof ArrayBuffer) return new Uint8Array(out);
  if (ArrayBuffer.isView(out) && out.buffer) {
    return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
  }

  // fallback: {0:..,1:..}
  if (typeof out === "object") {
    const keys = Object.keys(out);
    if (keys.length && keys.every((k) => /^\d+$/.test(k))) {
      const arr = new Uint8Array(keys.length);
      for (let i = 0; i < keys.length; i++) arr[i] = Number(out[i]) & 255;
      return arr;
    }
  }

  return null;
}

async function shortSigHex(payload: string) {
  const data = new TextEncoder().encode(payload);
  const digest = await webcrypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12);
}

/**
 * ✅ 统一下载鉴权（Plan/Budget 共用）
 * - 缺 token / token 不合法：返回 403（不会变成 500）
 * - internal/internal-pack：直接放行
 */
async function guardDownloadOr403(opts: {
  req: NextRequest;
  internal: boolean;
  downloadToken: string;
  planId: string;
  mode: Mode;
  fingerprint: string;
}) {
  const { req, internal, downloadToken, planId, mode, fingerprint } = opts;
  if (internal) return null;

  const ip = getReqIp(req as any);
  const ua = req.headers.get("user-agent") || "";

  const c = await requireAndConsumeDownloadToken({
    downloadToken,
    planId,
    mode,
    fingerprint,
    ip,
    ua,
  });

  if (!c?.ok) {
    const code = safeStr(c?.code, "TOKEN_MISSING");
    return json(403, code, `download token rejected: ${code}`, c);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = safeStr(searchParams.get("planId"));
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const mode = pick(
      searchParams.get("mode"),
      ["preview", "full", "budget"] as const,
      "full"
    );

    const internal = searchParams.get("internal") === "1" || isInternalPack(req);

    // ✅ 统一支持 token 参数名（浏览器地址栏一般只能用 query/cookie）
    const downloadToken = safeStr(
      searchParams.get("downloadToken") ??
        searchParams.get("token") ??
        req.headers.get("x-download-token") ??
        "",
      ""
    );

    // ---------------- budget ----------------
    if (mode === "budget") {
      const companyName = safeStr(searchParams.get("companyName"), "示例企业");
      const companySize = toInt(searchParams.get("companySize"), 200);

      const budgetTier = pick(
        safeStr(searchParams.get("budgetTier")).toLowerCase(),
        ["low", "mid", "high"] as const,
        "mid"
      );

      // ✅ level（兼容 brand -> saas）
      const levelRaw = safeStr(searchParams.get("level"), "").toLowerCase();
      const level: TenderLevel = parseTenderLevel(
        levelRaw === "brand" ? "saas" : levelRaw
      );

      // ✅ theme（enterprise 强制 tender）
      const themeRaw = parseTheme(searchParams.get("theme"));
      let resolvedTheme: "brand" | "tender" =
        themeRaw === "tender" ? "tender" : "brand";
      if (level === "enterprise") resolvedTheme = "tender";

      // ✅ 由 preset 决定 sections，但 enterprise 强制条款
      const preset = resolvePreset({ level, theme: resolvedTheme });
      const enterpriseForcedSections = [
        "pricing_terms",
        "delivery_terms",
        "payment_terms",
        "after_sales",
        "sign_seal",
      ] as const;

      const sections =
        level === "enterprise"
          ? (enterpriseForcedSections as any)
          : (preset.budget.sections as any);

      // ✅ docSeq：只在 government
      const docSeq = preset.budget.requireDocSeq
        ? safeStr(searchParams.get("docSeq"), "01")
        : "00";

      const debugRows = safeStr(searchParams.get("debugRows")) === "1";

      const pdfVersionBudget = safeStr(
        searchParams.get("pdfVersionBudget"),
        BUDGET_PDF_VERSION
      );

      const sigPayload = JSON.stringify({
        planId,
        mode: "budget",
        companyName,
        companySize,
        budgetTier,
        pdfVersionBudget,
        level,
        docSeq,
        theme: resolvedTheme,
        sections,
      });
      const reqSig = await shortSigHex(sigPayload);

      const format = safeStr(searchParams.get("format")).toLowerCase();
      const download = safeStr(searchParams.get("download"), "1");

      // ✅ summary：和预算书一致
      const summary = await getBudgetSummary({
        planId,
        companyName,
        companySize,
        budgetTier,
      });

      if (format === "json" || format === "summary") {
        const body =
          format === "summary"
            ? {
                ok: true,
                mode: "budget",
                planId,
                input: { companyName, companySize, budgetTier },
                reqSig,
                engine: {
                  fp: BUDGET_ENGINE_FP,
                  version: pdfVersionBudget,
                  impl: "budgetRender.ts",
                },
                budget: { level, theme: resolvedTheme, docSeq, sections },
                summary,
              }
            : {
                ok: true,
                mode: "budget",
                planId,
                input: { companyName, companySize, budgetTier, pdfVersionBudget },
                engine: {
                  fp: BUDGET_ENGINE_FP,
                  version: pdfVersionBudget,
                  impl: "budgetRender.ts",
                },
                reqSig,
                budget: { level, theme: resolvedTheme, docSeq, sections },
                summary: {
                  tier: summary?.tier,
                  companySize: summary?.companySize,
                  overallTotal: summary?.overallTotal,
                  estimatedBySubtotals: summary?.estimatedBySubtotals,
                  lines: summary?.lines,
                  itemsCount: Array.isArray((summary as any)?.items)
                    ? (summary as any).items.length
                    : 0,
                },
              };

        return NextResponse.json(body, { status: 200 });
      }

      // ✅ budget 鉴权（统一为 guardDownloadOr403）
      {
        const ip = getReqIp(req as any);
        const ua = req.headers.get("user-agent") || "";
        const fp = [
          planId,
          "budget",
          (ip || "noip").split(",")[0].trim(),
          (ua || "noua").slice(0, 80),
        ].join("|");

        const deny = await guardDownloadOr403({
          req,
          internal,
          downloadToken,
          planId,
          mode: "budget",
          fingerprint: fp,
        });
        if (deny) return deny;
      }

      const levelHeader = level === "saas" ? "brand" : level;

      const out: any = await renderBudgetPdfBuffer(
        { planId, companyName, companySize, budgetTier },
        {
          pdfVersion: pdfVersionBudget,
          engineFP: BUDGET_ENGINE_FP,
          reqsig: reqSig,
          level: level as any,
          theme: resolvedTheme,
          sections,
          docSeq,
          debugRows,
        }
      );

      const pdfLike =
        out && typeof out === "object" && "pdfBytes" in out ? out.pdfBytes : out;
      const bytes = normalizePdfBytes(pdfLike);

      if (!bytes || bytes.length < 1000) {
        return json(
          500,
          "BUDGET_RENDER_BAD_RETURN",
          "budget renderer returned invalid bytes",
          {
            outType: typeof out,
            outKeys:
              out && typeof out === "object"
                ? Object.keys(out).slice(0, 30)
                : undefined,
            outLen: bytes ? bytes.length : undefined,
          }
        );
      }

      const fname = `budget-${planId}-${levelHeader}-${reqSig}.pdf`;

      // ✅ 日志记录（仅 GET）
      if (req.method === "GET") {
        const ip = getReqIp(req as any);
        const ua = req.headers.get("user-agent") || null;

        await logPdfDownloadSafe({
          planId,
          route: "/api/pdf",
          method: "GET",
          mode: "budget",
          level: levelHeader,
          format: null,
          theme: resolvedTheme,
          pdfVersion: pdfVersionBudget,
          reqsig: reqSig,
          docSeq: docSeq || null,
          pages: null,
          bytes: bytes.length,
          ip,
          ua,
          extra: {
            url: req.url,
            contentDisposition: download === "1" ? "attachment" : "inline",
            engineFP: BUDGET_ENGINE_FP,
            ...(isInternalPack(req) ? { internalPack: true } : {}),
          },
        });
      }

      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-store",
          "X-PDF-MODE": "budget",
          "X-PDF-VERSION": pdfVersionBudget,
          "X-ENGINE-FP": BUDGET_ENGINE_FP,
          "X-REQSIG": reqSig,
          "X-BUDGET-LEVEL": levelHeader,
          "X-TENDER-LEVEL": String(level),
          "X-THEME": resolvedTheme,
          "X-BUDGET-DOCSEQ": docSeq,
          "X-BUDGET-DEBUG-ROWS": debugRows ? "1" : "0",
          ...(download === "1"
            ? { "Content-Disposition": `attachment; filename="${fname}"` }
            : { "Content-Disposition": `inline; filename="${fname}"` }),
        },
      });
    }

    // ---------------- plan (preview/full) ----------------
    const pdfVersionPlan = safeStr(searchParams.get("pdfVersionPlan"), "PLAN_V1");
    const pvLegacy = safeStr(searchParams.get("pdfVersion"));
    const finalPlanVersion = pvLegacy ? pvLegacy : pdfVersionPlan;

    const levelRawPlan = safeStr(searchParams.get("level"), "").toLowerCase();
    const levelPlan: TenderLevel = parseTenderLevel(
      levelRawPlan === "brand" ? "saas" : levelRawPlan
    );

    const themeRawPlan = parseTheme(searchParams.get("theme"));
    const resolvedThemePlan: "brand" | "tender" =
      themeRawPlan === "tender" ? "tender" : "brand";

    const watermarkPlan = safeStr(searchParams.get("watermark"), "0");
    const tzPlan = safeStr(searchParams.get("tz"), "Asia/Tokyo");
    const download = safeStr(searchParams.get("download"), "1");

    const sigPayloadPlan = JSON.stringify({
      planId,
      mode,
      pdfVersionPlan: finalPlanVersion,
      level: levelPlan,
      theme: resolvedThemePlan,
      watermark: watermarkPlan,
      tz: tzPlan,
    });
    const reqSigPlan = await shortSigHex(sigPayloadPlan);

    // ✅ plan 鉴权（统一为 guardDownloadOr403）
    {
      const ip = getReqIp(req as any);
      const ua = req.headers.get("user-agent") || "";
      const fp = [
        planId,
        mode,
        (ip || "noip").split(",")[0].trim(),
        (ua || "noua").slice(0, 80),
        finalPlanVersion,
        String(levelPlan),
        resolvedThemePlan,
        watermarkPlan === "1" ? "wm1" : "wm0",
        tzPlan,
      ].join("|");

      const deny = await guardDownloadOr403({
        req,
        internal,
        downloadToken,
        planId,
        mode,
        fingerprint: fp,
      });
      if (deny) return deny;
    }

    const planResult = await renderPdf(planId, { mode });
    const bytesPlan =
      typeof planResult === "object" &&
      planResult !== null &&
      "pdfBytes" in planResult
        ? (planResult as any).pdfBytes
        : planResult;

    const buf = Buffer.from(bytesPlan);

    // ✅ 日志记录（仅 GET）
    if (req.method === "GET") {
      const ip = getReqIp(req as any);
      const ua = req.headers.get("user-agent") || null;

      await logPdfDownloadSafe({
        planId,
        route: "/api/pdf",
        method: "GET",
        mode,
        level: String(levelPlan),
        format: null,
        theme: resolvedThemePlan,
        pdfVersion: finalPlanVersion,
        reqsig: reqSigPlan,
        docSeq: null,
        pages: null,
        bytes: buf.length,
        ip,
        ua,
        extra: {
          url: req.url,
          contentDisposition: download === "1" ? "attachment" : "inline",
          ...(isInternalPack(req) ? { internalPack: true } : {}),
        },
      });
    }

    const fname = `${mode}-${planId}.pdf`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store, max-age=0",
        "X-REQSIG": reqSigPlan,
        "X-PDF-MODE": mode,
        "X-PDF-VERSION": finalPlanVersion,
        "X-TENDER-LEVEL": String(levelPlan),
        "X-THEME": resolvedThemePlan,
        "X-WATERMARK": watermarkPlan === "1" ? "1" : "0",
        "X-TZ": tzPlan,
        ...(download === "1"
          ? { "Content-Disposition": `attachment; filename="${fname}"` }
          : { "Content-Disposition": `inline; filename="${fname}"` }),
      },
    });
  } catch (err: any) {
    console.error("[PDF_ROUTE_FATAL]", err);

    const message = err?.message ? String(err.message) : "Unknown error";
    const name = err?.name ? String(err.name) : "Error";
    const stack = err?.stack ? String(err.stack) : "";

    const isProd = process.env.NODE_ENV === "production";

    const res = NextResponse.json(
      {
        ok: false,
        code: "PDF_INTERNAL_ERROR",
        message,
        extra: {
          name,
          ...(isProd ? {} : { stack }),
        },
      },
      { status: 500 }
    );

    res.headers.set("X-PDF-FATAL", "1");
    res.headers.set("X-PDF-ERR-NAME", name);
    res.headers.set("X-PDF-ERR", encodeURIComponent(message).slice(0, 180));

    return res;
  }
}

export async function HEAD(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = safeStr(searchParams.get("planId"));
    if (!planId) return new NextResponse(null, { status: 400 });

    const mode = pick(
      searchParams.get("mode"),
      ["preview", "full", "budget"] as const,
      "full"
    );

    // ---------------- budget HEAD ----------------
    if (mode === "budget") {
      const companyName = safeStr(searchParams.get("companyName"), "示例企业");
      const companySize = toInt(searchParams.get("companySize"), 200);

      const budgetTier = pick(
        safeStr(searchParams.get("budgetTier")).toLowerCase(),
        ["low", "mid", "high"] as const,
        "mid"
      );

      const levelRaw = safeStr(searchParams.get("level"), "").toLowerCase();
      const level: TenderLevel = parseTenderLevel(
        levelRaw === "brand" ? "saas" : levelRaw
      );

      const themeRaw = parseTheme(searchParams.get("theme"));
      let resolvedTheme: "brand" | "tender" =
        themeRaw === "tender" ? "tender" : "brand";
      if (level === "enterprise") resolvedTheme = "tender";

      const preset = resolvePreset({ level, theme: resolvedTheme });
      const enterpriseForcedSections = [
        "pricing_terms",
        "delivery_terms",
        "payment_terms",
        "after_sales",
        "sign_seal",
      ] as const;

      const sections =
        level === "enterprise"
          ? (enterpriseForcedSections as any)
          : (preset.budget.sections as any);

      const docSeq = preset.budget.requireDocSeq
        ? safeStr(searchParams.get("docSeq"), "01")
        : "00";

      const pdfVersionBudget = safeStr(
        (searchParams.get("pdfVersionBudget") || searchParams.get("pdfVersion")) ??
          "",
        BUDGET_PDF_VERSION
      );

      const sigPayload = JSON.stringify({
        planId,
        mode: "budget",
        companyName,
        companySize,
        budgetTier,
        pdfVersionBudget,
        level,
        docSeq,
        theme: resolvedTheme,
        sections,
      });
      const reqSig = await shortSigHex(sigPayload);

      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-store",
          "X-REQSIG": reqSig,
          "X-PDF-MODE": "budget",
          "X-PDF-VERSION": pdfVersionBudget,
          "X-ENGINE-FP": BUDGET_ENGINE_FP,
          "X-TENDER-LEVEL": String(level),
          "X-THEME": resolvedTheme,
          "X-BUDGET-DOCSEQ": docSeq,
        },
      });
    }

    // ---------------- plan (preview/full) HEAD ----------------
    const pdfVersionPlan = safeStr(
      searchParams.get("pdfVersionPlan") || searchParams.get("pdfVersion"),
      "PLAN_V1"
    );

    const levelRawPlan = safeStr(searchParams.get("level"), "").toLowerCase();
    const levelPlan: TenderLevel = parseTenderLevel(
      levelRawPlan === "brand" ? "saas" : levelRawPlan
    );

    const themeRawPlan = parseTheme(searchParams.get("theme"));
    const resolvedThemePlan: "brand" | "tender" =
      themeRawPlan === "tender" ? "tender" : "brand";

    const watermarkPlan = safeStr(searchParams.get("watermark"), "0");
    const tzPlan = safeStr(searchParams.get("tz"), "Asia/Tokyo");

    const sigPayloadPlan = JSON.stringify({
      planId,
      mode,
      pdfVersionPlan,
      level: levelPlan,
      theme: resolvedThemePlan,
      watermark: watermarkPlan,
      tz: tzPlan,
    });
    const reqSigPlan = await shortSigHex(sigPayloadPlan);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "X-REQSIG": reqSigPlan,
        "X-PDF-MODE": mode,
        "X-PDF-VERSION": pdfVersionPlan,
        "X-TENDER-LEVEL": String(levelPlan),
        "X-THEME": resolvedThemePlan,
        "X-WATERMARK": watermarkPlan === "1" ? "1" : "0",
        "X-TZ": tzPlan,
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}