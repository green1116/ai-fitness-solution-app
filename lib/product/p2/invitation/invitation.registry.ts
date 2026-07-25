/**
 * Product P2 — Invitation registry
 */

import {
  INVITATION_STATUSES,
  ROLE_KINDS,
} from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import type {
  CreateInvitationInput,
  InvitationStatus,
  OrganizationInvitation,
  UpdateInvitationStatusInput,
} from "./invitation.types";

const invitations = new Map<string, OrganizationInvitation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInvitation(
  invitation: OrganizationInvitation,
): OrganizationInvitation {
  return { ...invitation, metadata: { ...invitation.metadata } };
}

export function createInvitation(
  input: CreateInvitationInput,
): OrganizationInvitation {
  const organizationId = input.organizationId.trim();
  const email = input.email.trim().toLowerCase();
  const invitedBy = input.invitedBy.trim();
  if (!organizationId) throw new Error("invitation.organizationId is required");
  if (!email) throw new Error("invitation.email is required");
  if (!invitedBy) throw new Error("invitation.invitedBy is required");
  if (!(ROLE_KINDS as readonly string[]).includes(input.roleKind)) {
    throw new Error(`invalid invitation role kind: ${input.roleKind}`);
  }
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2inv");
  if (invitations.has(id)) {
    throw new Error(`invitation already exists: ${id}`);
  }

  const now = nowIso();
  const status = INVITATION_STATUSES[0];
  const invitation: OrganizationInvitation = {
    id,
    organizationId,
    email,
    roleKind: input.roleKind,
    status,
    invitedBy,
    detail: `email=${email} role=${input.roleKind} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  invitations.set(id, invitation);
  return cloneInvitation(invitation);
}

export function updateInvitationStatus(
  input: UpdateInvitationStatusInput,
): OrganizationInvitation {
  const invitationId = input.invitationId.trim();
  if (!invitationId) throw new Error("invitation.invitationId is required");
  if (!(INVITATION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid invitation status: ${input.status}`);
  }
  const existing = invitations.get(invitationId);
  if (!existing) throw new Error(`invitation not found: ${invitationId}`);

  const updated: OrganizationInvitation = {
    ...existing,
    status: input.status,
    detail: `email=${existing.email} role=${existing.roleKind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  invitations.set(invitationId, updated);
  return cloneInvitation(updated);
}

export function getInvitation(
  id: string,
): OrganizationInvitation | undefined {
  const invitation = invitations.get(id.trim());
  return invitation ? cloneInvitation(invitation) : undefined;
}

export function listInvitations(filter?: {
  organizationId?: string;
  status?: InvitationStatus;
}): OrganizationInvitation[] {
  let result = [...invitations.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((i) => i.organizationId === oid);
  }
  if (filter?.status) result = result.filter((i) => i.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInvitation);
}

export function clearInvitations(): void {
  invitations.clear();
}
