/**
 * Product P3 — Project brief types
 */

import type { BRIEF_STATUSES } from "../project/project.constants";

export type BriefStatus = (typeof BRIEF_STATUSES)[number];
export type BriefMetadata = Record<string, unknown>;

export type ProjectBrief = {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  status: BriefStatus;
  detail: string;
  metadata: BriefMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectBriefInput = {
  id?: string;
  projectId: string;
  title: string;
  summary: string;
  metadata?: BriefMetadata;
};

export type UpdateBriefStatusInput = {
  briefId: string;
  status: BriefStatus;
};
