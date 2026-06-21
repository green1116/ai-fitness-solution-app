/**
 * V59 SaaS — Usage tracking
 */

import { saasDb, type UsageType } from "@/lib/saas/types";

export async function trackUsage(input: {
  organizationId: string;
  type: UsageType;
  count?: number;
}) {
  return saasDb().usageRecord.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      count: input.count ?? 1,
    },
  });
}

export type { UsageType };
