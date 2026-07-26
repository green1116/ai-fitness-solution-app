/**
 * Product Connector — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listConnectorBindings } from "../binding/binding.registry";
import { listConnectorContracts } from "../contract/contract.registry";
import { listConnectorDefinitions } from "../definition/definition.registry";
import { getConnector } from "../registry/connector.registry";

export type ConnectorReleaseManifest = {
  id: string;
  connectorId: string;
  connectorKey: string;
  checksum: string;
  definitionId: string;
  contractId: string;
  bindingId: string;
  createdAt: string;
};

const releases = new Map<string, ConnectorReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ConnectorReleaseManifest,
): ConnectorReleaseManifest {
  return { ...release };
}

export function createConnectorReleaseManifest(input: {
  id?: string;
  connectorId: string;
}): ConnectorReleaseManifest {
  const connectorId = input.connectorId.trim();
  if (!connectorId) throw new Error("manifest.connectorId is required");

  const connector = getConnector(connectorId);
  if (!connector) throw new Error(`connector not found: ${connectorId}`);

  const definitions = listConnectorDefinitions({ connectorId });
  if (definitions.length < 1) throw new Error("connector definition missing");
  const contracts = listConnectorContracts({
    definitionId: definitions[0].id,
  });
  if (contracts.length < 1) throw new Error("connector contract missing");
  const bindings = listConnectorBindings({ connectorId });
  const bound = bindings.find((b) => b.status === "BOUND");
  if (!bound) throw new Error("bound connector binding missing");

  const payload = {
    connectorKey: connector.connectorKey,
    kind: connector.kind,
    status: connector.status,
    definition: {
      operationKey: definitions[0].operationKey,
      direction: definitions[0].direction,
    },
    contract: {
      contractKey: contracts[0].contractKey,
      kind: contracts[0].kind,
      shapeRef: contracts[0].shapeRef,
    },
    binding: {
      bindingKey: bound.bindingKey,
      listingKeyRef: bound.listingKeyRef,
      status: bound.status,
    },
  };

  const id = input.id?.trim() || createId("connrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ConnectorReleaseManifest = {
    id,
    connectorId,
    connectorKey: connector.connectorKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    definitionId: definitions[0].id,
    contractId: contracts[0].id,
    bindingId: bound.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getConnectorReleaseManifest(
  id: string,
): ConnectorReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listConnectorReleaseManifests(): ConnectorReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearConnectorReleaseManifests(): void {
  releases.clear();
}
