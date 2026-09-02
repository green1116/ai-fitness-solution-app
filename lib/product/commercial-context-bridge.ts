/**
 * Commercial Context Bridge v1 — read-only CRM → product context adapter.
 *
 * Resolves product commercial IDs from CRM product activities for a customer.
 * Does not mutate session storage or Runtime Ops surfaces.
 */

import type { ProductCommercialContext } from "@/app/(product)/commercial-context";
import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { crmDb } from "@/lib/crm/types";
import { prisma } from "@/lib/prisma";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

const PRODUCT_ACTIVITY_TYPES = [
  "quote.generated",
  "budget.generated",
  "tender.generated",
] as const;

type CustomerProductAttribution = {
  projectIds: Set<string>;
  quoteIds: Set<string>;
  budgetIds: Set<string>;
};

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

async function loadCustomerProductAttribution(
  customerId: string,
): Promise<CustomerProductAttribution> {
  const activities = await crmDb().cRMActivity.findMany({
    where: {
      customerId,
      type: { in: [...PRODUCT_ACTIVITY_TYPES] },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const projectIds = new Set<string>();
  const quoteIds = new Set<string>();
  const budgetIds = new Set<string>();

  for (const activity of activities) {
    const meta = (activity.meta as Record<string, unknown> | null) ?? null;
    const ids = readMetaIds(meta);
    const resourceId = trimMetaId(meta?.resourceId);

    if (ids.projectId) projectIds.add(ids.projectId);
    if (ids.quoteId) quoteIds.add(ids.quoteId);
    if (ids.budgetId) budgetIds.add(ids.budgetId);

    if (activity.type === "quote.generated" && resourceId) quoteIds.add(resourceId);
    if (activity.type === "budget.generated" && resourceId) budgetIds.add(resourceId);
  }

  return { projectIds, quoteIds, budgetIds };
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

export async function validateResolvedProductContextForOrganization(
  organizationId: string,
  customerId: string,
  ctx: ProductCommercialContext,
): Promise<ProductCommercialContext | null> {
  const orgId = organizationId.trim();
  const custId = customerId.trim();
  if (!orgId || !custId) return null;

  const customer = await getCustomerById(custId, orgId);
  if (!customer) return null;

  const attribution = await loadCustomerProductAttribution(custId);
  const validated: ProductCommercialContext = { organizationId: orgId };

  if (ctx.quoteId) {
    const quoteId = trimMetaId(ctx.quoteId);
    if (!quoteId || !attribution.quoteIds.has(quoteId)) return null;

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { project: true },
    });
    if (!quote) return null;

    try {
      assertResourceBelongsToTenant(quote.project.organizationId, orgId);
    } catch {
      return null;
    }

    validated.quoteId = quoteId;
    validated.projectId = quote.projectId;
  }

  if (ctx.projectId) {
    const projectId = trimMetaId(ctx.projectId);
    if (!projectId) return null;

    if (validated.projectId && validated.projectId !== projectId) return null;
    if (!attribution.projectIds.has(projectId) && !validated.projectId) return null;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return null;

    try {
      assertResourceBelongsToTenant(project.organizationId, orgId);
    } catch {
      return null;
    }

    if (validated.projectId && validated.projectId !== project.id) return null;
    validated.projectId = project.id;
  }

  if (ctx.budgetId) {
    const budgetId = trimMetaId(ctx.budgetId);
    if (!budgetId || !attribution.budgetIds.has(budgetId)) return null;

    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { project: true },
    });
    if (!budget) return null;

    try {
      assertResourceBelongsToTenant(budget.project.organizationId, orgId);
    } catch {
      return null;
    }

    if (validated.projectId && budget.projectId !== validated.projectId) return null;
    validated.budgetId = budgetId;
    if (!validated.projectId) validated.projectId = budget.projectId;
  }

  if (!validated.projectId && !validated.quoteId && !validated.budgetId) return null;
  return validated;
}

export async function resolveValidatedProductContextForCustomer(
  organizationId: string,
  customerId: string,
): Promise<ProductCommercialContext | null> {
  const resolved = await resolveProductContextForCustomer(organizationId, customerId);
  if (!resolved) return null;
  return validateResolvedProductContextForOrganization(
    organizationId,
    customerId,
    resolved,
  );
}
