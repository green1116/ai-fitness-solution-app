/**
 * Product Delivery — Dispatch contract registry (no provider SDK)
 */

import { DELIVERY_DISPATCH_CONTRACT_STATUSES } from "../management/management.constants";
import { getDeliveryRequest } from "../request/request.registry";
import type {
  DeliveryDispatchContract,
  DeliveryDispatchContractStatus,
  RegisterDeliveryDispatchContractInput,
  UpdateDeliveryDispatchContractStatusInput,
} from "./dispatch.types";

const contracts = new Map<string, DeliveryDispatchContract>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: DeliveryDispatchContract,
): DeliveryDispatchContract {
  return { ...contract, metadata: { ...contract.metadata } };
}

export function registerDeliveryDispatchContract(
  input: RegisterDeliveryDispatchContractInput,
): DeliveryDispatchContract {
  const requestId = input.requestId.trim();
  const channelKey = input.channelKey.trim().toUpperCase();
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!requestId) throw new Error("dispatch.requestId is required");
  if (!channelKey) throw new Error("dispatch.channelKey is required");
  if (!contractKey) throw new Error("dispatch.contractKey is required");

  const request = getDeliveryRequest(requestId);
  if (!request) throw new Error(`request not found: ${requestId}`);
  if (request.channelKey !== channelKey) {
    throw new Error(`dispatch channelKey mismatch: ${channelKey}`);
  }

  const duplicate = [...contracts.values()].find(
    (c) => c.requestId === requestId,
  );
  if (duplicate) {
    throw new Error(`dispatch contract already exists: ${requestId}`);
  }

  const id = input.id?.trim() || createId("dlvdsp");
  if (contracts.has(id)) throw new Error(`dispatch contract already exists: ${id}`);

  const now = nowIso();
  const contract: DeliveryDispatchContract = {
    id,
    requestId,
    channelKey,
    contractKey,
    status: DELIVERY_DISPATCH_CONTRACT_STATUSES[0],
    detail: `contract=${contractKey} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  contracts.set(id, contract);
  return cloneContract(contract);
}

export function updateDeliveryDispatchContractStatus(
  input: UpdateDeliveryDispatchContractStatusInput,
): DeliveryDispatchContract {
  const contractId = input.contractId.trim();
  if (!contractId) throw new Error("dispatch.contractId is required");
  if (
    !(DELIVERY_DISPATCH_CONTRACT_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid dispatch status: ${input.status}`);
  }

  const existing = contracts.get(contractId);
  if (!existing) throw new Error(`dispatch contract not found: ${contractId}`);

  const updated: DeliveryDispatchContract = {
    ...existing,
    status: input.status,
    detail: `contract=${existing.contractKey} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  contracts.set(contractId, updated);
  return cloneContract(updated);
}

export function getDeliveryDispatchContract(
  id: string,
): DeliveryDispatchContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listDeliveryDispatchContracts(filter?: {
  requestId?: string;
  status?: DeliveryDispatchContractStatus;
}): DeliveryDispatchContract[] {
  let result = [...contracts.values()];
  if (filter?.requestId) {
    const requestId = filter.requestId.trim();
    result = result.filter((c) => c.requestId === requestId);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneContract);
}

export function clearDeliveryDispatchContracts(): void {
  contracts.clear();
}
