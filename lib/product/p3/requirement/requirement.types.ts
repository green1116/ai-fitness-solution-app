/**
 * Product P3 — Requirement types
 */

import type { REQUIREMENT_PRIORITIES } from "../project/project.constants";

export type RequirementPriority =
  (typeof REQUIREMENT_PRIORITIES)[number];
export type RequirementMetadata = Record<string, unknown>;

export type ProjectRequirement = {
  id: string;
  projectId: string;
  title: string;
  priority: RequirementPriority;
  description: string;
  detail: string;
  metadata: RequirementMetadata;
  createdAt: string;
};

export type CaptureRequirementInput = {
  id?: string;
  projectId: string;
  title: string;
  priority: RequirementPriority;
  description: string;
  metadata?: RequirementMetadata;
};
