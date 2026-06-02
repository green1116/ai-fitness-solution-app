import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  getPlanEntitlementSnapshot,
  snapshotFromPlanLevel,
} from "@/lib/entitlements/planEntitlement";
import { ensureEntitlementForOrder } from "@/lib/pay/ensureEntitlementForOrder";
import type { PayConfirmPaidHints } from "@/lib/payments/types";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isDev = () => process.env.NODE_ENV !== "production";

function json(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status });
}

/** 从 webhook JSON 提取与 create-order 一致的 planId / targetLevel，供履约与 DB 纠正 */
function parseWebhookPayHints(body: Record<string, unknown>): PayConfirmPaidHints {
  const rawPlan = String(body?.planId ?? "").trim();
  const tierRaw = String(body?.targetLevel ?? body?.tier ?? "")
    .trim()
    .toLowerCase();
  let fallbackTargetLevel: "pro" | "enterprise" | null = null;
  if (tierRaw === "enterprise") fallbackTargetLevel = "enterprise";
  else if (tierRaw === "pro") fallbackTargetLevel = "pro";
  return {
    fallbackPlanId: rawPlan || null,
    fallbackTargetLevel,
  };
}

async function writeEntitlementAndLog(opts: {
  orderId: string;
  source: string;
  fallbackPlanId?: string | null;
  fallbackTargetLevel?: "pro" | "enterprise" | null;
}) {
  let sessionUserId: string | null = null;
  try {
    const sessionUser = await getCurrentUser();
    sessionUserId = sessionUser?.id ?? null;
  } catch (e) {
    console.warn("[webhook] getCurrentUser threw", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  const ensured = await ensureEntitlementForOrder({
    orderId: opts.orderId,
    sessionUserId,
    fallbackPlanId: opts.fallbackPlanId ?? null,
    fallbackTargetLevel: opts.fallbackTargetLevel ?? null,
  });

  /** 写入侧：来自 ensureEntitlementForOrder 的结果（含 binding） */
  const entitlement =
    ensured.planLevel && ensured.planId
      ? snapshotFromPlanLevel(ensured.planLevel, ensured.planId)
      : null;

  /** ★ 对账日志 1/4：webhook 最终写入的 entitlement 原始对象 */
  console.log("[webhook] writing entitlement raw", entitlement);

  /** ★ DEBUG 2/5：webhook 即将写入的 entitlement 完整 JSON */
  console.log(
    "[DEBUG][WEBHOOK][WRITE]",
    JSON.stringify(
      {
        planId: ensured.planId,
        entitlementToWrite: entitlement,
      },
      null,
      2,
    ),
  );

  console.log("[webhook] write entitlement", {
    orderId: opts.orderId,
    source: opts.source,
    sessionUserId,
    tier: ensured.planLevel,
    planId: ensured.planId,
    licenseId: ensured.licenseId,
    binding: ensured.binding,
    ensuredOk: ensured.ok,
    ensuredReason: ensured.reason,
    entitlement,
  });

  /** 读取侧：从 DB 实读派生（路由实际会读到的 entitlement） */
  let postBindEntitlement: Record<string, unknown> | null = null;
  if (sessionUserId && ensured.planId) {
    try {
      const actualEntitlement = await getPlanEntitlementSnapshot(
        sessionUserId,
        ensured.planId,
      );
      postBindEntitlement = actualEntitlement as unknown as Record<string, unknown>;
      console.log("[webhook] entitlement updated", {
        orderId: opts.orderId,
        planId: ensured.planId,
        userId: sessionUserId,
        entitlement: actualEntitlement,
      });
    } catch (e) {
      console.warn("[webhook] post-bind entitlement read threw", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  } else {
    console.log("[webhook] entitlement updated", {
      orderId: opts.orderId,
      note: "session not authenticated, no LicenseBinding written; entitlement remains free",
      sessionUserId,
      planId: ensured.planId,
    });
  }

  /** ★ 对账日志 5/5：webhook 这一段能看到的全链路字段汇总 */
  console.log("[entitlement-debug]", {
    stage: "webhook",
    planId: ensured.planId,
    sessionUserId,
    webhookWritten: entitlement,
    apiReturned: undefined,
    routeRead: postBindEntitlement ?? entitlement ?? null,
    budgetAllowed: Boolean(
      (postBindEntitlement?.budgetEnabled ?? entitlement?.budgetEnabled) === true,
    ),
    zipAllowed: Boolean(
      (postBindEntitlement?.zipEnabled ?? entitlement?.zipEnabled) === true,
    ),
  });

  return { ensured, sessionUserId };
}

export async function POST(req: Request) {
  let orderIdForFallback = "";
  let webhookHints: PayConfirmPaidHints = {};
  try {
    if (!isDev()) {
      const secret = req.headers.get("x-webhook-secret") || "";
      const expected = process.env.PAY_WEBHOOK_SECRET || "";
      if (!expected || expected.length < 16) {
        return json(503, {
          ok: false,
          code: "MISSING_WEBHOOK_SECRET",
          message: "服务端未配置 PAY_WEBHOOK_SECRET",
        });
      }
      if (secret !== expected) {
        return json(401, {
          ok: false,
          code: "WEBHOOK_UNAUTHORIZED",
          message: "webhook secret 无效",
        });
      }
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    webhookHints = parseWebhookPayHints(body);
    console.log("[pay] webhook received", body);
    console.info("[DEBUG][WEBHOOK][hints]", webhookHints);

    /** ★ DEBUG 1/5：webhook 入口原始 payload */
    console.log(
      "[DEBUG][WEBHOOK][INPUT]",
      JSON.stringify(
        {
          planId: body?.planId ?? null,
          tier: body?.tier ?? body?.targetLevel ?? null,
          payload: body,
        },
        null,
        2,
      ),
    );

    orderIdForFallback = String(body?.orderId || "").trim();
    const provider = getPaymentProvider();
    const event = await provider.handleWebhook(body);

    if (event.kind === "payment_failed" || event.kind === "payment_canceled") {
      const targetStatus = event.kind === "payment_failed" ? "failed" : "canceled";
      try {
        await prisma.upgradeOrder.updateMany({
          where: { id: event.orderId, status: "pending" },
          data: { status: targetStatus },
        });
      } catch (e) {
        if (!isDev()) throw e;
      }
      console.info("[pay] webhook ok", { orderId: event.orderId, paymentStatus: targetStatus });
      console.log("[pay] webhook processed", {
        ok: true,
        status: targetStatus,
        orderId: event.orderId,
      });
      return json(200, { ok: true, orderId: event.orderId, paymentStatus: targetStatus });
    }

    const confirmed = await provider.confirmPaid(event.orderId, webhookHints);

    /** 不论 confirmPaid 是否走 fallback，统一在 webhook 层强制写入 entitlement */
    const { ensured } = await writeEntitlementAndLog({
      orderId: event.orderId,
      source: confirmed.ok ? "confirm-ok" : "confirm-fallback",
      fallbackPlanId: webhookHints.fallbackPlanId ?? null,
      fallbackTargetLevel: webhookHints.fallbackTargetLevel ?? null,
    });

    /** 优先用 confirmPaid 返回的明文 key（真实路径），其次用 ensureEntitlement 首发的 plain key */
    const issuedPlainKey =
      (confirmed.ok && confirmed.licenseKey ? confirmed.licenseKey : null) ||
      ensured.licenseKeyPlain ||
      null;

    if (!confirmed.ok) {
      if (isDev()) {
        const devLicenseKey =
          issuedPlainKey || "dev_mock_" + crypto.randomBytes(24).toString("base64url");
        const fallbackPayload = {
          ok: true,
          status: "paid",
          orderId: event.orderId,
          licenseKey: devLicenseKey,
          note: ensured.ok
            ? "dev fallback: confirm-paid failed but webhook ensured entitlement"
            : "dev fallback: confirm-paid failed and entitlement not ensured",
        };
        console.log("[pay] webhook processed", fallbackPayload);
        return json(200, fallbackPayload);
      }
      return json(400, confirmed.payload);
    }

    console.info("[pay] webhook ok", { orderId: event.orderId });
    if (issuedPlainKey) {
      console.info("[pay] license issued", { orderId: event.orderId });
    }

    console.log("[pay] webhook processed", {
      ok: true,
      status: "paid",
      orderId: event.orderId,
    });

    /** 把 ensure 出来的 plain key（如有）合并到 payload，前端继续 persist 同一字段 */
    const finalPayload: Record<string, unknown> = { ...confirmed.payload };
    if (issuedPlainKey && !finalPayload.licenseKey) {
      finalPayload.licenseKey = issuedPlainKey;
    }

    return json(200, {
      ...finalPayload,
      status: "paid",
      orderId: event.orderId,
    });
  } catch (e) {
    console.error("[/api/pay/webhook]", e);
    if (isDev()) {
      const orderId = orderIdForFallback || `order_${Date.now()}`;
      /** panic 路径也尝试写入 entitlement，避免前端拿到的 license-key 在 DB 没记录 */
      let issuedPlainKey: string | null = null;
      try {
        const { ensured } = await writeEntitlementAndLog({
          orderId,
          source: "panic-catch",
          fallbackPlanId: webhookHints.fallbackPlanId ?? null,
          fallbackTargetLevel: webhookHints.fallbackTargetLevel ?? null,
        });
        issuedPlainKey = ensured.licenseKeyPlain;
      } catch (inner) {
        console.warn("[webhook] panic ensureEntitlement threw", {
          error: inner instanceof Error ? inner.message : String(inner),
        });
      }

      const devLicenseKey =
        issuedPlainKey || "dev_mock_" + crypto.randomBytes(24).toString("base64url");
      const payload = {
        ok: true,
        status: "paid",
        orderId,
        licenseKey: devLicenseKey,
        note: issuedPlainKey
          ? "dev panic fallback: webhook ensured entitlement"
          : "dev panic fallback: webhook always success",
      };
      console.log("[pay] webhook processed", payload);
      return json(200, payload);
    }
    return json(500, {
      ok: false,
      code: "WEBHOOK_INTERNAL_ERROR",
      message: e instanceof Error ? e.message : "服务器错误",
    });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/pay/webhook" }, { status: 200 });
}
