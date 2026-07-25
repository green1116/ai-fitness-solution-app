/**
 * Product Organization — Membership registry
 */

import { MEMBERSHIP_STATUSES } from "../management/management.constants";
import { getOrganization } from "../unit/unit.registry";
import type {
  AddMembershipInput,
  MembershipStatus,
  OrganizationMembership,
} from "./membership.types";

const memberships = new Map<string, OrganizationMembership>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMembership(
  membership: OrganizationMembership,
): OrganizationMembership {
  return { ...membership, metadata: { ...membership.metadata } };
}

export function addMembership(
  input: AddMembershipInput,
): OrganizationMembership {
  const organizationId = input.organizationId.trim();
  const subjectId = input.subjectId.trim();
  if (!organizationId) {
    throw new Error("membership.organizationId is required");
  }
  if (!subjectId) throw new Error("membership.subjectId is required");
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const status = input.status ?? MEMBERSHIP_STATUSES[1];
  if (!(MEMBERSHIP_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid membership status: ${status}`);
  }

  const duplicate = [...memberships.values()].find(
    (m) =>
      m.organizationId === organizationId &&
      m.subjectId === subjectId &&
      m.status !== "REMOVED",
  );
  if (duplicate) {
    throw new Error(
      `membership already exists: ${organizationId}/${subjectId}`,
    );
  }

  const id = input.id?.trim() || createId("orgmem");
  if (memberships.has(id)) {
    throw new Error(`membership already exists: ${id}`);
  }

  const membership: OrganizationMembership = {
    id,
    organizationId,
    subjectId,
    status,
    detail: `status=${status} subject=${subjectId}`,
    metadata: { ...(input.metadata ?? {}) },
    joinedAt: nowIso(),
  };
  memberships.set(id, membership);
  return cloneMembership(membership);
}

export function getMembership(
  id: string,
): OrganizationMembership | undefined {
  const membership = memberships.get(id.trim());
  return membership ? cloneMembership(membership) : undefined;
}

export function listMemberships(filter?: {
  organizationId?: string;
  status?: MembershipStatus;
}): OrganizationMembership[] {
  let result = [...memberships.values()];
  if (filter?.organizationId) {
    const organizationId = filter.organizationId.trim();
    result = result.filter((m) => m.organizationId === organizationId);
  }
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMembership);
}

export function clearMemberships(): void {
  memberships.clear();
}
