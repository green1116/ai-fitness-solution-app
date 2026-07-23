/**
 * Launch L2 — Project types
 */

import type { PROJECT_LIFECYCLE_STAGES } from "../pilot/pilot.constants";

export type ProjectLifecycleStage =
  (typeof PROJECT_LIFECYCLE_STAGES)[number];
export type ProjectMetadata = Record<string, unknown>;

export type PilotProject = {
  id: string;
  pilotId: string;
  name: string;
  stage: ProjectLifecycleStage;
  progress: number;
  detail: string;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreatePilotProjectInput = {
  id?: string;
  pilotId: string;
  name: string;
  stage?: ProjectLifecycleStage;
  metadata?: ProjectMetadata;
};

export type TrackProjectProgressInput = {
  projectId: string;
  progress: number;
  note?: string;
};

export type AdvanceProjectLifecycleInput = {
  projectId: string;
  stage: ProjectLifecycleStage;
};
