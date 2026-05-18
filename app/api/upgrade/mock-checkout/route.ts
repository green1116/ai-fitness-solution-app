import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * mockPayUrl 占位：浏览器打开可查看订单号；实际支付完成后应由收银台回调再履约。
 * 开发阶段主流程在客户端直接 POST /api/upgrade/confirm。
 */
export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get("orderId") || "";
  return NextResponse.json(
    {
      ok: true,
      orderId: orderId || null,
      hint: "开发环境可在升级弹窗内完成模拟支付；生产环境将跳转 Stripe / 微信收银台",
      confirmEndpoint: "POST /api/upgrade/confirm",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
