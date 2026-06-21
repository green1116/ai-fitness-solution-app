/**
 * V59 SaaS — Organization membership service
 */

import { prisma } from "@/lib/prisma";
import {
  canAssignRole,
  normalizeOrgRole,
  type OrgRole,
} from "@/lib/organization/role.service";

export type MembershipContext = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
};

export async function assignRole(membershipId: string, role: OrgRole) {
  return prisma.organizationMember.update({
    where: { id: membershipId },
    data: { role },
  });
}

export async function getMembership(
  userId: string,
  organizationId: string,
): Promise<MembershipContext | null> {
  const row = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organizationId,
    userId: row.userId,
    role: normalizeOrgRole(row.role),
  };
}

export async function addMemberToOrganization(input: {
  organizationId: string;
  userId: string;
  role?: OrgRole;
}) {
  return prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
    create: {
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role ?? "MEMBER",
    },
    update: {
      role: input.role ?? "MEMBER",
    },
  });
}

export async function assignMemberRole(input: {
  actorUserId: string;
  organizationId: string;
  targetUserId: string;
  role: OrgRole;
}) {
  const actor = await getMembership(input.actorUserId, input.organizationId);
  if (!actor) {
    throw new Error("Actor is not a member of this organization");
  }

  if (!canAssignRole(actor.role, input.role)) {
    throw new Error("Insufficient permissions to assign this role");
  }

  const target = await getMembership(input.targetUserId, input.organizationId);
  if (!target) {
    throw new Error("Target user is not a member of this organization");
  }

  return assignRole(target.id, input.role);
}
