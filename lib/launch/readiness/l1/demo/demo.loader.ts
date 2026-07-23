/**
 * Launch L1 — Demo loader
 */

import { listArtifacts } from "../artifact/artifact.registry";
import { getProjectScenario } from "../project/project.scenario";
import { getTenant } from "../tenant/tenant.registry";
import { DEMO_LOAD_STATUSES } from "./demo.constants";
import type { DemoBundle, DemoLoadStatus, LoadDemoInput } from "./demo.types";

const bundles = new Map<string, DemoBundle>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBundle(bundle: DemoBundle): DemoBundle {
  return {
    ...bundle,
    artifactIds: [...bundle.artifactIds],
    metadata: { ...bundle.metadata },
  };
}

export function loadDemoBundle(input: LoadDemoInput): DemoBundle {
  const tenantId = input.tenantId.trim();
  const projectId = input.projectId.trim();
  if (!tenantId) throw new Error("demo.tenantId is required");
  if (!projectId) throw new Error("demo.projectId is required");
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }
  const project = getProjectScenario(projectId);
  if (!project) {
    throw new Error(`project not found: ${projectId}`);
  }
  if (project.tenantId !== tenantId) {
    throw new Error(
      `project ${projectId} does not belong to tenant ${tenantId}`,
    );
  }

  const artifacts = listArtifacts({ projectId });
  const id = input.id?.trim() || createId("l1dem");
  if (bundles.has(id)) {
    throw new Error(`demo bundle already exists: ${id}`);
  }

  const status: DemoLoadStatus = "LOADED";
  if (!(DEMO_LOAD_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid demo load status: ${status}`);
  }

  const name =
    (input.name ?? "").trim() || `${project.name} Demo Bundle`;
  const bundle: DemoBundle = {
    id,
    tenantId,
    projectId,
    name,
    status,
    seedCount: 0,
    artifactIds: artifacts.map((a) => a.id),
    detail: `status=${status} artifacts=${artifacts.length}`,
    metadata: { ...(input.metadata ?? {}) },
    loadedAt: nowIso(),
  };
  bundles.set(id, bundle);
  return cloneBundle(bundle);
}

export function incrementBundleSeedCount(bundleId: string): DemoBundle {
  const bundle = bundles.get(bundleId.trim());
  if (!bundle) throw new Error(`demo bundle not found: ${bundleId}`);
  bundle.seedCount += 1;
  bundle.detail = `status=${bundle.status} artifacts=${bundle.artifactIds.length} seeds=${bundle.seedCount}`;
  bundles.set(bundle.id, bundle);
  return cloneBundle(bundle);
}

export function getDemoBundle(id: string): DemoBundle | undefined {
  const bundle = bundles.get(id.trim());
  return bundle ? cloneBundle(bundle) : undefined;
}

export function listDemoBundles(filter?: {
  tenantId?: string;
  projectId?: string;
  status?: DemoLoadStatus;
}): DemoBundle[] {
  let result = [...bundles.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((b) => b.tenantId === tid);
  }
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((b) => b.projectId === pid);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBundle);
}

export function clearDemoBundles(): void {
  bundles.clear();
}
