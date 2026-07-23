/**
 * Launch L3 — Backup snapshot
 */

import { BACKUP_STATUSES } from "../runtime/runtime.constants";
import { getRuntime } from "../runtime/runtime.status";
import type {
  BackupSnapshot,
  BackupStatus,
  CaptureBackupSnapshotInput,
} from "./backup.types";

const snapshots = new Map<string, BackupSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(snapshot: BackupSnapshot): BackupSnapshot {
  return { ...snapshot, metadata: { ...snapshot.metadata } };
}

export function captureBackupSnapshot(
  input: CaptureBackupSnapshotInput,
): BackupSnapshot {
  const runtimeId = input.runtimeId.trim();
  const label = input.label.trim();
  if (!runtimeId) throw new Error("backup.runtimeId is required");
  if (!label) throw new Error("backup.label is required");
  if (!getRuntime(runtimeId)) {
    throw new Error(`runtime not found: ${runtimeId}`);
  }
  if (!Number.isFinite(input.sizeMb) || input.sizeMb < 0) {
    throw new Error("backup.sizeMb must be a non-negative number");
  }

  const id = input.id?.trim() || createId("l3snp");
  if (snapshots.has(id)) {
    throw new Error(`backup snapshot already exists: ${id}`);
  }

  const status: BackupStatus = "CAPTURED";
  if (!(BACKUP_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid backup status: ${status}`);
  }

  const sizeMb = Math.round(input.sizeMb * 10) / 10;
  const snapshot: BackupSnapshot = {
    id,
    runtimeId,
    label,
    status,
    sizeMb,
    detail: `status=${status} sizeMb=${sizeMb}`,
    metadata: { ...(input.metadata ?? {}) },
    capturedAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function markBackupVerified(snapshotId: string): BackupSnapshot {
  const current = snapshots.get(snapshotId.trim());
  if (!current) throw new Error(`backup snapshot not found: ${snapshotId}`);
  const updated: BackupSnapshot = {
    ...current,
    status: "VERIFIED",
    detail: `status=VERIFIED sizeMb=${current.sizeMb}`,
  };
  snapshots.set(current.id, updated);
  return cloneSnapshot(updated);
}

export function getBackupSnapshot(id: string): BackupSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listBackupSnapshots(filter?: {
  runtimeId?: string;
  status?: BackupStatus;
}): BackupSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((s) => s.runtimeId === rid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearBackupSnapshots(): void {
  snapshots.clear();
}
