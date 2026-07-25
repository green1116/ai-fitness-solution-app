/**
 * Product Session — Token flow registry
 */

import {
  TOKEN_FLOW_KINDS,
  TOKEN_FLOW_STATUSES,
} from "../control/control.constants";
import { getSession } from "../lifecycle/lifecycle.registry";
import type {
  FlowToken,
  IssueFlowTokenInput,
  RevokeTokenInput,
  RotateTokenInput,
  TokenFlowKind,
  TokenFlowStatus,
} from "./token.types";

const tokens = new Map<string, FlowToken>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneToken(token: FlowToken): FlowToken {
  return { ...token, metadata: { ...token.metadata } };
}

function makeValue(kind: TokenFlowKind): string {
  return `tok_${kind.toLowerCase()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function issueToken(input: IssueFlowTokenInput): FlowToken {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("token.sessionId is required");
  if (!(TOKEN_FLOW_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid token kind: ${input.kind}`);
  }
  const session = getSession(sessionId);
  if (!session) throw new Error(`session not found: ${sessionId}`);
  if (session.status !== "ACTIVE") {
    throw new Error(`session not active: ${sessionId}`);
  }

  const id = input.id?.trim() || createId("sctok");
  if (tokens.has(id)) throw new Error(`token already exists: ${id}`);

  const value = (input.value ?? "").trim() || makeValue(input.kind);
  const token: FlowToken = {
    id,
    sessionId,
    principalId: session.principalId,
    kind: input.kind,
    status: TOKEN_FLOW_STATUSES[0],
    value,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  tokens.set(id, token);
  return cloneToken(token);
}

export function rotateToken(input: RotateTokenInput): FlowToken {
  const tokenId = input.tokenId.trim();
  if (!tokenId) throw new Error("token.tokenId is required");
  const existing = tokens.get(tokenId);
  if (!existing) throw new Error(`token not found: ${tokenId}`);
  if (existing.status !== "ACTIVE") {
    throw new Error(`token not rotatable: ${tokenId}`);
  }

  const session = getSession(existing.sessionId);
  if (!session || session.status !== "ACTIVE") {
    throw new Error(`session not active for token: ${tokenId}`);
  }

  const value = (input.value ?? "").trim() || makeValue(existing.kind);
  const now = nowIso();
  const updated: FlowToken = {
    ...existing,
    status: "ACTIVE",
    value,
    detail: `kind=${existing.kind} status=ACTIVE rotated`,
    metadata: { ...existing.metadata },
    rotatedAt: now,
  };
  tokens.set(tokenId, updated);
  return cloneToken(updated);
}

export function revokeToken(input: RevokeTokenInput): FlowToken {
  const tokenId = input.tokenId.trim();
  if (!tokenId) throw new Error("token.tokenId is required");
  const existing = tokens.get(tokenId);
  if (!existing) throw new Error(`token not found: ${tokenId}`);
  if (existing.status === "REVOKED" || existing.status === "EXPIRED") {
    throw new Error(`token already revoked: ${tokenId}`);
  }

  const status = input.status ?? "REVOKED";
  const updated: FlowToken = {
    ...existing,
    status,
    detail: `kind=${existing.kind} status=${status}`,
    metadata: { ...existing.metadata },
    revokedAt: nowIso(),
  };
  tokens.set(tokenId, updated);
  return cloneToken(updated);
}

export function getToken(id: string): FlowToken | undefined {
  const token = tokens.get(id.trim());
  return token ? cloneToken(token) : undefined;
}

export function listTokens(filter?: {
  sessionId?: string;
  kind?: TokenFlowKind;
  status?: TokenFlowStatus;
}): FlowToken[] {
  let result = [...tokens.values()];
  if (filter?.sessionId) {
    const sid = filter.sessionId.trim();
    result = result.filter((t) => t.sessionId === sid);
  }
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneToken);
}

export function clearTokens(): void {
  tokens.clear();
}
