// lib/order.ts (Prisma 版)
import { prisma } from "@/lib/prisma"; // 你的项目里 prisma client 路径可能不同，按你项目改

export async function isOrderPaid(orderNo?: string | null) {
  if (!orderNo) return { ok: false, reason: "missing_order_no" };

  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) return { ok: false, reason: "order_not_found" };
  if (order.status !== "paid") return { ok: false, reason: "not_paid" };

  return { ok: true };
}

