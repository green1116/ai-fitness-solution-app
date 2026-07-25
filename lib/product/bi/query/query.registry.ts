/**
 * Product BI — Query registry
 */

import { getConnector } from "../connector/connector.registry";
import { BI_QUERY_KINDS } from "../integration/integration.constants";
import type {
  BiQuery,
  BiQueryKind,
  ExecuteBiQueryInput,
} from "./query.types";

const queries = new Map<string, BiQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: BiQuery): BiQuery {
  return { ...query, metadata: { ...query.metadata } };
}

export function executeBiQuery(input: ExecuteBiQueryInput): BiQuery {
  const connectorId = input.connectorId.trim();
  const expression = input.expression.trim();
  if (!connectorId) throw new Error("query.connectorId is required");
  if (!expression) throw new Error("query.expression is required");
  if (!(BI_QUERY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid bi query kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.matchCount) || input.matchCount < 0) {
    throw new Error("query.matchCount must be a non-negative number");
  }

  const connector = getConnector(connectorId);
  if (!connector) throw new Error(`connector not found: ${connectorId}`);
  if (connector.status !== "CONNECTED") {
    throw new Error(`connector not connected: ${connectorId}`);
  }

  const id = input.id?.trim() || createId("biqry");
  if (queries.has(id)) throw new Error(`bi query already exists: ${id}`);

  const query: BiQuery = {
    id,
    connectorId,
    kind: input.kind,
    expression,
    matchCount: input.matchCount,
    detail: `kind=${input.kind} matches=${input.matchCount}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  return cloneQuery(query);
}

export function getBiQuery(id: string): BiQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listBiQueries(filter?: {
  connectorId?: string;
  kind?: BiQueryKind;
}): BiQuery[] {
  let result = [...queries.values()];
  if (filter?.connectorId) {
    const connectorId = filter.connectorId.trim();
    result = result.filter((q) => q.connectorId === connectorId);
  }
  if (filter?.kind) result = result.filter((q) => q.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearBiQueries(): void {
  queries.clear();
}
