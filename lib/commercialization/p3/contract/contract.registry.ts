/**
 * Commercialization P3 — Contract registry
 */

import { CONTRACT_STATUSES } from "../pricing/pricing.constants";
import { getCommercialModel } from "../commercial/commercial.model";
import { getCommercialTerm } from "../commercial/commercial.terms";
import { acceptQuote, getCommercialQuote } from "../quote/quote.registry";
import type {
  CommercialContract,
  ContractStatus,
  RegisterContractInput,
} from "./contract.types";

const contracts = new Map<string, CommercialContract>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(contract: CommercialContract): CommercialContract {
  return {
    ...contract,
    termsIds: [...contract.termsIds],
    metadata: { ...contract.metadata },
  };
}

export function registerContract(
  input: RegisterContractInput,
): CommercialContract {
  const name = input.name.trim();
  const quoteId = input.quoteId.trim();
  const commercialModelId = input.commercialModelId.trim();
  if (!name) throw new Error("contract.name is required");

  let quote = getCommercialQuote(quoteId);
  if (!quote) throw new Error(`quote not found: ${quoteId}`);
  if (quote.status === "COMPOSED" || quote.status === "SENT") {
    quote = acceptQuote(quoteId);
  }
  if (quote.status !== "ACCEPTED") {
    throw new Error(
      `contract requires ACCEPTED quote (status=${quote.status})`,
    );
  }

  const model = getCommercialModel(commercialModelId);
  if (!model) {
    throw new Error(`commercial model not found: ${commercialModelId}`);
  }

  const termsIds = (input.termsIds ?? [])
    .map((t) => t.trim())
    .filter(Boolean);
  for (const termId of termsIds) {
    if (!getCommercialTerm(termId)) {
      throw new Error(`commercial term not found: ${termId}`);
    }
  }

  const termMonths = Math.max(
    model.minimumTermMonths,
    input.termMonths ?? model.minimumTermMonths,
  );
  const startDate = nowIso();
  const endDate = new Date(
    Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const id = input.id?.trim() || createId("contract");
  if (contracts.has(id)) {
    throw new Error(`contract already exists: ${id}`);
  }

  const status: ContractStatus = "DRAFT";
  if (!(CONTRACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid contract status: ${status}`);
  }

  const now = nowIso();
  const contract: CommercialContract = {
    id,
    name,
    quoteId,
    customerRef: quote.customerRef,
    commercialModelId,
    termsIds,
    status,
    value: quote.lineTotal,
    currency: quote.currency,
    startDate,
    endDate,
    detail: `status=${status} value=${quote.lineTotal} terms=${termsIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  contracts.set(id, contract);
  return cloneContract(contract);
}

export function setContractStatus(
  id: string,
  status: ContractStatus,
): CommercialContract {
  const contract = contracts.get(id.trim());
  if (!contract) throw new Error(`contract not found: ${id}`);
  if (!(CONTRACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid contract status: ${status}`);
  }
  contract.status = status;
  if (status === "ACTIVE") contract.activatedAt = nowIso();
  contract.updatedAt = nowIso();
  contract.detail = `status=${status} value=${contract.value} terms=${contract.termsIds.length}`;
  contracts.set(contract.id, contract);
  return cloneContract(contract);
}

export function getCommercialContract(
  id: string,
): CommercialContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listCommercialContracts(filter?: {
  status?: ContractStatus;
  customerRef?: string;
  quoteId?: string;
}): CommercialContract[] {
  let result = [...contracts.values()];
  if (filter?.status) result = result.filter((c) => c.status === filter.status);
  if (filter?.customerRef) {
    const cref = filter.customerRef.trim();
    result = result.filter((c) => c.customerRef === cref);
  }
  if (filter?.quoteId) {
    const qid = filter.quoteId.trim();
    result = result.filter((c) => c.quoteId === qid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneContract);
}

export function clearCommercialContracts(): void {
  contracts.clear();
}
