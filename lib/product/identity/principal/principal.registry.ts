/**
 * Product Identity — Principal registry
 */

import { PRINCIPAL_KINDS } from "../authentication/authentication.constants";
import type {
  IdentityPrincipal,
  PrincipalKind,
  RegisterPrincipalInput,
} from "./principal.types";

const principals = new Map<string, IdentityPrincipal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrincipal(principal: IdentityPrincipal): IdentityPrincipal {
  return { ...principal, metadata: { ...principal.metadata } };
}

export function registerPrincipal(
  input: RegisterPrincipalInput,
): IdentityPrincipal {
  const subject = input.subject.trim();
  const displayName = input.displayName.trim();
  if (!subject) throw new Error("principal.subject is required");
  if (!displayName) throw new Error("principal.displayName is required");
  if (!(PRINCIPAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid principal kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("idprn");
  if (principals.has(id)) {
    throw new Error(`principal already exists: ${id}`);
  }

  const principal: IdentityPrincipal = {
    id,
    kind: input.kind,
    subject,
    displayName,
    detail: `kind=${input.kind} subject=${subject}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  principals.set(id, principal);
  return clonePrincipal(principal);
}

export function getPrincipal(id: string): IdentityPrincipal | undefined {
  const principal = principals.get(id.trim());
  return principal ? clonePrincipal(principal) : undefined;
}

export function listPrincipals(filter?: {
  kind?: PrincipalKind;
}): IdentityPrincipal[] {
  let result = [...principals.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePrincipal);
}

export function clearPrincipals(): void {
  principals.clear();
}
