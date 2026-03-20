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

function escCsv(v: any) {
  const s = (v ?? "").toString();
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  if (!isAdmin(email)) return NextResponse.json({ ok: false, message: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const planId = (url.searchParams.get("planId") || "").trim();
  const targetEmail = (url.searchParams.get("email") || "").trim();
  const reason = (url.searchParams.get("reason") || "").trim();

  const where: any = {};
  if (planId) where.planId = planId;
  if (targetEmail) where.email = targetEmail;
  if (reason) where.reason = reason;

  const rows = await prisma.pdfDownloadLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = ["createdAt", "planId", "mode", "reason", "ok", "email", "licenseId", "ip", "ua"];
  const lines = [header.join(",")];

  for (const r of rows) {
    lines.push([
      escCsv(r.createdAt),
      escCsv(r.planId),
      escCsv(r.mode),
      escCsv(r.reason),
      escCsv(r.ok),
      escCsv(""),
      escCsv(""),
      escCsv(r.ip),
      escCsv(r.ua ?? r.userAgent),
    ].join(","));
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pdf-downloads.csv"`,
    },
  });
}

