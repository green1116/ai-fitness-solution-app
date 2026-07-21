/**
 * Launch P3 — Snapshot / Reset Mechanism
 */

import {
  getSampleDataProfile,
  listSampleDataProfiles,
  resetSampleDataProfile,
  seedSampleDataProfile,
} from "./demo.sample";
import { getDemoTenant, updateDemoTenant } from "./demo.tenant";
import { getDemoWorkspace, setDemoWorkspaceStatus } from "./demo.workspace";
import type {
  CaptureDemoSnapshotInput,
  DemoSnapshot,
  SnapshotStatus,
} from "./demo.types";

const snapshots = new Map<string, DemoSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function checksum(payload: string): string {
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (Math.imul(31, h) + payload.charCodeAt(i)) | 0;
  }
  return `snap_${Math.abs(h).toString(36)}`;
}

function cloneSnapshot(snapshot: DemoSnapshot): DemoSnapshot {
  return {
    ...snapshot,
    payload: {
      ...snapshot.payload,
      entryCounts: { ...snapshot.payload.entryCounts },
    },
  };
}

export function captureDemoSnapshot(
  input: CaptureDemoSnapshotInput,
): DemoSnapshot {
  const demoTenantId = input.demoTenantId.trim();
  const sampleDataProfileId = input.sampleDataProfileId.trim();

  const tenant = getDemoTenant(demoTenantId);
  if (!tenant) throw new Error(`demo tenant not found: ${demoTenantId}`);

  let sample = getSampleDataProfile(sampleDataProfileId);
  if (!sample || sample.demoTenantId !== demoTenantId) {
    throw new Error(`sample data profile not found: ${sampleDataProfileId}`);
  }
  if (!sample.seeded) {
    sample = seedSampleDataProfile(sampleDataProfileId);
  }

  const entryCounts: Record<string, number> = {};
  for (const entry of sample.entries) {
    entryCounts[entry.kind] = entry.count;
  }

  const id = input.id?.trim() || createId("demosnap");
  if (snapshots.has(id)) throw new Error(`demo snapshot already exists: ${id}`);

  const payload = {
    entryCounts,
    workspaceId: tenant.demoWorkspaceId,
    productTenantId: tenant.productTenantId,
  };
  const snapshot: DemoSnapshot = {
    id,
    demoTenantId,
    sampleDataProfileId,
    status: "CAPTURED",
    checksum: checksum(JSON.stringify(payload)),
    payload,
    capturedAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function restoreDemoSnapshot(id: string): DemoSnapshot {
  const snapshot = snapshots.get(id.trim());
  if (!snapshot) throw new Error(`demo snapshot not found: ${id}`);
  if (snapshot.status === "INVALIDATED") {
    throw new Error(`snapshot invalidated: ${id}`);
  }

  if (!getSampleDataProfile(snapshot.sampleDataProfileId)) {
    throw new Error(
      `sample data profile not found: ${snapshot.sampleDataProfileId}`,
    );
  }

  seedSampleDataProfile(snapshot.sampleDataProfileId);
  if (snapshot.payload.workspaceId) {
    const workspace = getDemoWorkspace(snapshot.payload.workspaceId);
    if (workspace) setDemoWorkspaceStatus(workspace.id, "ACTIVE");
  }
  updateDemoTenant(snapshot.demoTenantId, { status: "ACTIVE" });

  snapshot.status = "RESTORED";
  snapshot.restoredAt = nowIso();
  snapshots.set(snapshot.id, snapshot);
  return cloneSnapshot(snapshot);
}

export function invalidateDemoSnapshot(id: string): DemoSnapshot {
  const snapshot = snapshots.get(id.trim());
  if (!snapshot) throw new Error(`demo snapshot not found: ${id}`);
  snapshot.status = "INVALIDATED";
  snapshots.set(snapshot.id, snapshot);
  return cloneSnapshot(snapshot);
}

export function resetDemoEnvironment(demoTenantId: string): {
  tenantId: string;
  sampleReset: number;
  snapshotCount: number;
} {
  const tenant = getDemoTenant(demoTenantId.trim());
  if (!tenant) throw new Error(`demo tenant not found: ${demoTenantId}`);

  let sampleReset = 0;
  for (const profile of listSampleDataProfiles({ demoTenantId: tenant.id })) {
    if (profile.seeded) {
      resetSampleDataProfile(profile.id);
      sampleReset += 1;
    }
  }

  if (tenant.demoWorkspaceId) {
    const workspace = getDemoWorkspace(tenant.demoWorkspaceId);
    if (workspace) setDemoWorkspaceStatus(workspace.id, "RESET");
  }

  updateDemoTenant(tenant.id, { status: "RESET" });

  return {
    tenantId: tenant.id,
    sampleReset,
    snapshotCount: listDemoSnapshots({ demoTenantId: tenant.id }).length,
  };
}

export function getDemoSnapshot(id: string): DemoSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listDemoSnapshots(filter?: {
  demoTenantId?: string;
  status?: SnapshotStatus;
}): DemoSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.demoTenantId) {
    const tid = filter.demoTenantId.trim();
    result = result.filter((s) => s.demoTenantId === tid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearDemoSnapshots(): void {
  snapshots.clear();
}
