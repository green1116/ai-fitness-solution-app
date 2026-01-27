import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mustBeAdmin(req: Request) {
  const expected = process.env.ADMIN_API_KEY || "dev_admin_key";
  const got = req.headers.get("x-admin-key") || "";
  return got === expected;
}

export async function GET(req: Request) {
  if (!mustBeAdmin(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.pdfDownloadLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    console.error("[pdf/logs] error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

