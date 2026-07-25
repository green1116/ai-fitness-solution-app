/**
 * Product Identity — Token registry
 */

import { TOKEN_KINDS } from "../authentication/authentication.constants";
import { getSession } from "../session/session.registry";
import type {
  IdentityToken,
  IssueTokenInput,
  TokenKind,
} from "./token.types";

const tokens = new Map<string, IdentityToken>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneToken(token: IdentityToken): IdentityToken {
  return { ...token, metadata: { ...token.metadata } };
}

export function issueToken(input: IssueTokenInput): IdentityToken {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("token.sessionId is required");
  if (!(TOKEN_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid token kind: ${input.kind}`);
  }
  const session = getSession(sessionId);
  if (!session) throw new Error(`session not found: ${sessionId}`);
  if (session.status !== "ACTIVE") {
    throw new Error(`session not active: ${sessionId}`);
  }

  const id = input.id?.trim() || createId("idtok");
  if (tokens.has(id)) throw new Error(`token already exists: ${id}`);

  const value =
    (input.value ?? "").trim() ||
    `tok_${input.kind.toLowerCase()}_${Math.random().toString(36).slice(2, 12)}`;
  const token: IdentityToken = {
    id,
    sessionId,
    principalId: session.principalId,
    kind: input.kind,
    value,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  tokens.set(id, token);
  return cloneToken(token);
}

export function getToken(id: string): IdentityToken | undefined {
  const token = tokens.get(id.trim());
  return token ? cloneToken(token) : undefined;
}

export function listTokens(filter?: {
  sessionId?: string;
  kind?: TokenKind;
}): IdentityToken[] {
  let result = [...tokens.values()];
  if (filter?.sessionId) {
    const sid = filter.sessionId.trim();
    result = result.filter((t) => t.sessionId === sid);
  }
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneToken);
}

export function clearTokens(): void {
  tokens.clear();
}
