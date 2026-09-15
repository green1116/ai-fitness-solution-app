/**
 * Recover one WeChat UpgradeOrder when payment succeeded but notify was missed.
 *
 * Dry-run by default (queries WeChat + prints checks; does not fulfill).
 * Pass --confirm to persist transaction_id and run confirmPaid → fulfillPaidOrder.
 *
 * Usage:
 *   npx tsx scripts/reconcile-wechat-order.ts --orderId <UpgradeOrder.id>
 *   npx tsx scripts/reconcile-wechat-order.ts --orderId <UpgradeOrder.id> --confirm
 */
import "dotenv/config";

import { prisma } from "../lib/prisma";
import {
  loadWechatNativeConfig,
  queryWechatTransactionByOutTradeNo,
} from "../lib/payments/wechatNativeClient";
import { reconcileWechatPaidOrder } from "../lib/payments/wechatReconcile";

function usage(): never {
  console.error(
    "Usage: npx tsx scripts/reconcile-wechat-order.ts --orderId <UpgradeOrder.id> [--confirm]",
  );
  process.exit(2);
}

function parseArgs(argv: string[]): { orderId: string; confirm: boolean } {
  let orderId = "";
  let confirm = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--confirm") {
      confirm = true;
      continue;
    }
    if (arg === "--orderId") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) usage();
      orderId = next.trim();
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") usage();
  }

  if (!orderId) usage();
  return { orderId, confirm };
}

async function main() {
  const { orderId, confirm } = parseArgs(process.argv.slice(2));

  const order = await prisma.upgradeOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      amount: true,
      paymentProvider: true,
      providerOrderId: true,
      targetLevel: true,
    },
  });

  if (!order) {
    console.error("[reconcile-wechat] ORDER_NOT_FOUND", { orderId });
    process.exit(1);
  }

  console.info("[reconcile-wechat] local order", {
    orderId: order.id,
    status: order.status,
    amount: order.amount,
    paymentProvider: order.paymentProvider,
    targetLevel: order.targetLevel,
    hasProviderOrderId: Boolean(order.providerOrderId?.trim()),
  });

  const config = loadWechatNativeConfig();
  const tx = await queryWechatTransactionByOutTradeNo(orderId);

  const checks = {
    tradeStateSuccess: tx.tradeState === "SUCCESS",
    outTradeNoMatches: tx.outTradeNo === order.id,
    mchidMatches: tx.mchid === config.mchId,
    amountMatches: tx.amountTotal === order.amount,
    currencyOk: !tx.currency || tx.currency.toUpperCase() === "CNY",
  };

  console.info("[reconcile-wechat] wechat query", {
    tradeState: tx.tradeState,
    amountTotal: tx.amountTotal,
    currency: tx.currency,
    hasTransactionId: Boolean(tx.transactionId),
    checks,
  });

  const allPass = Object.values(checks).every(Boolean);
  if (!allPass) {
    console.error("[reconcile-wechat] FAIL_CLOSED: safety checks did not pass");
    process.exit(1);
  }

  if (!confirm) {
    console.info(
      "[reconcile-wechat] dry-run OK — re-run with --confirm to fulfill",
    );
    process.exit(0);
  }

  const result = await reconcileWechatPaidOrder(orderId);
  if (!result.ok) {
    console.error("[reconcile-wechat] fulfill failed", {
      code: result.code,
      message: result.message,
    });
    process.exit(1);
  }

  console.info("[reconcile-wechat] fulfilled", {
    orderId: result.orderId,
    fulfilled: result.fulfilled,
    note: result.note,
  });
}

main()
  .catch((e) => {
    console.error(
      "[reconcile-wechat] error",
      e instanceof Error ? e.message : String(e),
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
