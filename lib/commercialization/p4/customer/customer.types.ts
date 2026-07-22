/**
 * Commercialization P4 — Customer intake / profile / requirements types
 */

import type {
  INTAKE_CHANNELS,
  REQUIREMENT_PRIORITIES,
} from "../onboarding/onboarding.constants";

export type IntakeChannel = (typeof INTAKE_CHANNELS)[number];
export type RequirementPriority = (typeof REQUIREMENT_PRIORITIES)[number];

export type CustomerProfile = {
  id: string;
  accountId: string;
  displayName: string;
  industry: string;
  companySize: string;
  primaryContact: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerProfileInput = {
  id?: string;
  accountId: string;
  displayName: string;
  industry?: string;
  companySize?: string;
  primaryContact?: string;
};

export type CustomerRequirement = {
  id: string;
  accountId: string;
  title: string;
  priority: RequirementPriority;
  description: string;
  satisfied: boolean;
  detail: string;
  createdAt: string;
};

export type CaptureRequirementInput = {
  id?: string;
  accountId: string;
  title: string;
  priority: RequirementPriority;
  description?: string;
};

export type CustomerIntake = {
  id: string;
  accountId: string;
  channel: IntakeChannel;
  sourceRef: string;
  notes: string;
  completeness: number;
  detail: string;
  intakeAt: string;
};

export type RecordIntakeInput = {
  id?: string;
  accountId: string;
  channel: IntakeChannel;
  sourceRef?: string;
  notes?: string;
};
