/**
 * Product P2 — Member registry
 */

import { getDepartment } from "../department/department.registry";
import { MEMBER_STATUSES } from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import type {
  MemberStatus,
  OrganizationMember,
  RegisterMemberInput,
  UpdateMemberStatusInput,
} from "./member.types";

const members = new Map<string, OrganizationMember>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMember(member: OrganizationMember): OrganizationMember {
  return { ...member, metadata: { ...member.metadata } };
}

export function registerMember(
  input: RegisterMemberInput,
): OrganizationMember {
  const organizationId = input.organizationId.trim();
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!organizationId) throw new Error("member.organizationId is required");
  if (!email) throw new Error("member.email is required");
  if (!displayName) throw new Error("member.displayName is required");
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const departmentId = input.departmentId?.trim();
  if (departmentId) {
    const dept = getDepartment(departmentId);
    if (!dept || dept.organizationId !== organizationId) {
      throw new Error(`department not found for organization: ${departmentId}`);
    }
  }

  const id = input.id?.trim() || createId("p2mem");
  if (members.has(id)) {
    throw new Error(`member already exists: ${id}`);
  }

  const now = nowIso();
  const status = MEMBER_STATUSES[1];
  const member: OrganizationMember = {
    id,
    organizationId,
    departmentId,
    email,
    displayName,
    status,
    detail: `email=${email} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  members.set(id, member);
  return cloneMember(member);
}

export function updateMemberStatus(
  input: UpdateMemberStatusInput,
): OrganizationMember {
  const memberId = input.memberId.trim();
  if (!memberId) throw new Error("member.memberId is required");
  if (!(MEMBER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid member status: ${input.status}`);
  }
  const existing = members.get(memberId);
  if (!existing) throw new Error(`member not found: ${memberId}`);

  const updated: OrganizationMember = {
    ...existing,
    status: input.status,
    detail: `email=${existing.email} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  members.set(memberId, updated);
  return cloneMember(updated);
}

export function getMember(id: string): OrganizationMember | undefined {
  const member = members.get(id.trim());
  return member ? cloneMember(member) : undefined;
}

export function listMembers(filter?: {
  organizationId?: string;
  departmentId?: string;
  status?: MemberStatus;
}): OrganizationMember[] {
  let result = [...members.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((m) => m.organizationId === oid);
  }
  if (filter?.departmentId) {
    const did = filter.departmentId.trim();
    result = result.filter((m) => m.departmentId === did);
  }
  if (filter?.status) result = result.filter((m) => m.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMember);
}

export function clearMembers(): void {
  members.clear();
}
