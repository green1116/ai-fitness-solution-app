import { prisma } from "@/lib/prisma";

export async function isOrderPaid(orderId?: string | null) {
  if (!orderId) {
    return { ok: false, reason: "missing_order_id" as const };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { ok: false, reason: "order_not_found" as const };
  }

  const status = String(order.status || "").toLowerCase();
  if (status !== "paid") {
    return { ok: false, reason: "not_paid" as const };
  }

  return {
    ok: true as const,
    order: {
      id: order.id,
      planId: order.planId,
      email: order.email,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  };
}