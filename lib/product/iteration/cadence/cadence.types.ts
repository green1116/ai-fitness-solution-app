/**
 * Product Iteration — Cadence types
 */

import type { CADENCE_KINDS } from "../cycle/cycle.constants";

export type CadenceKind = (typeof CADENCE_KINDS)[number];
export type CadenceMetadata = Record<string, unknown>;

export type IterationCadence = {
  id: string;
  cycleId: string;
  kind: CadenceKind;
  name: string;
  detail: string;
  metadata: CadenceMetadata;
  createdAt: string;
};

export type CreateCadenceInput = {
  id?: string;
  cycleId: string;
  kind: CadenceKind;
  name: string;
  metadata?: CadenceMetadata;
};
