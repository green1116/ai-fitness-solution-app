/**
 * V60 P2 — CRM activity timeline
 */

import { prisma } from "@/lib/prisma";
import { crmDb } from "../types";

export type TimelineEntry = {
  id: string;
  type: string;
  timestamp: Date;
  meta: Record<string, unknown> | null;
};

export function limitActivitiesPerCustomer<
  T extends { customerId: string },
>(activities: readonly T[], perCustomerLimit: number): Map<string, T[]> {
  const counts = new Map<string, number>();
  const grouped = new Map<string, T[]>();
  for (const activity of activities) {
    const count = counts.get(activity.customerId) ?? 0;
    if (count >= perCustomerLimit) continue;
    counts.set(activity.customerId, count + 1);
    const bucket = grouped.get(activity.customerId) ?? [];
    bucket.push(activity);
    grouped.set(activity.customerId, bucket);
  }
  return grouped;
}

export async function buildCustomerTimeline(customerId: string, take = 50): Promise<TimelineEntry[]> {
  const activities = await crmDb().cRMActivity.findMany({
    where: { customerId },
    orderBy: { timestamp: "desc" },
    take,
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    timestamp: a.timestamp,
    meta: (a.meta as Record<string, unknown> | null) ?? null,
  }));
}

export async function buildOrganizationTimeline(organizationId: string, take = 100) {
  const customers = await crmDb().customer.findMany({
    where: { organizationId },
    take: 20,
  });
  if (customers.length === 0) return [];

  const perCustomerTake = Math.ceil(take / Math.max(customers.length, 1));
  const customerIds = customers.map((customer) => customer.id);
  const activities = await prisma.cRMActivity.findMany({
    where: { customerId: { in: customerIds } },
    orderBy: { timestamp: "desc" },
  });
  const activitiesByCustomerId = limitActivitiesPerCustomer(
    activities,
    perCustomerTake,
  );

  return customers.map((customer) => ({
    customerId: customer.id,
    customerName: customer.name,
    activities: (activitiesByCustomerId.get(customer.id) ?? []).map((activity) => ({
      id: activity.id,
      type: activity.type,
      timestamp: activity.timestamp,
      meta: (activity.meta as Record<string, unknown> | null) ?? null,
    })),
  }));
}
