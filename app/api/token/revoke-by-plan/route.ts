import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/auth-server";

function isAdmin(email: string) {
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.length === 0 || allow.includes(email.toLowerCase());
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  if (!isAdmin(email)) return NextResponse.json({ ok: false, message: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const planId = String(body?.planId || "").trim();
  const reason = String(body?.reason || "batch_revoke").trim();

  if (!planId) return NextResponse.json({ ok: false, message: "missing planId" }, { status: 400 });

  const r = await (prisma as any).pdfDownloadTokenState.updateMany({
    where: { planId, revoked: false },
    data: { revoked: true },
  });

  // 可选：也写 denylist（不是必须）
  // 这里不写 denylist 是 ok 的，因为 verify 会先查 state.revoked

  return NextResponse.json({ ok: true, revokedCount: r.count, reason });
}

