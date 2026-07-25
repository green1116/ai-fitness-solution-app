/**
 * Product Operations — Dispatch types
 */

import type { OPS_DISPATCH_STATUSES } from "../console/console.constants";

export type OpsDispatchStatus = (typeof OPS_DISPATCH_STATUSES)[number];
export type DispatchMetadata = Record<string, unknown>;

export type OpsDispatch = {
  id: string;
  incidentId: string;
  playbookId: string;
  status: OpsDispatchStatus;
  detail: string;
  metadata: DispatchMetadata;
  createdAt: string;
  updatedAt: string;
};

export type QueueOpsDispatchInput = {
  id?: string;
  incidentId: string;
  playbookId: string;
  metadata?: DispatchMetadata;
};

export type RunOpsDispatchInput = {
  dispatchId: string;
};
