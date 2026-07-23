/**
 * Operations O4 — Expansion opportunity
 */

import { getExpansionSignal } from "./expansion.signal";
import type {
  CreateExpansionOpportunityInput,
  ExpansionOpportunity,
} from "./expansion.types";

const opportunities = new Map<string, ExpansionOpportunity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOpportunity(
  opportunity: ExpansionOpportunity,
): ExpansionOpportunity {
  return { ...opportunity };
}

export function createExpansionOpportunity(
  input: CreateExpansionOpportunityInput,
): ExpansionOpportunity {
  const accountRef = input.accountRef.trim();
  const signalId = input.signalId.trim();
  if (!accountRef) throw new Error("opportunity.accountRef is required");
  if (!signalId) throw new Error("opportunity.signalId is required");
  if (!Number.isFinite(input.estimatedValue) || input.estimatedValue < 0) {
    throw new Error("opportunity.estimatedValue must be a non-negative number");
  }

  const signal = getExpansionSignal(signalId);
  if (!signal || signal.accountRef !== accountRef) {
    throw new Error(`expansion signal not found for account: ${accountRef}`);
  }

  const estimatedValue = Math.round(input.estimatedValue);
  const priority =
    signal.strength >= 75
      ? "HIGH"
      : signal.strength >= 50
        ? "MEDIUM"
        : "LOW";

  const id = input.id?.trim() || createId("o4opp");
  if (opportunities.has(id)) {
    throw new Error(`expansion opportunity already exists: ${id}`);
  }

  const opportunity: ExpansionOpportunity = {
    id,
    accountRef,
    signalId: signal.id,
    estimatedValue,
    priority,
    detail: `value=${estimatedValue} priority=${priority}`,
    createdAt: nowIso(),
  };
  opportunities.set(id, opportunity);
  return cloneOpportunity(opportunity);
}

export function getExpansionOpportunity(
  id: string,
): ExpansionOpportunity | undefined {
  const opportunity = opportunities.get(id.trim());
  return opportunity ? cloneOpportunity(opportunity) : undefined;
}

export function listExpansionOpportunities(filter?: {
  accountRef?: string;
}): ExpansionOpportunity[] {
  let result = [...opportunities.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((o) => o.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOpportunity);
}

export function clearExpansionOpportunities(): void {
  opportunities.clear();
}
