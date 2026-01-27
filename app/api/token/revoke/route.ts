import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/auth-server";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length > 0 && !allow.includes(email.toLowerCase())) {
    return NextResponse.json({ ok: false, message: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const token = String(body?.token || "").trim();
  const planId = body?.planId ? String(body.planId).trim() : null;
  const reason = body?.reason ? String(body.reason).trim() : "manual_revoke";

  if (!token) {
    return NextResponse.json({ ok: false, message: "missing token" }, { status: 400 });
  }

  const tokenHash = sha256Hex(token);

  await prisma.pdfDownloadTokenDeny.upsert({
    where: { tokenHash },
    update: { planId, reason },
    create: { tokenHash, planId, reason },
  });

  return NextResponse.json({ ok: true });
}

