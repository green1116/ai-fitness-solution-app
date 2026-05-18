/** UpgradeOrder.status 与支付生命周期（全小写，与 API 对齐） */
export const ORDER_PAYMENT_STATUS = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
  canceled: "canceled",
} as const;

export type OrderPaymentStatus =
  (typeof ORDER_PAYMENT_STATUS)[keyof typeof ORDER_PAYMENT_STATUS];

export function isTerminalOrderStatus(s: string): boolean {
  return s === "paid" || s === "failed" || s === "canceled";
}
