/**
 * Product Organization — Hierarchy types
 */

import type { HIERARCHY_KINDS } from "../management/management.constants";

export type HierarchyKind = (typeof HIERARCHY_KINDS)[number];
export type HierarchyMetadata = Record<string, unknown>;

export type OrganizationHierarchy = {
  id: string;
  parentId: string;
  childId: string;
  kind: HierarchyKind;
  detail: string;
  metadata: HierarchyMetadata;
  linkedAt: string;
};

export type LinkHierarchyInput = {
  id?: string;
  parentId: string;
  childId: string;
  kind?: HierarchyKind;
  metadata?: HierarchyMetadata;
};
