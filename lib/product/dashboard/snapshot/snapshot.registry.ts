/**
 * Product Dashboard — Snapshot registry
 */

import { getBoard } from "../board/board.registry";
import { listLayouts } from "../layout/layout.registry";
import { listWidgets } from "../widget/widget.registry";
import type {
  CaptureSnapshotInput,
  DashboardSnapshot,
} from "./snapshot.types";

const snapshots = new Map<string, DashboardSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(snapshot: DashboardSnapshot): DashboardSnapshot {
  return { ...snapshot, metadata: { ...snapshot.metadata } };
}

export function captureSnapshot(
  input: CaptureSnapshotInput,
): DashboardSnapshot {
  const boardId = input.boardId.trim();
  if (!boardId) throw new Error("snapshot.boardId is required");
  if (!getBoard(boardId)) throw new Error(`board not found: ${boardId}`);

  const widgetCount = listWidgets({ boardId }).length;
  const layoutCount = listLayouts({ boardId }).length;

  const id = input.id?.trim() || createId("dashsn");
  if (snapshots.has(id)) throw new Error(`snapshot already exists: ${id}`);

  const snapshot: DashboardSnapshot = {
    id,
    boardId,
    widgetCount,
    layoutCount,
    detail: `widgets=${widgetCount} layouts=${layoutCount}`,
    metadata: { ...(input.metadata ?? {}) },
    capturedAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function getSnapshot(id: string): DashboardSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listSnapshots(filter?: {
  boardId?: string;
}): DashboardSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.boardId) {
    const boardId = filter.boardId.trim();
    result = result.filter((s) => s.boardId === boardId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearSnapshots(): void {
  snapshots.clear();
}
