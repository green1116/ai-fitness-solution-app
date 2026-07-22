/**
 * Commercialization P3 — Contract lifecycle
 */

import { CONTRACT_STATUSES } from "../pricing/pricing.constants";
import {
  getCommercialContract,
  setContractStatus,
} from "./contract.registry";
import type {
  ContractLifecycleRecord,
  ContractStatus,
  TransitionContractInput,
} from "./contract.types";

const lifecycles = new Map<string, ContractLifecycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(
  record: ContractLifecycleRecord,
): ContractLifecycleRecord {
  return { ...record };
}

export function transitionContract(
  input: TransitionContractInput,
): ContractLifecycleRecord {
  const contractId = input.contractId.trim();
  const contract = getCommercialContract(contractId);
  if (!contract) throw new Error(`contract not found: ${contractId}`);

  const status = input.status;
  if (!(CONTRACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid contract status: ${status}`);
  }

  const previousStatus = contract.status;
  if (previousStatus === "DRAFT" && status === "ACTIVE") {
    setContractStatus(contractId, "PENDING");
  }
  setContractStatus(contractId, status);

  const id = input.id?.trim() || createId("clife");
  if (lifecycles.has(id)) {
    throw new Error(`contract lifecycle record already exists: ${id}`);
  }

  const record: ContractLifecycleRecord = {
    id,
    contractId,
    status,
    previousStatus,
    reason:
      (input.reason ?? `transition ${previousStatus}→${status}`).trim(),
    transitionedAt: nowIso(),
  };
  lifecycles.set(id, record);
  return cloneRecord(record);
}

export function getContractLifecycleRecord(
  id: string,
): ContractLifecycleRecord | undefined {
  const record = lifecycles.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listContractLifecycleRecords(filter?: {
  contractId?: string;
  status?: ContractStatus;
}): ContractLifecycleRecord[] {
  let result = [...lifecycles.values()];
  if (filter?.contractId) {
    const cid = filter.contractId.trim();
    result = result.filter((r) => r.contractId === cid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearContractLifecycleRecords(): void {
  lifecycles.clear();
}
