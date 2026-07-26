/**
 * Product App — registry
 */

import { APP_KINDS, APP_STATUSES } from "../management/management.constants";
import type {
  AppKind,
  AppStatus,
  ProductApp,
  RegisterAppInput,
  UpdateAppStatusInput,
} from "./app.types";

const apps = new Map<string, ProductApp>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneApp(app: ProductApp): ProductApp {
  return { ...app, metadata: { ...app.metadata } };
}

export function registerApp(input: RegisterAppInput): ProductApp {
  const appKey = input.appKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!appKey) throw new Error("app.appKey is required");
  if (!name) throw new Error("app.name is required");
  if (!(APP_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid app kind: ${input.kind}`);
  }
  if (keys.has(appKey)) {
    throw new Error(`appKey already exists: ${appKey}`);
  }

  const id = input.id?.trim() || createId("app");
  if (apps.has(id)) throw new Error(`app already exists: ${id}`);

  const now = nowIso();
  const app: ProductApp = {
    id,
    appKey,
    name,
    kind: input.kind,
    status: APP_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  apps.set(id, app);
  keys.set(appKey, id);
  return cloneApp(app);
}

export function updateAppStatus(input: UpdateAppStatusInput): ProductApp {
  const appId = input.appId.trim();
  if (!appId) throw new Error("app.appId is required");
  if (!(APP_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid app status: ${input.status}`);
  }

  const existing = apps.get(appId);
  if (!existing) throw new Error(`app not found: ${appId}`);

  const updated: ProductApp = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  apps.set(appId, updated);
  return cloneApp(updated);
}

export function getApp(id: string): ProductApp | undefined {
  const app = apps.get(id.trim());
  return app ? cloneApp(app) : undefined;
}

export function listApps(filter?: {
  kind?: AppKind;
  status?: AppStatus;
}): ProductApp[] {
  let result = [...apps.values()];
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.appKey.localeCompare(b.appKey))
    .map(cloneApp);
}

export function clearApps(): void {
  apps.clear();
  keys.clear();
}
