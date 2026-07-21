/**
 * Launch P3 — Demo Workspace
 * Integrates E12 tenant workspace + product tenant
 */

import {
  registerProductTenant,
  setProductTenantStatus,
} from "../../product/e12/tenant/tenant.product";
import { createWorkspace } from "../../product/e12/tenant/tenant.workspace";
import { DEMO_WORKSPACE_STATUSES } from "./demo.constants";
import { getDemoTenant, updateDemoTenant } from "./demo.tenant";
import type {
  CreateDemoWorkspaceInput,
  DemoWorkspace,
  DemoWorkspaceStatus,
} from "./demo.types";

const workspaces = new Map<string, DemoWorkspace>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkspace(workspace: DemoWorkspace): DemoWorkspace {
  return { ...workspace, metadata: { ...workspace.metadata } };
}

export function createDemoWorkspace(
  input: CreateDemoWorkspaceInput,
): DemoWorkspace {
  const demoTenantId = input.demoTenantId.trim();
  const demoTenant = getDemoTenant(demoTenantId);
  if (!demoTenant) throw new Error(`demo tenant not found: ${demoTenantId}`);

  const name = input.name?.trim() || `${demoTenant.name} Demo Workspace`;
  const slug =
    input.slug?.trim().toLowerCase() ||
    `demo-${demoTenant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;

  const status = input.status ?? "ACTIVE";
  if (!(DEMO_WORKSPACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid demo workspace status: ${status}`);
  }

  const workspace = createWorkspace({
    id: `${demoTenantId}.ws`,
    name,
    slug,
  });

  const productTenant = registerProductTenant({
    id: `${demoTenantId}.ptenant`,
    name: `${demoTenant.name} Demo Tenant`,
    productId: demoTenant.productId,
    workspaceId: workspace.id,
  });
  setProductTenantStatus(productTenant.id, "ACTIVE");

  const id = input.id?.trim() || createId("demows");
  if (workspaces.has(id)) throw new Error(`demo workspace already exists: ${id}`);

  const demoWorkspace: DemoWorkspace = {
    id,
    demoTenantId,
    workspaceId: workspace.id,
    name,
    slug,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  workspaces.set(id, demoWorkspace);

  updateDemoTenant(demoTenantId, {
    demoWorkspaceId: id,
    productTenantId: productTenant.id,
    status: "READY",
  });

  return cloneWorkspace(demoWorkspace);
}

export function getDemoWorkspace(id: string): DemoWorkspace | undefined {
  const workspace = workspaces.get(id.trim());
  return workspace ? cloneWorkspace(workspace) : undefined;
}

export function listDemoWorkspaces(filter?: {
  demoTenantId?: string;
  status?: DemoWorkspaceStatus;
}): DemoWorkspace[] {
  let result = [...workspaces.values()];
  if (filter?.demoTenantId) {
    const tid = filter.demoTenantId.trim();
    result = result.filter((w) => w.demoTenantId === tid);
  }
  if (filter?.status) result = result.filter((w) => w.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkspace);
}

export function setDemoWorkspaceStatus(
  id: string,
  status: DemoWorkspaceStatus,
): DemoWorkspace {
  const workspace = workspaces.get(id.trim());
  if (!workspace) throw new Error(`demo workspace not found: ${id}`);
  if (!(DEMO_WORKSPACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid demo workspace status: ${status}`);
  }
  workspace.status = status;
  workspaces.set(workspace.id, workspace);
  return cloneWorkspace(workspace);
}

export function clearDemoWorkspaces(): void {
  workspaces.clear();
}
