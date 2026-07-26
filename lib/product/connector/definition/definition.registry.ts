/**
 * Product Connector — definition registry (declaration only)
 */

import { getConnector } from "../registry/connector.registry";
import type {
  ConnectorDefinition,
  DefineConnectorDefinitionInput,
} from "./definition.types";

const definitions = new Map<string, ConnectorDefinition>();

const DIRECTIONS = ["INBOUND", "OUTBOUND", "BIDIRECTIONAL"] as const;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(
  definition: ConnectorDefinition,
): ConnectorDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function defineConnectorDefinition(
  input: DefineConnectorDefinitionInput,
): ConnectorDefinition {
  const connectorId = input.connectorId.trim();
  const operationKey = input.operationKey.trim().toUpperCase();
  const direction = input.direction.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!connectorId) throw new Error("definition.connectorId is required");
  if (!operationKey) throw new Error("definition.operationKey is required");
  if (!(DIRECTIONS as readonly string[]).includes(direction)) {
    throw new Error(`invalid definition direction: ${input.direction}`);
  }
  if (!summary) throw new Error("definition.summary is required");

  const connector = getConnector(connectorId);
  if (!connector) throw new Error(`connector not found: ${connectorId}`);
  if (connector.status === "RETIRED") {
    throw new Error(`connector retired: ${connectorId}`);
  }

  const duplicate = [...definitions.values()].find(
    (d) =>
      d.connectorId === connectorId && d.operationKey === operationKey,
  );
  if (duplicate) {
    throw new Error(`definition already exists: ${operationKey}`);
  }

  const id = input.id?.trim() || createId("conndef");
  if (definitions.has(id)) throw new Error(`definition already exists: ${id}`);

  const definition: ConnectorDefinition = {
    id,
    connectorId,
    operationKey,
    direction,
    summary,
    detail: `${operationKey} ${direction}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function getConnectorDefinition(
  id: string,
): ConnectorDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listConnectorDefinitions(filter?: {
  connectorId?: string;
}): ConnectorDefinition[] {
  let result = [...definitions.values()];
  if (filter?.connectorId) {
    const connectorId = filter.connectorId.trim();
    result = result.filter((d) => d.connectorId === connectorId);
  }
  return result
    .slice()
    .sort((a, b) => a.operationKey.localeCompare(b.operationKey))
    .map(cloneDefinition);
}

export function clearConnectorDefinitions(): void {
  definitions.clear();
}
