/**
 * Product P12 — Operations types
 */

import type { OPERATIONS_MODES } from "../launch/launch.constants";

export type OperationsMode = (typeof OPERATIONS_MODES)[number];
export type OperationsMetadata = Record<string, unknown>;

export type LaunchOperations = {
  id: string;
  launchId: string;
  mode: OperationsMode;
  owner: string;
  runbook: string;
  detail: string;
  metadata: OperationsMetadata;
  activatedAt: string;
};

export type ActivateOperationsInput = {
  id?: string;
  launchId: string;
  mode: OperationsMode;
  owner: string;
  runbook?: string;
  metadata?: OperationsMetadata;
};
