/**
 * Product Dashboard — Snapshot types
 */

export type SnapshotMetadata = Record<string, unknown>;

export type DashboardSnapshot = {
  id: string;
  boardId: string;
  widgetCount: number;
  layoutCount: number;
  detail: string;
  metadata: SnapshotMetadata;
  capturedAt: string;
};

export type CaptureSnapshotInput = {
  id?: string;
  boardId: string;
  metadata?: SnapshotMetadata;
};
