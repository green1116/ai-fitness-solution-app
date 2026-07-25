/**
 * Product Iteration — Experiment types
 */

import type { EXPERIMENT_STATUSES } from "../cycle/cycle.constants";

export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];
export type ExperimentMetadata = Record<string, unknown>;

export type ProductExperiment = {
  id: string;
  cycleId: string;
  hypothesis: string;
  status: ExperimentStatus;
  result?: string;
  detail: string;
  metadata: ExperimentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateExperimentInput = {
  id?: string;
  cycleId: string;
  hypothesis: string;
  metadata?: ExperimentMetadata;
};

export type ConcludeExperimentInput = {
  experimentId: string;
  status: "CONCLUDED" | "ABANDONED";
  result?: string;
};
