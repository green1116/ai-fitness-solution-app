/**
 * Product P3 — Goal types
 */

import type { GOAL_STATUSES } from "../project/project.constants";

export type GoalStatus = (typeof GOAL_STATUSES)[number];
export type GoalMetadata = Record<string, unknown>;

export type ProjectGoal = {
  id: string;
  projectId: string;
  title: string;
  targetMetric: string;
  targetValue: number;
  status: GoalStatus;
  detail: string;
  metadata: GoalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type DefineGoalInput = {
  id?: string;
  projectId: string;
  title: string;
  targetMetric: string;
  targetValue: number;
  metadata?: GoalMetadata;
};

export type UpdateGoalStatusInput = {
  goalId: string;
  status: GoalStatus;
};
