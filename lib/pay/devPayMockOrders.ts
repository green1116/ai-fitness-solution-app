/**
 * 开发态：无 DB 或订单未落库时，用内存保存 create-order 的元数据，
 * 供 start-payment / webhook 串联 mock 支付流（单机进程内有效）。
 */
export type DevPayPendingOrder = {
  planId: string;
  targetLevel: "pro" | "enterprise";
  amount: number;
  projectId: string;
};

const pendingByOrderId = new Map<string, DevPayPendingOrder>();

export function devPayRegisterPending(orderId: string, row: DevPayPendingOrder) {
  pendingByOrderId.set(orderId, row);
}

export function devPayGetPending(orderId: string): DevPayPendingOrder | null {
  return pendingByOrderId.get(orderId) ?? null;
}

export function devPayIsLikelyMockOrderId(orderId: string) {
  return orderId.startsWith("order_");
}
