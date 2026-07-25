/**
 * Product P3 — Facility types
 */

import type { FACILITY_KINDS } from "../project/project.constants";

export type FacilityKind = (typeof FACILITY_KINDS)[number];
export type FacilityMetadata = Record<string, unknown>;

export type ProjectFacility = {
  id: string;
  projectId: string;
  siteId: string;
  name: string;
  kind: FacilityKind;
  capacity: number;
  detail: string;
  metadata: FacilityMetadata;
  createdAt: string;
};

export type RegisterFacilityInput = {
  id?: string;
  projectId: string;
  siteId: string;
  name: string;
  kind: FacilityKind;
  capacity: number;
  metadata?: FacilityMetadata;
};
