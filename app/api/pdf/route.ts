// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderPdf } from "../../../lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 统一 JSON 错误返回
 */
function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

/**
 * base64url -> JSON
 * 允许 cfg 传 base64url(JSON-string)：
 *   cfg=eyJtb2R1bGVPcmRlciI6WyJoZWFkZXIiLCJvdmVyYWxsIl19  (示例)
 */
function decodeCfgBase64Url(cfgB64Url: string) {
  const b64 = cfgB64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = Buffer.from(b64 + pad, "base64").toString("utf8");
  return JSON.parse(raw);
}

/**
 * 兼容两种 cfg：
 * 1) base64url(JSON)
 * 2) 直接 URI 编码的 JSON（少量人会这么传）
 */
function parseCfg(cfgParam: string) {
  if (!cfgParam) return undefined;

  // 简单防御：cfg 太大直接拒绝（避免 URL 里塞超大 JSON）
  if (cfgParam.length > 20_000) {
    throw Object.assign(new Error("cfg too large"), { code: "CFG_TOO_LARGE" });
  }

  // 优先按 base64url 解（你现在就是这种）
  try {
    return decodeCfgBase64Url(cfgParam);
  } catch {
    // 再尝试按 URI JSON 解
    try {
      const raw = decodeURIComponent(cfgParam);
      return JSON.parse(raw);
    } catch (e) {
      throw Object.assign(new Error("Invalid cfg"), { code: "CFG_INVALID" });
    }
  }
}

/**
 * 仅用于日志：把对象 keys 打出来，避免把完整 JSON/敏感信息打到日志里
 */
function safeTopKeys(obj: any) {
  if (!obj || typeof obj !== "object") return [];
  try {
    return Object.keys(obj);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    // 可选：允许前端传 mode（不传默认 full）
    const modeParam = (searchParams.get("mode") || "full").trim();
    const mode = modeParam === "preview" ? "preview" : "full";

    // cfg（模块顺序等）
    const cfgParam = (searchParams.get("cfg") || "").trim();
    const cfg = cfgParam ? parseCfg(cfgParam) : undefined;

    // ---- 关键诊断日志：只打必要信息，不打 token，不打整段 JSON ----
    const moduleOrder =
      cfg && typeof cfg === "object"
        ? (cfg.moduleOrder || cfg.modules || cfg.order || null)
        : null;

    console.log("[pdf] planId=", planId, "mode=", mode);
    console.log("[pdf] hasCfg=", !!cfgParam, "cfgLen=", cfgParam.length);
    console.log("[pdf] moduleOrder=", moduleOrder);
    // 下面这行用于确认你 render 里有没有把 plan 读成“正确结构”
    // 注意：renderPdf 内部如果能暴露 plan 的顶层 keys 更好；这里先给 route 一些标记
    console.log("[pdf] route=", "app/api/pdf/route.ts", "elapsed(ms)=", Date.now() - startedAt);

    // ---- 调用渲染 ----
    const bytes = await renderPdf(planId, { mode, cfg });

    const buf = Buffer.from(bytes);

    // filename 做一下保守处理，避免 planId 里出现奇怪字符
    const safePlanId = planId.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plan_${safePlanId}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "Content-Length": String(buf.length),

        // 方便你一眼确认：是否走了“默认 cfg”
        "X-USED-DEFAULTS": cfg ? "0" : "1",
      },
    });
  } catch (e: any) {
    const code =
      e?.code ||
      (typeof e?.message === "string" && e.message.includes("cfg")
        ? "CFG_INVALID"
        : "PDF_INTERNAL_ERROR");

    // 生产环境建议不要把 stack 直接返回给前端；这里先按你调试期保留
    return json(500, code, e?.message || String(e), {
      name: e?.name,
      stack: e?.stack,
    });
  }
}
