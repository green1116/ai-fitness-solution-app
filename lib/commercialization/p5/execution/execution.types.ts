/**
 * Commercialization P5 — Execution types
 */

import type { EXECUTION_STATUSES } from "../delivery/delivery.constants";

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
export type ExecutionMetadata = Record<string, unknown>;

export type DeliveryExecution = {
  id: string;
  deliveryId: string;
  name: string;
  status: ExecutionStatus;
  progress: number;
  detail: string;
  metadata: ExecutionMetadata;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type StartExecutionInput = {
  id?: string;
  deliveryId: string;
  name: string;
  metadata?: ExecutionMetadata;
};

export type ExecutionStatusRecord = {
  id: string;
  executionId: string;
  status: ExecutionStatus;
  progress: number;
  note: string;
  recordedAt: string;
};

export type RecordExecutionStatusInput = {
  id?: string;
  executionId: string;
  status: ExecutionStatus;
  progress?: number;
  note?: string;
};
