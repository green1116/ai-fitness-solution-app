/**
 * Product P4 — Stakeholder types
 */

import type { STAKEHOLDER_ROLES } from "../questionnaire/questionnaire.constants";

export type StakeholderRole = (typeof STAKEHOLDER_ROLES)[number];
export type StakeholderMetadata = Record<string, unknown>;

export type Stakeholder = {
  id: string;
  projectRef: string;
  name: string;
  email: string;
  role: StakeholderRole;
  detail: string;
  metadata: StakeholderMetadata;
  createdAt: string;
};

export type RegisterStakeholderInput = {
  id?: string;
  projectRef: string;
  name: string;
  email: string;
  role: StakeholderRole;
  metadata?: StakeholderMetadata;
};
