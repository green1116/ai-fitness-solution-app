import { NextResponse } from "next/server";
import { createLicenseKey } from "@/lib/license";

export const runtime = "nodejs";

function mustBeAdmin(req: Request) {
  // 简单粗暴：用一个 Admin Key（先跑通再做后台页面）
  const expected = process.env.ADMIN_API_KEY || "dev_admin_key";
  const got = req.headers.get("x-admin-key") || "";
  return got === expected;
}

export async function POST(req: Request) {
  if (!mustBeAdmin(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const planId = body?.planId ?? null;
  const maxDownloads = Number(body?.maxDownloads ?? 1); // 默认一次性
  const expiresInMinutes = Number(body?.expiresInMinutes ?? 60); // 默认 60 分钟
  const requireLogin = Boolean(body?.requireLogin ?? false);
  const note = body?.note ?? null;

  const expiresAt = expiresInMinutes > 0 ? new Date(Date.now() + expiresInMinutes * 60_000) : null;

  const { licenseId, plainKey } = await createLicenseKey({
    planId,
    maxDownloads,
    expiresAt,
    requireLogin,
    note,
  });

  // 直接把销售链接也组装好
  const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
  const base = origin.startsWith("http") ? origin : `http://${origin}`;
  const url = new URL("/api/pdf", base);
  if (planId) url.searchParams.set("planId", planId);
  url.searchParams.set("mode", "full");
  url.searchParams.set("licenseKey", plainKey);

  return NextResponse.json({
    ok: true,
    licenseId,
    plainKey, // 只在创建时返回一次
    downloadUrl: url.toString(),
  });
}

