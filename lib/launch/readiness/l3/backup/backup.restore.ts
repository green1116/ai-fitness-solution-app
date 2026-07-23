/**
 * Launch L3 — Backup restore
 */

import { getRuntime } from "../runtime/runtime.status";
import {
  getBackupSnapshot,
  markBackupVerified,
} from "./backup.snapshot";
import type { BackupRestore, RestoreBackupInput } from "./backup.types";

const restores = new Map<string, BackupRestore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRestore(restore: BackupRestore): BackupRestore {
  return { ...restore };
}

export function restoreBackupSnapshot(
  input: RestoreBackupInput,
): BackupRestore {
  const snapshotId = input.snapshotId.trim();
  const targetRuntimeId = input.targetRuntimeId.trim();
  if (!snapshotId) throw new Error("restore.snapshotId is required");
  if (!targetRuntimeId) throw new Error("restore.targetRuntimeId is required");

  const snapshot = getBackupSnapshot(snapshotId);
  if (!snapshot) throw new Error(`backup snapshot not found: ${snapshotId}`);
  if (!getRuntime(targetRuntimeId)) {
    throw new Error(`runtime not found: ${targetRuntimeId}`);
  }

  if (snapshot.status === "CAPTURED") {
    markBackupVerified(snapshotId);
  }

  const id = input.id?.trim() || createId("l3rst");
  if (restores.has(id)) {
    throw new Error(`backup restore already exists: ${id}`);
  }

  const restore: BackupRestore = {
    id,
    snapshotId,
    targetRuntimeId,
    status: "RESTORED",
    detail: `snapshot=${snapshotId} target=${targetRuntimeId}`,
    restoredAt: nowIso(),
  };
  restores.set(id, restore);
  return cloneRestore(restore);
}

export function getBackupRestore(id: string): BackupRestore | undefined {
  const restore = restores.get(id.trim());
  return restore ? cloneRestore(restore) : undefined;
}

export function listBackupRestores(filter?: {
  snapshotId?: string;
  targetRuntimeId?: string;
}): BackupRestore[] {
  let result = [...restores.values()];
  if (filter?.snapshotId) {
    const sid = filter.snapshotId.trim();
    result = result.filter((r) => r.snapshotId === sid);
  }
  if (filter?.targetRuntimeId) {
    const tid = filter.targetRuntimeId.trim();
    result = result.filter((r) => r.targetRuntimeId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRestore);
}

export function clearBackupRestores(): void {
  restores.clear();
}
