// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BUDGET_ENGINE_FP, BUDGET_PDF_VERSION } from "@/lib/pdf/budgetRender";
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

/** 生成稳定短签名：参数同样 => 签名同样（用于验真/缓存指纹） */
async function shortSigHex(payload: string) {
  // Node 18+ 有 globalThis.crypto.subtle
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12); // 12 hex chars：够用且短
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

    // debug：prod 必须显式 debug=1；dev 默认更可见
    const debugFlag = safeStr(searchParams.get("debug")) === "1";
    const debug = debugFlag || process.env.NODE_ENV !== "production";

    // ---------------- budget ----------------
    if (mode === "budget") {
      const companyName = safeStr(searchParams.get("companyName"), "示例企业");
      const companySizeRaw = safeStr(searchParams.get("companySize"), "0");
      const companySize = Number(companySizeRaw || "0") || 0;

      const budgetTier = pick(
        searchParams.get("budgetTier"),
        ["low", "mid", "high"] as const,
        "mid"
      );

      const pdfVersionBudget = safeStr(
        searchParams.get("pdfVersionBudget"),
        "BR_DEFAULT"
      );

      const sigPayload = JSON.stringify({
        planId,
        mode: "budget",
        companyName,
        companySize,
        budgetTier,
        pdfVersionBudget,
      });
      const reqSig = await shortSigHex(sigPayload);

      const format = safeStr(searchParams.get("format")).toLowerCase();

      const budgetInput = { planId, companyName, companySize, budgetTier };

      const out: any = await renderPdf(planId, {
        mode: "budget",
        budgetInput,
        budgetOpts: {
          pdfVersion: pdfVersionBudget,
          debug,
          reqSig,
        },
      });

      // ✅ 兼容：旧实现返回 Uint8Array；新实现返回 { pdfBytes, meta, summary }
      let pdfBytes: Uint8Array | null = null;
      let meta: any = null;
      let summary: any = null;

      if (out && typeof out === "object") {
        if (out.pdfBytes) pdfBytes = out.pdfBytes as Uint8Array;
        meta = out.meta || null;
        summary = out.summary || meta?.summary || null;
      } else {
        pdfBytes = out as Uint8Array;
      }

      // 如果要求 JSON/summary，则直接返回 JSON（不走 PDF）
      if (format === "json" || format === "summary") {
        const summaryTier =
          summary?.tier || meta?.summary?.tier || budgetTier;

        const body =
          format === "summary"
            ? {
                ok: true,
                mode: "budget",
                planId,
                input: { companyName, companySize, budgetTier },
                summaryTier,
                summary: summary || meta?.summary || null,
                meta: meta || null,
              }
            : {
                ok: true,
                mode: "budget",
                planId,
                input: {
                  companyName,
                  companySize,
                  budgetTier,
                  pdfVersionBudget,
                  debug,
                },
                engine: {
                  fp: meta?.engineFp || BUDGET_ENGINE_FP || "UNKNOWN_FP",
                  version:
                    meta?.engineVersion ||
                    BUDGET_PDF_VERSION ||
                    "UNKNOWN_VER",
                  impl: meta?.impl || "budgetRender.ts",
                },
                reqSig,
                summaryTier,
                summary: summary || meta?.summary || null,
                meta: meta || null,
              };

        return NextResponse.json(body, { status: 200 });
      }

      if (!pdfBytes || typeof (pdfBytes as any).length !== "number") {
        return json(500, "BUDGET_RENDER_BAD_RETURN", "budget renderer returned invalid bytes", {
          outType: typeof out,
          outKeys: out && typeof out === "object" ? Object.keys(out).slice(0, 30) : null,
        });
      }

      const buf = Buffer.from(pdfBytes);
      const res = new NextResponse(buf, { status: 200 });

      res.headers.set("content-type", "application/pdf");
      res.headers.set(
        "content-disposition",
        `attachment; filename="budget-${planId}-${budgetTier}-size${companySize}.pdf"`
      );
      res.headers.set("cache-control", "no-store, max-age=0");

      // ---- always-on diagnostics (安全、短) ----
      const fp = meta?.engineFp || BUDGET_ENGINE_FP || "UNKNOWN_FP";
      const ver = meta?.engineVersion || BUDGET_PDF_VERSION || "UNKNOWN_VER";

      res.headers.set("x-budget-impl", meta?.impl || "budgetRender.ts");
      res.headers.set("x-budget-engine-fp", fp);
      res.headers.set("x-budget-engine-version", ver);

      res.headers.set("x-budget-tier-input", budgetTier);
      if (meta?.summaryTier) res.headers.set("x-budget-tier-summary", String(meta.summaryTier));
      else if (meta?.summary?.tier) res.headers.set("x-budget-tier-summary", String(meta.summary.tier));
      else res.headers.set("x-budget-tier-summary", budgetTier);

      res.headers.set("x-budget-company-size", String(companySize));
      res.headers.set("x-pdf-version", pdfVersionBudget);
      res.headers.set("x-budget-req-sig", reqSig);
      res.headers.set("x-budget-url-mode", "api/pdf");

      // ---- summary headers: status 常驻；err/trunc/warn 仅 debug ----
      if (meta?.summaryStatus) res.headers.set("x-budget-summary-status", meta.summaryStatus);

      if (debug) {
        if (meta?.summaryErr) res.headers.set("x-budget-summary-err", encodeHeaderValue(meta.summaryErr));
        if (meta?.summaryWarn) res.headers.set("x-budget-summary-warn", encodeHeaderValue(meta.summaryWarn));
        if (meta?.summaryTrunc) res.headers.set("x-budget-summary-trunc", meta.summaryTrunc);
      }

      if (debug) {
        console.log(">>> [BUDGET_RENDER] ACTIVE", {
          fp,
          ver,
          planId,
          budgetTier,
          companySize,
          pdfVersionBudget,
          reqSig,
        });
      }

      return res;
    }

    // ---------------- plan (preview/full) ----------------
    const planResult = await renderPdf(planId, { mode });
    const bytes =
      typeof planResult === "object" && planResult !== null && "pdfBytes" in planResult
        ? planResult.pdfBytes
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
  } catch (e: any) {
    return json(500, "PDF_INTERNAL_ERROR", safeStr(e?.message || e), {
      name: e?.name,
      stack: e?.stack,
    });
  }
}