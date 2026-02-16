// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function getClientIp(req: Request) {
  const h = (name: string) => req.headers.get(name) || "";
  const xff = h("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h("x-real-ip") || "";
}

function decodeCfgBase64Url(cfgB64Url: string) {
  const b64 = cfgB64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = Buffer.from(b64 + pad, "base64").toString("utf8");
  return JSON.parse(raw);
}

function parseCfg(cfgParam: string) {
  if (!cfgParam) return undefined;
  if (cfgParam.length > 20_000) {
    throw Object.assign(new Error("cfg too large"), { code: "CFG_TOO_LARGE" });
  }
  try {
    return decodeCfgBase64Url(cfgParam);
  } catch {
    try {
      const raw = decodeURIComponent(cfgParam);
      return JSON.parse(raw);
    } catch {
      throw Object.assign(new Error("Invalid cfg"), { code: "CFG_INVALID" });
    }
  }
}

async function consumeLicenseOrThrow(
  req: Request,
  opts: { planId: string; mode: string; licenseKey: string }
) {
  const { planId, mode, licenseKey } = opts;

  const pepper =
    process.env.LICENSE_KEY_SECRET || process.env.DOWNLOAD_TOKEN_SECRET || "";

  const keyHash = sha256Hex(`license:${licenseKey}:${pepper}`);
  const lic = await prisma.licenseKey.findUnique({ where: { keyHash } });

  if (!lic) return { ok: false as const, code: "LICENSE_NOT_FOUND", message: "LicenseKey 无效" };
  if (lic.planId && lic.planId !== planId) {
    return { ok: false as const, code: "LICENSE_PLAN_MISMATCH", message: "LicenseKey 与 planId 不匹配" };
  }
  if (lic.expiresAt && lic.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, code: "LICENSE_EXPIRED", message: "LicenseKey 已过期" };
  }
  if (lic.maxDownloads > 0 && lic.usedCount >= lic.maxDownloads) {
    return { ok: false as const, code: "LICENSE_EXHAUSTED", message: "LicenseKey 次数已用尽" };
  }

  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";
  const fingerprint = sha256Hex(`fp:${planId}:${mode}:${ip}:${ua}`);

  const res = await prisma.$transaction(async (tx) => {
    try {
      await tx.licenseConsume.create({
        data: { licenseId: lic.id, planId, fingerprint },
      });

      const updated = await tx.licenseKey.update({
        where: { id: lic.id },
        data: { usedCount: { increment: 1 } },
        select: { usedCount: true, maxDownloads: true },
      });

      if (lic.maxDownloads > 0 && updated.usedCount > updated.maxDownloads) {
        await tx.licenseKey.update({
          where: { id: lic.id },
          data: { usedCount: { decrement: 1 } },
        });
        return { ok: false as const, code: "LICENSE_EXHAUSTED", message: "LicenseKey 次数已用尽" };
      }

      return { ok: true as const, reused: false as const };
    } catch (e: any) {
      if (e?.code === "P2002") {
        return { ok: true as const, reused: true as const };
      }
      throw e;
    }
  });

  return res;
}

export async function GET(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const mode = (searchParams.get("mode") || "full").trim();
    const allowedModes = new Set(["full", "preview", "budget"]);
    if (!allowedModes.has(mode)) {
      return json(400, "INVALID_MODE", `Invalid mode: ${mode}. Allowed: full|preview|budget`);
    }

    const cfgParam = (searchParams.get("cfg") || "").trim();
    const cfg = cfgParam ? parseCfg(cfgParam) : undefined;

    // ✅ tz：由前端传 Intl.DateTimeFormat().resolvedOptions().timeZone
    // 例如 Asia/Shanghai / Asia/Tokyo
    const tz = (searchParams.get("tz") || "").trim();

    const licenseKey = (searchParams.get("licenseKey") || "").trim();
    if (licenseKey) {
      const check = await consumeLicenseOrThrow(req, { planId, mode, licenseKey });
      if (!check.ok) {
        try {
          await prisma.pdfDownloadLog.create({
            data: {
              planId,
              mode,
              ip: getClientIp(req),
              ok: false,
              reason: check.code,
              error: check.message,
              userAgent: req.headers.get("user-agent") || "",
            },
          });
        } catch {}
        return NextResponse.json(
          { ok: false, code: check.code, message: check.message },
          { status: 403 }
        );
      }
    }

    const moduleOrder =
      cfg && typeof cfg === "object"
        ? (cfg as any).moduleOrder || (cfg as any).modules || (cfg as any).order || null
        : null;

    console.log("[pdf] planId=", planId, "mode=", mode, "tz=", tz || "(none)");
    console.log("[pdf] hasCfg=", !!cfgParam, "cfgLen=", cfgParam.length);
    console.log("[pdf] moduleOrder=", moduleOrder);

    // ✅ 把 tz 下传给渲染器
    const bytes = await renderPdf(planId, { mode: mode as any, cfg: { ...(cfg || {}), tz } });
    const buf = Buffer.from(bytes);

    try {
      await prisma.pdfDownloadLog.create({
        data: {
          planId,
          mode,
          ip: getClientIp(req),
          ok: true,
          reason: licenseKey ? "LICENSE_OK" : "NO_LICENSE",
          userAgent: req.headers.get("user-agent") || "",
        },
      });
    } catch {}

    const safePlanId = planId.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename =
      mode === "budget" ? `budget_${safePlanId}.pdf` : `plan_${safePlanId}.pdf`;

    console.log("[pdf] elapsed(ms)=", Date.now() - startedAt);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "Content-Length": String(buf.length),
        "X-USED-DEFAULTS": cfg ? "0" : "1",
      },
    });
  } catch (e: any) {
    const code =
      e?.code ||
      (typeof e?.message === "string" && e.message.includes("cfg")
        ? "CFG_INVALID"
        : "PDF_INTERNAL_ERROR");

    try {
      const { searchParams } = new URL(req.url);
      const planId = (searchParams.get("planId") || "").trim() || "unknown";
      const mode = (searchParams.get("mode") || "full").trim();
      await prisma.pdfDownloadLog.create({
        data: {
          planId,
          mode,
          ip: getClientIp(req),
          ok: false,
          reason: code,
          error: e?.message || String(e),
          userAgent: req.headers.get("user-agent") || "",
        },
      });
    } catch {}

    return json(500, code, e?.message || String(e), {
      name: e?.name,
      stack: e?.stack,
    });
  }
}
