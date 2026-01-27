// app/api/download-token/route.ts
import { NextResponse } from "next/server";
import { createDownloadToken } from "@/lib/downloadToken";
import { requireEmailFromSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  // ✅ 门禁：必须先通过邮箱验证码（有 session）
  const email = await requireEmailFromSession();
  if (!email) {
    return NextResponse.json({ error: "login_required", msg: "需要登录后才能生成下载链接" }, { status: 401 });
  }

  try {
    const token = createDownloadToken(planId);
    return NextResponse.json({ token, planId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "create token failed" },
      { status: 500 }
    );
  }
}
