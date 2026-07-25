/**
 * Product P2 — Directory types
 */

export type DirectoryEntryKind =
  | "ORGANIZATION"
  | "DEPARTMENT"
  | "MEMBER"
  | "WORKSPACE";

export type DirectoryEntry = {
  id: string;
  organizationId: string;
  kind: DirectoryEntryKind;
  refId: string;
  label: string;
  path: string;
  detail: string;
  indexedAt: string;
};

export type BuildDirectoryInput = {
  id?: string;
  organizationId: string;
};

export type DirectoryIndex = {
  id: string;
  organizationId: string;
  entryCount: number;
  entries: DirectoryEntry[];
  detail: string;
  builtAt: string;
};
