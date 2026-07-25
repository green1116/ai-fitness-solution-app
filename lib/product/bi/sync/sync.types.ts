/**
 * Product BI — Sync types
 */

import type { BI_SYNC_RESULTS } from "../integration/integration.constants";

export type BiSyncResult = (typeof BI_SYNC_RESULTS)[number];
export type SyncMetadata = Record<string, unknown>;

export type BiSyncRun = {
  id: string;
  catalogId: string;
  result: BiSyncResult;
  rowCount: number;
  detail: string;
  metadata: SyncMetadata;
  syncedAt: string;
};

export type RunBiSyncInput = {
  id?: string;
  catalogId: string;
  result: BiSyncResult;
  rowCount: number;
  metadata?: SyncMetadata;
};
