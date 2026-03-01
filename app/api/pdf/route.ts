// app/api/pdf/route.ts
console.log("[PDF_ROUTE] ACTIVE: 20260301_A");

import { NextRequest, NextResponse } from "next/server";
import {
  BUDGET_ENGINE_FP,
  BUDGET_PDF_VERSION,
  renderBudgetPdfBuffer, // ✅新增：预算分支直连 V8 renderer
} from "@/lib/pdf/budgetRender";
import { getBudgetSummary } from "@/lib/services/budgetService";
import { renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function encodeHeaderValue(v: string, maxLen = 1600) {
  const enc = encodeURIComponent(v);
  return enc.length <= maxLen ? enc : enc.slice(0, maxLen);
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

  // Buffer (Node)
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(out)) {
    return new Uint8Array(out);
  }

  // Uint8Array
  if (out instanceof Uint8Array) {
    return out;
  }

  // ArrayBuffer
  if (out instanceof ArrayBuffer) {
    return new Uint8Array(out);
  }

  // TypedArray / DataView
  if (ArrayBuffer.isView(out) && out.buffer) {
    return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
  }

  // Array-like object {0:..,1:..} —— 兜底（你现在 outKeys 就是这种形态）
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

/** 生成稳定短签名：参数同样 => 签名同样（用于验真/缓存指纹） */
async function shortSigHex(payload: string) {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12);
}

export async function GET(req: NextRequest) {
  try {
    // ✅ 你原来的所有逻辑不动，整段放这里
    const { searchParams } = new URL(req.url);

    const planId = safeStr(searchParams.get("planId"));
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const mode = pick(
      searchParams.get("mode"),
      ["preview", "full", "budget"] as const,
      "full"
    );

    const debugFlag = safeStr(searchParams.get("debug")) === "1";
    const debug = debugFlag || process.env.NODE_ENV !== "production";

    // ---------------- budget ----------------
    if (mode === "budget") {
      const companyName = safeStr(searchParams.get("companyName"), "示例企业");

      const companySizeRaw = safeStr(searchParams.get("companySize"), "");
      const companySize = toInt(companySizeRaw, 200);

      const budgetTier = pick(
        safeStr(searchParams.get("budgetTier")).toLowerCase(),
        ["low", "mid", "high"] as const,
        "mid"
      );

      // ✅ 新增：预算版本 level（brand / government）
      const level = pick(
        safeStr(searchParams.get("level")).toLowerCase(),
        ["brand", "government"] as const,
        "brand"
      );

      // ✅ 可选：政府编号序号（默认 01）
      const docSeq = safeStr(searchParams.get("docSeq"), "01");

      const debugRows = safeStr(searchParams.get("debugRows")) === "1";

      console.log("[PDF_ROUTE] budget level/docSeq =", level, docSeq, "url=", req.url);

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
      });
      const reqSig = await shortSigHex(sigPayload);

      const format = safeStr(searchParams.get("format")).toLowerCase();
      const download = safeStr(searchParams.get("download"), "1");

      // ✅ budget summary：统一来源（与预算书完全一致）
      const summary = await getBudgetSummary({
        planId,
        companyName,
        companySize,
        budgetTier,
      });

      // 如果要求 JSON/summary，则直接返回 JSON
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
                summary,
              }
            : {
                ok: true,
                mode: "budget",
                planId,
                input: { companyName, companySize, budgetTier, pdfVersionBudget, debug },
                engine: {
                  fp: BUDGET_ENGINE_FP,
                  version: pdfVersionBudget,
                  impl: "budgetRender.ts",
                },
                reqSig,
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

      // ✅ 关键：不要再走 renderPdf()，预算直接调用 V8 renderer
      const out: any = await renderBudgetPdfBuffer(
        { planId, companyName, companySize, budgetTier },
        {
          pdfVersion: pdfVersionBudget,
          engineFP: BUDGET_ENGINE_FP,
          reqsig: reqSig,
          level,   // ✅ 关键：透传
          docSeq,  // ✅ 关键：透传
          debugRows, // ✅ 透传
        }
      );

      // ✅ 兼容：Buffer/Uint8Array/ArrayBuffer/以及 { pdfBytes, summary }
      const pdfLike = out && typeof out === "object" && "pdfBytes" in out ? out.pdfBytes : out;
      const bytes = normalizePdfBytes(pdfLike);

      if (!bytes || bytes.length < 1000) {
        return json(
          500,
          "BUDGET_RENDER_BAD_RETURN",
          "budget renderer returned invalid bytes",
          {
            outType: typeof out,
            outKeys: out && typeof out === "object" ? Object.keys(out).slice(0, 30) : undefined,
            outLen: bytes ? bytes.length : undefined,
          }
        );
      }

      const fname = `budget-${planId}-${level}-${reqSig}.pdf`;

      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-store",
          "X-PDF-MODE": "budget",
          "X-PDF-VERSION": pdfVersionBudget,
          "X-ENGINE-FP": BUDGET_ENGINE_FP,
          "X-REQSIG": reqSig,
          "X-BUDGET-LEVEL": level,
          "X-BUDGET-DOCSEQ": docSeq,
          "X-BUDGET-DEBUG-ROWS": debugRows ? "1" : "0",
          ...(download === "1"
            ? { "Content-Disposition": `attachment; filename="${fname}"` }
            : { "Content-Disposition": `inline; filename="${fname}"` }),
        },
      });
    }

    // ---------------- plan (preview/full) ----------------
    const planResult = await renderPdf(planId, { mode });
    const bytes =
      typeof planResult === "object" &&
      planResult !== null &&
      "pdfBytes" in planResult
        ? (planResult as any).pdfBytes
        : planResult;

    const buf = Buffer.from(bytes);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${mode}-${planId}.pdf"`,
        "cache-control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("[PDF_ROUTE_FATAL]", err);

    const message = err?.message ? String(err.message) : "Unknown error";
    const name = err?.name ? String(err.name) : "Error";
    const stack = err?.stack ? String(err.stack) : "";

    // ✅ DEV: 返回可读 stack；PROD: 只返回 message
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

    // ✅ 关键：即使 500 也带上定位头
    res.headers.set("X-PDF-FATAL", "1");
    res.headers.set("X-PDF-ERR-NAME", name);
    res.headers.set("X-PDF-ERR", encodeURIComponent(message).slice(0, 180));

    return res;
  }
}