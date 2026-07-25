/**
 * Product Admin — Setting registry
 */

import { getAdminTenant } from "../tenant/tenant.registry";
import { ADMIN_SETTING_SCOPES } from "../foundation/foundation.constants";
import type {
  AdminSetting,
  AdminSettingScope,
  RegisterAdminSettingInput,
} from "./setting.types";

const settings = new Map<string, AdminSetting>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSetting(setting: AdminSetting): AdminSetting {
  return { ...setting, metadata: { ...setting.metadata } };
}

export function registerAdminSetting(
  input: RegisterAdminSettingInput,
): AdminSetting {
  const key = input.key.trim().toUpperCase();
  const value = input.value.trim();
  if (!key) throw new Error("setting.key is required");
  if (!value) throw new Error("setting.value is required");
  if (!(ADMIN_SETTING_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid setting scope: ${input.scope}`);
  }

  const tenantId = input.tenantId?.trim();
  if (input.scope === "TENANT") {
    if (!tenantId) throw new Error("setting.tenantId required for TENANT");
    if (!getAdminTenant(tenantId)) {
      throw new Error(`tenant not found: ${tenantId}`);
    }
  }

  const duplicate = [...settings.values()].find(
    (s) =>
      s.key === key &&
      s.scope === input.scope &&
      (s.tenantId ?? "") === (tenantId ?? ""),
  );
  if (duplicate) throw new Error(`setting already exists: ${key}`);

  const id = input.id?.trim() || createId("admset");
  if (settings.has(id)) throw new Error(`setting already exists: ${id}`);

  const setting: AdminSetting = {
    id,
    key,
    scope: input.scope,
    value,
    ...(tenantId ? { tenantId } : {}),
    detail: `scope=${input.scope} key=${key}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  settings.set(id, setting);
  return cloneSetting(setting);
}

export function getAdminSetting(id: string): AdminSetting | undefined {
  const setting = settings.get(id.trim());
  return setting ? cloneSetting(setting) : undefined;
}

export function listAdminSettings(filter?: {
  scope?: AdminSettingScope;
  tenantId?: string;
}): AdminSetting[] {
  let result = [...settings.values()];
  if (filter?.scope) result = result.filter((s) => s.scope === filter.scope);
  if (filter?.tenantId) {
    const tenantId = filter.tenantId.trim();
    result = result.filter((s) => s.tenantId === tenantId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSetting);
}

export function clearAdminSettings(): void {
  settings.clear();
}
