/**
 * Product P10 — Entitlement registry
 */

import { ENTITLEMENT_KINDS } from "../subscription/subscription.constants";
import { getSubscription } from "../subscription/subscription.registry";
import type {
  Entitlement,
  EntitlementKind,
  GrantEntitlementInput,
} from "./entitlement.types";

const entitlements = new Map<string, Entitlement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntitlement(entitlement: Entitlement): Entitlement {
  return { ...entitlement, metadata: { ...entitlement.metadata } };
}

export function grantEntitlement(
  input: GrantEntitlementInput,
): Entitlement {
  const subscriptionId = input.subscriptionId.trim();
  const code = input.code.trim();
  if (!subscriptionId) {
    throw new Error("entitlement.subscriptionId is required");
  }
  if (!code) throw new Error("entitlement.code is required");
  if (!(ENTITLEMENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid entitlement kind: ${input.kind}`);
  }
  if (!getSubscription(subscriptionId)) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }

  const id = input.id?.trim() || createId("p10ent");
  if (entitlements.has(id)) {
    throw new Error(`entitlement already exists: ${id}`);
  }

  const enabled = input.enabled !== false;
  const entitlement: Entitlement = {
    id,
    subscriptionId,
    kind: input.kind,
    code,
    enabled,
    detail: `kind=${input.kind} code=${code} enabled=${enabled}`,
    metadata: { ...(input.metadata ?? {}) },
    grantedAt: nowIso(),
  };
  entitlements.set(id, entitlement);
  return cloneEntitlement(entitlement);
}

export function getEntitlement(id: string): Entitlement | undefined {
  const entitlement = entitlements.get(id.trim());
  return entitlement ? cloneEntitlement(entitlement) : undefined;
}

export function listEntitlements(filter?: {
  subscriptionId?: string;
  kind?: EntitlementKind;
}): Entitlement[] {
  let result = [...entitlements.values()];
  if (filter?.subscriptionId) {
    const sid = filter.subscriptionId.trim();
    result = result.filter((e) => e.subscriptionId === sid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntitlement);
}

export function clearEntitlements(): void {
  entitlements.clear();
}
