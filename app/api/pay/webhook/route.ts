import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/pay/fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, payload: any) {
  return NextResponse.json(payload, { status });
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-webhook-secret") || "";
    const expected = process.env.PAY_WEBHOOK_SECRET || "";

    if (!expected || expected.length < 16) {
      return json(500, { ok: false, code: "MISSING_WEBHOOK_SECRET", message: "服务端未配置 PAY_WEBHOOK_SECRET" });
    }
    if (secret !== expected) {
      return json(401, { ok: false, code: "WEBHOOK_UNAUTHORIZED", message: "webhook secret 无效" });
    }

    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();
    const event = String(body?.event || "payment_succeeded").trim();

    if (!orderId) return json(400, { ok: false, code: "MISSING_ORDER_ID", message: "缺少 orderId" });
    if (event !== "payment_succeeded") return json(400, { ok: false, code: "UNSUPPORTED_EVENT", message: "不支持的 event" });

    const result = await fulfillPaidOrder(orderId);
    if (!result.ok) return json(400, result);

    return json(200, {
      ok: true,
      order: result.order,
      license: result.license,
      licenseKey: result.licenseKeyPlain,
      note: result.note,
    });
  } catch (err: any) {
    console.error("[/api/pay/webhook] error:", err);
    const dev = process.env.NODE_ENV !== "production";
    return json(500, {
      ok: false,
      code: "WEBHOOK_INTERNAL_ERROR",
      message: "服务器错误",
      ...(dev
        ? { extra: { name: err?.name ?? null, message: err?.message ?? null, code: err?.code ?? null, meta: err?.meta ?? null, stack: String(err?.stack || "") } }
        : {}),
    });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/pay/webhook" }, { status: 200 });
}
