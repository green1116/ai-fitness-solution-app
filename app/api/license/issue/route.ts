import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/pay/fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyWebhookSecret(req: Request): boolean {
  const secret = req.headers.get("x-webhook-secret") || "";
  const expected = process.env.PAY_WEBHOOK_SECRET || "";
  return Boolean(expected && expected.length >= 16 && secret === expected);
}

/**
 * POST /api/license/issue
 * 与 webhook 相同的履约入口（用于人工补发 / 重试）；生产环境需 x-webhook-secret。
 */
export async function POST(req: Request) {
  try {
    if (!verifyWebhookSecret(req)) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED", message: "未授权" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_ORDER_ID", message: "缺少 orderId" },
        { status: 400 },
      );
    }

    const result = await fulfillPaidOrder(orderId);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      order: result.order,
      license: result.license,
      licenseKey: result.licenseKeyPlain,
      note: result.note,
    });
  } catch (e) {
    console.error("[/api/license/issue]", e);
    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: "发证失败" },
      { status: 500 },
    );
  }
}
