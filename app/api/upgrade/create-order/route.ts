import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  upgradeAmountForLevel,
  type UpgradeTargetLevel,
} from "../../../../lib/upgradeUnlock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(req: NextRequest) {
  try {
    const prismaAny = prisma as any;
    const body = await req.json().catch(() => ({}));
    const planId = String(body?.planId || "").trim();
    const targetLevelRaw = String(body?.targetLevel || "").toLowerCase();

    if (!planId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_PLAN_ID", message: "缺少 planId" },
        { status: 400, headers: NO_STORE }
      );
    }

    if (targetLevelRaw !== "pro" && targetLevelRaw !== "enterprise") {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_TARGET_LEVEL",
          message: "targetLevel 须为 pro 或 enterprise",
        },
        { status: 400, headers: NO_STORE }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("prisma models:", Object.keys(prisma));
    }

    const targetLevel = targetLevelRaw as UpgradeTargetLevel;
    /** 分；源自 lib/commercial/pricing.ts（元→×100），可由 UPGRADE_*_AMOUNT_CENTS 覆盖 */
    const amount = upgradeAmountForLevel(targetLevel);

    if (!prismaAny.upgradeOrder) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[upgrade/create-order] prisma.upgradeOrder 不可用，当前 Prisma 实例 keys:",
          Object.keys(prisma)
        );
      }
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

    const order = await prismaAny.upgradeOrder.create({
      data: {
        planId,
        targetLevel,
        status: "pending",
        amount,
      },
    });

    const origin = new URL(req.url).origin;
    const mockPayUrl = `${origin}/api/upgrade/mock-checkout?orderId=${encodeURIComponent(order.id)}`;

    return NextResponse.json(
      {
        ok: true,
        orderId: order.id,
        amount: order.amount,
        targetLevel: order.targetLevel,
        mockPayUrl,
        /** 接入 Stripe Checkout / 微信 Native 支付后填入会话 URL */
        checkoutUrl: null as string | null,
      },
      { headers: NO_STORE }
    );
  } catch (e: any) {
    console.error("[upgrade/create-order]", e);
    return NextResponse.json(
      {
        ok: false,
        code: "CREATE_ORDER_FAILED",
        message: "系统繁忙，请稍后重试",
      },
      { status: 500, headers: NO_STORE }
    );
  }
}
