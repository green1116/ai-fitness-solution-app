/**
 * Product Organization — Hierarchy registry
 */

import { HIERARCHY_KINDS } from "../management/management.constants";
import { getOrganization } from "../unit/unit.registry";
import type {
  HierarchyKind,
  LinkHierarchyInput,
  OrganizationHierarchy,
} from "./hierarchy.types";

const hierarchies = new Map<string, OrganizationHierarchy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneHierarchy(
  hierarchy: OrganizationHierarchy,
): OrganizationHierarchy {
  return { ...hierarchy, metadata: { ...hierarchy.metadata } };
}

export function linkHierarchy(
  input: LinkHierarchyInput,
): OrganizationHierarchy {
  const parentId = input.parentId.trim();
  const childId = input.childId.trim();
  if (!parentId) throw new Error("hierarchy.parentId is required");
  if (!childId) throw new Error("hierarchy.childId is required");
  if (parentId === childId) {
    throw new Error("hierarchy parent and child must differ");
  }
  if (!getOrganization(parentId)) {
    throw new Error(`organization not found: ${parentId}`);
  }
  if (!getOrganization(childId)) {
    throw new Error(`organization not found: ${childId}`);
  }

  const kind = input.kind ?? HIERARCHY_KINDS[0];
  if (!(HIERARCHY_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid hierarchy kind: ${kind}`);
  }

  const duplicate = [...hierarchies.values()].find(
    (h) =>
      h.parentId === parentId && h.childId === childId && h.kind === kind,
  );
  if (duplicate) {
    throw new Error(
      `hierarchy already linked: ${parentId}/${childId}/${kind}`,
    );
  }

  const id = input.id?.trim() || createId("orghier");
  if (hierarchies.has(id)) {
    throw new Error(`hierarchy already exists: ${id}`);
  }

  const hierarchy: OrganizationHierarchy = {
    id,
    parentId,
    childId,
    kind,
    detail: `kind=${kind} ${parentId}->${childId}`,
    metadata: { ...(input.metadata ?? {}) },
    linkedAt: nowIso(),
  };
  hierarchies.set(id, hierarchy);
  return cloneHierarchy(hierarchy);
}

export function getHierarchy(
  id: string,
): OrganizationHierarchy | undefined {
  const hierarchy = hierarchies.get(id.trim());
  return hierarchy ? cloneHierarchy(hierarchy) : undefined;
}

export function listHierarchies(filter?: {
  parentId?: string;
  kind?: HierarchyKind;
}): OrganizationHierarchy[] {
  let result = [...hierarchies.values()];
  if (filter?.parentId) {
    const parentId = filter.parentId.trim();
    result = result.filter((h) => h.parentId === parentId);
  }
  if (filter?.kind) result = result.filter((h) => h.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHierarchy);
}

export function clearHierarchies(): void {
  hierarchies.clear();
}
