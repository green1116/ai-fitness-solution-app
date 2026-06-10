import type { REVENUE_OPERATIONS_VERSION, ReadinessStubMode } from "../shared/types";

export const TRIAL_OPERATIONS_RUNTIME_VERSION = "v15.0-trial-operations-1" as const;

export const TRIAL_OUTCOMES = ["active", "expired", "converted"] as const;
export type TrialOutcome = (typeof TRIAL_OUTCOMES)[number];

export interface TrialRecord {
  trialId: string;
  customerId: string;
  companyName: string;
  trialStart: string;
  trialEnd: string;
  usageDuringTrial: { projectsCreated: number; proposalsGenerated: number; downloads: number };
  outcome: TrialOutcome;
  mode: ReadinessStubMode;
}

export interface TrialOperationsRuntimePayload {
  version: typeof TRIAL_OPERATIONS_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  trials: TrialRecord[];
  activeCount: number;
  convertedCount: number;
  summary: string;
}
