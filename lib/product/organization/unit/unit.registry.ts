/**
 * Product Organization — Unit registry
 */

import { ORG_KINDS, ORG_STATUSES } from "../management/management.constants";
import type {
  CreateOrganizationInput,
  OrgKind,
  OrganizationUnit,
  OrgStatus,
  UpdateOrganizationStatusInput,
} from "./unit.types";

const units = new Map<string, OrganizationUnit>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneUnit(unit: OrganizationUnit): OrganizationUnit {
  return { ...unit, metadata: { ...unit.metadata } };
}

export function createOrganization(
  input: CreateOrganizationInput,
): OrganizationUnit {
  const customerId = input.customerId.trim();
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!customerId) throw new Error("organization.customerId is required");
  if (!name) throw new Error("organization.name is required");
  if (!slug) throw new Error("organization.slug is required");
  if (!(ORG_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid organization kind: ${input.kind}`);
  }

  const duplicateSlug = [...units.values()].find((u) => u.slug === slug);
  if (duplicateSlug) {
    throw new Error(`organization slug already exists: ${slug}`);
  }

  const id = input.id?.trim() || createId("orgunit");
  if (units.has(id)) throw new Error(`organization already exists: ${id}`);

  const now = nowIso();
  const unit: OrganizationUnit = {
    id,
    customerId,
    kind: input.kind,
    name,
    slug,
    status: ORG_STATUSES[0],
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  units.set(id, unit);
  return cloneUnit(unit);
}

export function updateOrganizationStatus(
  input: UpdateOrganizationStatusInput,
): OrganizationUnit {
  const organizationId = input.organizationId.trim();
  if (!organizationId) {
    throw new Error("organization.organizationId is required");
  }
  if (!(ORG_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid organization status: ${input.status}`);
  }

  const existing = units.get(organizationId);
  if (!existing) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const updated: OrganizationUnit = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  units.set(organizationId, updated);
  return cloneUnit(updated);
}

export function getOrganization(id: string): OrganizationUnit | undefined {
  const unit = units.get(id.trim());
  return unit ? cloneUnit(unit) : undefined;
}

export function listOrganizations(filter?: {
  customerId?: string;
  kind?: OrgKind;
  status?: OrgStatus;
}): OrganizationUnit[] {
  let result = [...units.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((u) => u.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((u) => u.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((u) => u.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneUnit);
}

export function clearOrganizations(): void {
  units.clear();
}
