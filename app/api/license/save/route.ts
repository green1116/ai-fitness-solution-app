import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/license/save
 * 占位：License 明文仅存浏览器 localStorage，服务端不落库。
 * 开发态可用于连通性检测；生产返回说明。
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const licenseKey = typeof body?.licenseKey === "string" ? body.licenseKey.trim() : "";

  if (!licenseKey) {
    return NextResponse.json(
      { ok: false, message: "缺少 licenseKey" },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      ok: true,
      hint: "请在页面「保存 license」使用客户端持久化；此接口不落库。",
    });
  }

  return NextResponse.json({
    ok: true,
    hint: "开发态探测成功；仍请使用页面「保存 license」写入 localStorage。",
  });
}
