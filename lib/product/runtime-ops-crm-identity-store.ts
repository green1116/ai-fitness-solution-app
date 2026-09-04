/**
 * Runtime Ops ↔ CRM Identity Store — explicit tenant-scoped persistence.
 * No name heuristics; does not touch EADS/EAC/EWAS.
 */

import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { prisma } from "@/lib/prisma";

export type OpsCrmIdentityLinkRecord = Readonly<{
  id: string;
  organizationId: string;
  opsCustomerId: string;
  crmCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function lookupOpsCrmIdentityLink(
  organizationId: string,
  opsCustomerId: string,
): Promise<string | null> {
  const orgId = trimId(organizationId);
  const opsId = trimId(opsCustomerId);
  if (!orgId || !opsId) return null;

  const link = await prisma.opsCrmIdentityLink.findUnique({
    where: {
      organizationId_opsCustomerId: {
        organizationId: orgId,
        opsCustomerId: opsId,
      },
    },
    select: { crmCustomerId: true },
  });

  return link?.crmCustomerId ?? null;
}

/**
 * Batch read-only identity lookup for workspace SSR.
 * Returns Map of opsCustomerId → crmCustomerId. No schema change.
 */
export async function listOpsCrmIdentityLinksByOpsCustomerIds(
  organizationId: string,
  opsCustomerIds: readonly string[],
): Promise<Map<string, string>> {
  const orgId = trimId(organizationId);
  const opsIds = [
    ...new Set(
      opsCustomerIds
        .map((id) => trimId(id))
        .filter((id) => id.length > 0),
    ),
  ];
  if (!orgId || opsIds.length === 0) return new Map();

  const links = await prisma.opsCrmIdentityLink.findMany({
    where: {
      organizationId: orgId,
      opsCustomerId: { in: opsIds },
    },
    select: { opsCustomerId: true, crmCustomerId: true },
  });

  return new Map(links.map((link) => [link.opsCustomerId, link.crmCustomerId]));
}

export async function linkOpsCrmIdentity(input: {
  organizationId: string;
  opsCustomerId: string;
  crmCustomerId: string;
}): Promise<OpsCrmIdentityLinkRecord> {
  const orgId = trimId(input.organizationId);
  const opsId = trimId(input.opsCustomerId);
  const crmId = trimId(input.crmCustomerId);
  if (!orgId || !opsId || !crmId) {
    throw new Error("organizationId, opsCustomerId, and crmCustomerId required");
  }

  const customer = await getCustomerById(crmId, orgId);
  if (!customer) {
    throw new Error("CRM customer not found for organization");
  }

  const link = await prisma.opsCrmIdentityLink.upsert({
    where: {
      organizationId_opsCustomerId: {
        organizationId: orgId,
        opsCustomerId: opsId,
      },
    },
    create: {
      organizationId: orgId,
      opsCustomerId: opsId,
      crmCustomerId: customer.id,
    },
    update: {
      crmCustomerId: customer.id,
    },
  });

  return link;
}

export async function unlinkOpsCrmIdentity(input: {
  organizationId: string;
  opsCustomerId: string;
}): Promise<boolean> {
  const orgId = trimId(input.organizationId);
  const opsId = trimId(input.opsCustomerId);
  if (!orgId || !opsId) return false;

  const result = await prisma.opsCrmIdentityLink.deleteMany({
    where: {
      organizationId: orgId,
      opsCustomerId: opsId,
    },
  });

  return result.count > 0;
}
