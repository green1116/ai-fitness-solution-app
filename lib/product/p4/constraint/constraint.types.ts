/**
 * Product P4 — Constraint types
 */

import type { CONSTRAINT_KINDS } from "../questionnaire/questionnaire.constants";

export type ConstraintKind = (typeof CONSTRAINT_KINDS)[number];
export type ConstraintMetadata = Record<string, unknown>;

export type ProjectConstraint = {
  id: string;
  projectRef: string;
  kind: ConstraintKind;
  title: string;
  description: string;
  severity: number;
  detail: string;
  metadata: ConstraintMetadata;
  createdAt: string;
};

export type CaptureConstraintInput = {
  id?: string;
  projectRef: string;
  kind: ConstraintKind;
  title: string;
  description: string;
  severity: number;
  metadata?: ConstraintMetadata;
};
