/**
 * Authoritative WeChat paid-order reconciliation when notify_url was missed.
 * Query by out_trade_no → safety checks → existing confirmPaid/fulfillPaidOrder.
 * Never log secrets / API keys / private keys.
 */
import { prisma } from "@/lib/prisma";
import {
  loadWechatNativeConfig,
  queryWechatTransactionByOutTradeNo,
} from "@/lib/payments/wechatNativeClient";
import { wechatPaymentProvider } from "@/lib/payments/wechatProvider";

const PROVIDER = "wechat";
const EXPECTED_CURRENCY = "CNY";

export type WechatReconcileResult = {
  ok: boolean;
  orderId: string;
  tradeState?: string;
  transactionId?: string | null;
  fulfilled?: boolean;
  note?: string;
  code?: string;
  message?: string;
};

/**
 * Fail-closed: only fulfill after WeChat query proves SUCCESS + amount/mchid match.
 */
export async function reconcileWechatPaidOrder(
  orderId: string,
): Promise<WechatReconcileResult> {
  const id = orderId.trim();
  if (!id) {
    return {
      ok: false,
      orderId: "",
      code: "MISSING_ORDER_ID",
      message: "orderId is required",
    };
  }

  const order = await prisma.upgradeOrder.findUnique({
    where: { id },
  });
  if (!order) {
    return {
      ok: false,
      orderId: id,
      code: "ORDER_NOT_FOUND",
      message: "UpgradeOrder not found",
    };
  }

  const paymentProvider = String(order.paymentProvider ?? "")
    .trim()
    .toLowerCase();
  if (paymentProvider !== PROVIDER) {
    return {
      ok: false,
      orderId: id,
      code: "ORDER_PROVIDER_MISMATCH",
      message: `expected wechat, got ${paymentProvider || "empty"}`,
    };
  }

  const config = loadWechatNativeConfig();
  let tx;
  try {
    tx = await queryWechatTransactionByOutTradeNo(id);
  } catch (e) {
    return {
      ok: false,
      orderId: id,
      code: "WECHAT_QUERY_FAILED",
      message: e instanceof Error ? e.message : "WeChat query failed",
    };
  }

  if (tx.tradeState !== "SUCCESS") {
    return {
      ok: false,
      orderId: id,
      tradeState: tx.tradeState,
      transactionId: tx.transactionId,
      code: "TRADE_STATE_NOT_SUCCESS",
      message: `trade_state=${tx.tradeState}`,
    };
  }

  if (tx.outTradeNo !== id) {
    return {
      ok: false,
      orderId: id,
      code: "OUT_TRADE_NO_MISMATCH",
      message: "WeChat out_trade_no does not match UpgradeOrder.id",
    };
  }

  if (tx.mchid !== config.mchId) {
    return {
      ok: false,
      orderId: id,
      code: "MCHID_MISMATCH",
      message: "WeChat mchid does not match configured merchant",
    };
  }

  if (tx.amountTotal !== order.amount) {
    return {
      ok: false,
      orderId: id,
      code: "AMOUNT_MISMATCH",
      message: "WeChat amount.total does not match persisted order amount",
    };
  }

  if (tx.currency && tx.currency.toUpperCase() !== EXPECTED_CURRENCY) {
    return {
      ok: false,
      orderId: id,
      code: "CURRENCY_MISMATCH",
      message: `expected ${EXPECTED_CURRENCY}, got ${tx.currency}`,
    };
  }

  const existingTxn = order.providerOrderId?.trim() || "";
  if (existingTxn && existingTxn !== tx.transactionId) {
    return {
      ok: false,
      orderId: id,
      code: "TRANSACTION_ID_CONFLICT",
      message: "persisted providerOrderId conflicts with WeChat transaction_id",
    };
  }

  if (!existingTxn) {
    await prisma.upgradeOrder.update({
      where: { id: order.id },
      data: { providerOrderId: tx.transactionId },
    });
  }

  const confirmed = await wechatPaymentProvider.confirmPaid(id);
  if (!confirmed.ok) {
    return {
      ok: false,
      orderId: id,
      tradeState: tx.tradeState,
      transactionId: tx.transactionId,
      fulfilled: false,
      code: "CONFIRM_PAID_FAILED",
      message: "confirmPaid/fulfillPaidOrder did not succeed",
    };
  }

  console.info("[wechat-reconcile] ok", {
    orderId: id,
    tradeState: tx.tradeState,
    hasTransactionId: Boolean(tx.transactionId),
  });

  return {
    ok: true,
    orderId: id,
    tradeState: tx.tradeState,
    transactionId: tx.transactionId,
    fulfilled: true,
    note:
      typeof confirmed.payload?.note === "string"
        ? confirmed.payload.note
        : "reconciled via WeChat query + confirmPaid",
  };
}
