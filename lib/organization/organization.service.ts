/**
 * V59 SaaS — Organization service
 */

import { prisma } from "@/lib/prisma";
import { createSubscription } from "@/lib/billing/subscription.service";
import { addMemberToOrganization } from "@/lib/organization/membership.service";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "org";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export async function createOrganization(input: {
  name: string;
  ownerUserId: string;
}) {
  const slug = await uniqueSlug(input.name);

  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      slug,
    },
  });

  await addMemberToOrganization({
    organizationId: organization.id,
    userId: input.ownerUserId,
    role: "OWNER",
  });

  await createSubscription({
    organizationId: organization.id,
    plan: "BASIC",
  });

  return organization;
}

export async function getOrganizationById(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: { include: { user: true } },
    },
  });
}

export async function listOrganizationsForUser(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    organization: m.organization,
    role: m.role,
    membershipId: m.id,
  }));
}
