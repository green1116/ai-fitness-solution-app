/**
 * Product Connector — contract registry (shape reference only)
 */

import { CONNECTOR_CONTRACT_KINDS } from "../management/management.constants";
import { getConnectorDefinition } from "../definition/definition.registry";
import type {
  ConnectorContract,
  ConnectorContractKind,
  RegisterConnectorContractInput,
} from "./contract.types";

const contracts = new Map<string, ConnectorContract>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(contract: ConnectorContract): ConnectorContract {
  return { ...contract, metadata: { ...contract.metadata } };
}

export function registerConnectorContract(
  input: RegisterConnectorContractInput,
): ConnectorContract {
  const definitionId = input.definitionId.trim();
  const contractKey = input.contractKey.trim().toUpperCase();
  const shapeRef = input.shapeRef.trim().toUpperCase();
  if (!definitionId) throw new Error("contract.definitionId is required");
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (!shapeRef) throw new Error("contract.shapeRef is required");
  if (
    !(CONNECTOR_CONTRACT_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid contract kind: ${input.kind}`);
  }

  const definition = getConnectorDefinition(definitionId);
  if (!definition) throw new Error(`definition not found: ${definitionId}`);

  const duplicateKey = [...contracts.values()].find(
    (c) => c.definitionId === definitionId && c.contractKey === contractKey,
  );
  if (duplicateKey) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }

  const duplicateKind = [...contracts.values()].find(
    (c) => c.definitionId === definitionId && c.kind === input.kind,
  );
  if (duplicateKind) {
    throw new Error(`contract kind already registered: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("connctr");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const contract: ConnectorContract = {
    id,
    definitionId,
    contractKey,
    kind: input.kind,
    shapeRef,
    detail: `kind=${input.kind} shape=${shapeRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  contracts.set(id, contract);
  return cloneContract(contract);
}

export function getConnectorContract(
  id: string,
): ConnectorContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listConnectorContracts(filter?: {
  definitionId?: string;
  kind?: ConnectorContractKind;
}): ConnectorContract[] {
  let result = [...contracts.values()];
  if (filter?.definitionId) {
    const definitionId = filter.definitionId.trim();
    result = result.filter((c) => c.definitionId === definitionId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearConnectorContracts(): void {
  contracts.clear();
}
