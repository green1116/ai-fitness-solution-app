/**
 * Evolution P6 — Extension Registry
 */

import {
  EXTENSION_KINDS,
  EXTENSION_STATUSES,
} from "./marketplace.constants";
import { getMarketplaceProfile } from "./marketplace.model";
import { getPartner } from "./marketplace.partner";
import type {
  ExtensionKind,
  ExtensionRecord,
  ExtensionStatus,
  RegisterExtensionInput,
} from "./marketplace.types";

const extensions = new Map<string, ExtensionRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExtension(extension: ExtensionRecord): ExtensionRecord {
  return { ...extension };
}

export function registerExtension(
  input: RegisterExtensionInput,
): ExtensionRecord {
  const marketplace = getMarketplaceProfile(input.marketplaceId.trim());
  if (!marketplace) {
    throw new Error(`marketplace profile not found: ${input.marketplaceId}`);
  }

  const partner = getPartner(input.partnerId.trim());
  if (!partner || partner.marketplaceId !== marketplace.id) {
    throw new Error(`partner not found: ${input.partnerId}`);
  }
  if (partner.status !== "ACTIVE") {
    throw new Error(`partner not active: ${partner.status}`);
  }

  const name = input.name.trim();
  if (!name) throw new Error("extension.name is required");

  const kind = input.kind;
  if (!(EXTENSION_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid extension kind: ${kind}`);
  }

  const status: ExtensionStatus = input.status ?? "PUBLISHED";
  if (!(EXTENSION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid extension status: ${status}`);
  }

  const version = (input.version ?? "1.0.0").trim();
  const id = input.id?.trim() || createId("ext");
  if (extensions.has(id)) {
    throw new Error(`extension already exists: ${id}`);
  }

  const now = nowIso();
  const extension: ExtensionRecord = {
    id,
    marketplaceId: marketplace.id,
    partnerId: partner.id,
    name,
    kind,
    status,
    version,
    detail: `kind=${kind} status=${status} version=${version}`,
    registeredAt: now,
    publishedAt: status === "PUBLISHED" ? now : undefined,
  };
  extensions.set(id, extension);
  return cloneExtension(extension);
}

export function getExtension(id: string): ExtensionRecord | undefined {
  const extension = extensions.get(id.trim());
  return extension ? cloneExtension(extension) : undefined;
}

export function listExtensions(filter?: {
  marketplaceId?: string;
  partnerId?: string;
  kind?: ExtensionKind;
  status?: ExtensionStatus;
}): ExtensionRecord[] {
  let result = [...extensions.values()];
  if (filter?.marketplaceId) {
    const mid = filter.marketplaceId.trim();
    result = result.filter((e) => e.marketplaceId === mid);
  }
  if (filter?.partnerId) {
    const pid = filter.partnerId.trim();
    result = result.filter((e) => e.partnerId === pid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.status) result = result.filter((e) => e.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExtension);
}

export function clearExtensions(): void {
  extensions.clear();
}
