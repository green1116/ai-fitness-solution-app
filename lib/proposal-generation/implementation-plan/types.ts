import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const IMPLEMENTATION_PLAN_RUNTIME_VERSION = "v11.0-implementation-plan-runtime-1" as const;

export interface Milestone { milestoneId: string; name: string; targetDate: string; deliverable: string; }
export interface Phase { phaseId: string; name: string; durationWeeks: number; objectives: string[]; }
export interface TimelineEntry { entryId: string; week: number; activity: string; owner: string; }
export interface Responsibility { respId: string; role: string; scope: string; contact: string; }

export interface ImplementationPlanRuntimePayload {
  version: typeof IMPLEMENTATION_PLAN_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  milestones: Milestone[];
  phases: Phase[];
  timeline: TimelineEntry[];
  responsibilities: Responsibility[];
  summary: string;
}
