import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  issueUnlockTokenForPaidUpgrade,
  type UpgradeTargetLevel,
} from "@/lib/upgradeUnlock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function targetFromOrder(raw: string): UpgradeTargetLevel {
  const v = String(raw || "").toLowerCase();
  if (v === "enterprise") return "enterprise";
  return "pro";
}

export async function POST(req: NextRequest) {
  try {
    const prismaAny = prisma as any;
    const body = await req.json().catch(() => ({}));
    if (process.env.NODE_ENV !== "production") {
      console.log("[confirm] body:", body);
      console.log("[confirm] prisma models:", Object.keys(prisma));
    }

    const orderId = String(body?.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_ORDER_ID", message: "缺少 orderId" },
        { status: 400, headers: NO_STORE }
      );
    }

    if (!prismaAny.upgradeOrder) {
      console.error(
        "[confirm] prisma.upgradeOrder 不可用，keys:",
        Object.keys(prisma)
      );
      return NextResponse.json(
        {
          ok: false,
          code: "PRISMA_CLIENT_OUTDATED",
          message:
            "Prisma Client 未包含 upgradeOrder（请执行 npx prisma generate 并重启 dev 服务器）",
        },
        { status: 503, headers: NO_STORE }
      );
    }

    const order = await prismaAny.upgradeOrder.findUnique({
      where: { id: orderId },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[confirm] order:", order);
    }

    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          code: "ORDER_NOT_FOUND",
          message: `订单不存在: ${orderId}`,
        },
        { status: 404, headers: NO_STORE }
      );
    }

    if (order.status === "pending") {
      await prismaAny.upgradeOrder.update({
        where: { id: orderId },
        data: { status: "paid" },
      });
    } else if (order.status !== "paid") {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_ORDER_STATUS",
          message: `订单状态不可确认: ${order.status}`,
        },
        { status: 400, headers: NO_STORE }
      );
    }

    const targetLevel = targetFromOrder(order.targetLevel);
    const mockEmail =
      String(body?.email || process.env.UPGRADE_CONFIRM_MOCK_EMAIL || "").trim() ||
      undefined;

    let unlockToken: string;
    try {
      unlockToken = await issueUnlockTokenForPaidUpgrade({
        planId: order.planId,
        targetLevel,
        email: mockEmail,
      });
    } catch (err) {
      console.error("[confirm unlockToken error]", err);

      return NextResponse.json(
        {
          ok: false,
          code: "UNLOCK_TOKEN_FAILED",
          message: "系统繁忙，请稍后重试",
        },
        { status: 500, headers: NO_STORE }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        unlockToken,
        /** 与客户端 storeEnterpriseUnlockToken / CommercialPlanLevel 对齐 */
        planLevel: targetLevel,
        orderId: order.id,
        status: "paid",
      },
      { headers: NO_STORE }
    );
  } catch (err: unknown) {
    console.error("[upgrade/confirm]", err);
    return NextResponse.json(
      {
        ok: false,
        code: "CONFIRM_FAILED",
        message: "系统繁忙，请稍后重试",
      },
      { status: 500, headers: NO_STORE }
    );
  }
}