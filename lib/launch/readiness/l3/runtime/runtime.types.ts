/**
 * Launch L3 — Runtime types
 */

import type { HEALTH_LEVELS, RUNTIME_STATUSES } from "./runtime.constants";

export type RuntimeStatus = (typeof RUNTIME_STATUSES)[number];
export type HealthLevel = (typeof HEALTH_LEVELS)[number];
export type RuntimeMetadata = Record<string, unknown>;

export type RuntimeNode = {
  id: string;
  name: string;
  environment: string;
  status: RuntimeStatus;
  detail: string;
  metadata: RuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRuntimeInput = {
  id?: string;
  name: string;
  environment?: string;
  status?: RuntimeStatus;
  metadata?: RuntimeMetadata;
};

export type UpdateRuntimeStatusInput = {
  runtimeId: string;
  status: RuntimeStatus;
  note?: string;
};

export type RuntimeHealth = {
  id: string;
  runtimeId: string;
  level: HealthLevel;
  score: number;
  checksPassed: number;
  checksFailed: number;
  detail: string;
  assessedAt: string;
};

export type AssessRuntimeHealthInput = {
  id?: string;
  runtimeId: string;
  checksPassed: number;
  checksFailed: number;
};
