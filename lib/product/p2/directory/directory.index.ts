/**
 * Product P2 — Directory index
 */

import { listDepartments } from "../department/department.registry";
import { listMembers } from "../member/member.registry";
import { getOrganization } from "../organization/organization.registry";
import { listWorkspaces } from "../workspace/workspace.registry";
import type {
  BuildDirectoryInput,
  DirectoryEntry,
  DirectoryIndex,
} from "./directory.types";

const indexes = new Map<string, DirectoryIndex>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIndex(index: DirectoryIndex): DirectoryIndex {
  return {
    ...index,
    entries: index.entries.map((e) => ({ ...e })),
  };
}

export function buildDirectoryIndex(
  input: BuildDirectoryInput,
): DirectoryIndex {
  const organizationId = input.organizationId.trim();
  if (!organizationId) throw new Error("directory.organizationId is required");
  const org = getOrganization(organizationId);
  if (!org) throw new Error(`organization not found: ${organizationId}`);

  const now = nowIso();
  const entries: DirectoryEntry[] = [];

  entries.push({
    id: createId("p2dent"),
    organizationId,
    kind: "ORGANIZATION",
    refId: org.id,
    label: org.name,
    path: `/${org.accountRef}`,
    detail: `org=${org.id}`,
    indexedAt: now,
  });

  for (const dept of listDepartments({ organizationId })) {
    entries.push({
      id: createId("p2dent"),
      organizationId,
      kind: "DEPARTMENT",
      refId: dept.id,
      label: dept.name,
      path: `/${org.accountRef}/${dept.code}`,
      detail: `dept=${dept.code}`,
      indexedAt: now,
    });
  }

  for (const member of listMembers({ organizationId })) {
    entries.push({
      id: createId("p2dent"),
      organizationId,
      kind: "MEMBER",
      refId: member.id,
      label: member.displayName,
      path: `/${org.accountRef}/members/${member.email}`,
      detail: `member=${member.email}`,
      indexedAt: now,
    });
  }

  for (const workspace of listWorkspaces({ organizationId })) {
    entries.push({
      id: createId("p2dent"),
      organizationId,
      kind: "WORKSPACE",
      refId: workspace.id,
      label: workspace.name,
      path: `/${org.accountRef}/workspaces/${workspace.id}`,
      detail: `workspace=${workspace.name}`,
      indexedAt: now,
    });
  }

  if (entries.length < 2) {
    throw new Error(`insufficient directory data for: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2dir");
  if (indexes.has(id)) {
    throw new Error(`directory index already exists: ${id}`);
  }

  const index: DirectoryIndex = {
    id,
    organizationId,
    entryCount: entries.length,
    entries,
    detail: `entries=${entries.length}`,
    builtAt: now,
  };
  indexes.set(id, index);
  return cloneIndex(index);
}

export function getDirectoryIndex(id: string): DirectoryIndex | undefined {
  const index = indexes.get(id.trim());
  return index ? cloneIndex(index) : undefined;
}

export function listDirectoryIndexes(filter?: {
  organizationId?: string;
}): DirectoryIndex[] {
  let result = [...indexes.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((i) => i.organizationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIndex);
}

export function clearDirectoryIndexes(): void {
  indexes.clear();
}
