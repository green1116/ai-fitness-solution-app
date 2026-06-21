/**
 * V60 P2 — CRM activity timeline
 */

import { crmDb } from "../types";

export type TimelineEntry = {
  id: string;
  type: string;
  timestamp: Date;
  meta: Record<string, unknown> | null;
};

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

  const timelines = await Promise.all(
    customers.map(async (c) => ({
      customerId: c.id,
      customerName: c.name,
      activities: await buildCustomerTimeline(c.id, Math.ceil(take / Math.max(customers.length, 1))),
    })),
  );

  return timelines;
}
