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

function isWechatPaymentProviderEnv(): boolean {
  return (process.env.PAYMENT_PROVIDER || "").trim().toLowerCase() === "wechat";
}

function json(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status });
}

function wechatFailStatus(message: string): number {
  if (
    message.includes("SIGNATURE_INVALID") ||
    message.includes("HEADERS_OR_BODY_MISSING") ||
    message.includes("SERIAL_MISSING")
  ) {
    return 401;
  }
  if (message.includes("NOT_CONFIGURED")) return 503;
  return 400;
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

  const entitlement =
    ensured.planLevel && ensured.planId
      ? snapshotFromPlanLevel(ensured.planLevel, ensured.planId)
      : null;

  console.log("[webhook] writing entitlement raw", entitlement);

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

async function handleWechatNotify(req: Request): Promise<NextResponse> {
  // Exact raw body — do not parse/re-stringify before signature verification.
  const rawBody = await req.text();
  const timestamp = req.headers.get("wechatpay-timestamp") || "";
  const nonce = req.headers.get("wechatpay-nonce") || "";
  const serial = req.headers.get("wechatpay-serial") || "";
  const signature = req.headers.get("wechatpay-signature") || "";

  console.info("[pay] wechat webhook received", {
    hasBody: Boolean(rawBody),
    hasTimestamp: Boolean(timestamp),
    hasNonce: Boolean(nonce),
    hasSerial: Boolean(serial),
    hasSignature: Boolean(signature),
  });

  const provider = getPaymentProvider();
  const event = await provider.handleWebhook({
    rawBody,
    timestamp,
    nonce,
    serial,
    signature,
  });

  if (event.kind === "payment_failed" || event.kind === "payment_canceled") {
    const targetStatus = event.kind === "payment_failed" ? "failed" : "canceled";
    await prisma.upgradeOrder.updateMany({
      where: { id: event.orderId, status: "pending" },
      data: { status: targetStatus },
    });
    return json(200, { ok: true, orderId: event.orderId, paymentStatus: targetStatus });
  }

  const confirmed = await provider.confirmPaid(event.orderId);
  if (!confirmed.ok) {
    // Fail closed — never invent paid/license for invalid/partial WeChat notify.
    return json(400, {
      ok: false,
      code: "WECHAT_CONFIRM_FAILED",
      ...(confirmed.payload || {}),
    });
  }

  const { ensured } = await writeEntitlementAndLog({
    orderId: event.orderId,
    source: "wechat-confirm-ok",
    fallbackPlanId: null,
    fallbackTargetLevel: "pro",
  });

  const issuedPlainKey =
    (confirmed.ok && confirmed.licenseKey ? confirmed.licenseKey : null) ||
    ensured.licenseKeyPlain ||
    null;

  console.info("[pay] wechat webhook ok", { orderId: event.orderId });

  const finalPayload: Record<string, unknown> = { ...confirmed.payload };
  if (issuedPlainKey && !finalPayload.licenseKey) {
    finalPayload.licenseKey = issuedPlainKey;
  }

  return json(200, {
    ...finalPayload,
    status: "paid",
    orderId: event.orderId,
  });
}

export async function POST(req: Request) {
  if (isWechatPaymentProviderEnv()) {
    try {
      return await handleWechatNotify(req);
    } catch (e) {
      const message = e instanceof Error ? e.message : "WECHAT_WEBHOOK_ERROR";
      console.error("[/api/pay/webhook] wechat", {
        code: message.split(":")[0] || "WECHAT_WEBHOOK_ERROR",
      });
      return json(wechatFailStatus(message), {
        ok: false,
        code: message.split(":")[0] || "WECHAT_WEBHOOK_ERROR",
        message,
      });
    }
  }

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

    const { ensured } = await writeEntitlementAndLog({
      orderId: event.orderId,
      source: confirmed.ok ? "confirm-ok" : "confirm-fallback",
      fallbackPlanId: webhookHints.fallbackPlanId ?? null,
      fallbackTargetLevel: webhookHints.fallbackTargetLevel ?? null,
    });

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
