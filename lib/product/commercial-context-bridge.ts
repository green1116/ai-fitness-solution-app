/**
 * Commercial Context Bridge v1 — read-only CRM → product context adapter.
 *
 * Resolves product commercial IDs from CRM product activities for a customer.
 * Does not mutate session storage or Runtime Ops surfaces.
 */

import type { ProductCommercialContext } from "@/app/(product)/commercial-context";
import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { crmDb } from "@/lib/crm/types";

const PRODUCT_ACTIVITY_TYPES = [
  "quote.generated",
  "budget.generated",
  "tender.generated",
] as const;

function trimMetaId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readMetaIds(
  meta: Record<string, unknown> | null | undefined,
): Partial<ProductCommercialContext> {
  if (!meta) return {};
  return {
    organizationId: trimMetaId(meta.organizationId) || undefined,
    projectId: trimMetaId(meta.projectId) || undefined,
    quoteId: trimMetaId(meta.quoteId) || undefined,
    budgetId: trimMetaId(meta.budgetId) || undefined,
  };
}

export async function resolveProductContextForCustomer(
  organizationId: string,
  customerId: string,
): Promise<ProductCommercialContext | null> {
  const orgId = organizationId.trim();
  const custId = customerId.trim();
  if (!orgId || !custId) return null;

  const customer = await getCustomerById(custId, orgId);
  if (!customer) return null;

  const activities = await crmDb().cRMActivity.findMany({
    where: {
      customerId: custId,
      type: { in: [...PRODUCT_ACTIVITY_TYPES] },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const ctx: ProductCommercialContext = { organizationId: orgId };

  for (const activity of activities) {
    const meta = (activity.meta as Record<string, unknown> | null) ?? null;
    const ids = readMetaIds(meta);
    const resourceId = trimMetaId(meta?.resourceId);

    if (activity.type === "quote.generated") {
      if (!ctx.quoteId) ctx.quoteId = ids.quoteId || resourceId;
      if (!ctx.projectId) ctx.projectId = ids.projectId;
    } else if (activity.type === "budget.generated") {
      if (!ctx.budgetId) ctx.budgetId = ids.budgetId || resourceId;
      if (!ctx.quoteId) ctx.quoteId = ids.quoteId;
      if (!ctx.projectId) ctx.projectId = ids.projectId;
    } else if (activity.type === "tender.generated") {
      if (!ctx.projectId) ctx.projectId = ids.projectId;
      if (!ctx.quoteId) ctx.quoteId = ids.quoteId;
      if (!ctx.budgetId) ctx.budgetId = ids.budgetId;
    }
  }

  if (!ctx.projectId && !ctx.quoteId && !ctx.budgetId) return null;
  return ctx;
}
