/**
 * Commercialization P1 — Sales opportunity registry
 */

import {
  OPPORTUNITY_STATUSES,
  PIPELINE_STAGES,
} from "./sales.constants";
import type {
  OpportunityStatus,
  PipelineStage,
  RegisterOpportunityInput,
  SalesOpportunity,
} from "./sales.types";
import { getSalesCustomer } from "../customer/customer.registry";
import { getCommercialOffer } from "../offer/offer.catalog";

const opportunities = new Map<string, SalesOpportunity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOpportunity(op: SalesOpportunity): SalesOpportunity {
  return { ...op, metadata: { ...op.metadata } };
}

function clampProbability(stage: PipelineStage, status: OpportunityStatus): number {
  if (status === "WON") return 100;
  if (status === "LOST") return 0;
  const map: Record<PipelineStage, number> = {
    LEAD: 10,
    QUALIFIED: 25,
    PROPOSAL: 45,
    NEGOTIATION: 65,
    CLOSED_WON: 100,
    CLOSED_LOST: 0,
  };
  return map[stage];
}

export function registerOpportunity(
  input: RegisterOpportunityInput,
): SalesOpportunity {
  const name = input.name.trim();
  const customerId = input.customerId.trim();
  const offerId = input.offerId.trim();

  if (!name) throw new Error("opportunity.name is required");
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("opportunity.amount must be a non-negative number");
  }
  if (!getSalesCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }
  if (!getCommercialOffer(offerId)) {
    throw new Error(`offer not found: ${offerId}`);
  }

  const stage: PipelineStage = input.stage ?? "LEAD";
  if (!(PIPELINE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid pipeline stage: ${stage}`);
  }

  let status: OpportunityStatus = input.status ?? "OPEN";
  if (stage === "CLOSED_WON") status = "WON";
  if (stage === "CLOSED_LOST") status = "LOST";
  if (!(OPPORTUNITY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid opportunity status: ${status}`);
  }

  const id = input.id?.trim() || createId("opp");
  if (opportunities.has(id)) {
    throw new Error(`opportunity already exists: ${id}`);
  }

  const now = nowIso();
  const opportunity: SalesOpportunity = {
    id,
    name,
    customerId,
    offerId,
    amount: Math.round(input.amount),
    currency: (input.currency ?? "USD").trim().toUpperCase() || "USD",
    stage,
    status,
    probability: clampProbability(stage, status),
    owner: (input.owner ?? "unassigned").trim() || "unassigned",
    detail: `stage=${stage} status=${status} amount=${Math.round(input.amount)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  opportunities.set(id, opportunity);
  return cloneOpportunity(opportunity);
}

export function updateOpportunityStage(
  id: string,
  stage: PipelineStage,
): SalesOpportunity {
  const opportunity = opportunities.get(id.trim());
  if (!opportunity) throw new Error(`opportunity not found: ${id}`);
  if (!(PIPELINE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid pipeline stage: ${stage}`);
  }

  opportunity.stage = stage;
  if (stage === "CLOSED_WON") opportunity.status = "WON";
  else if (stage === "CLOSED_LOST") opportunity.status = "LOST";
  else if (opportunity.status === "WON" || opportunity.status === "LOST") {
    opportunity.status = "OPEN";
  }
  opportunity.probability = clampProbability(
    opportunity.stage,
    opportunity.status,
  );
  opportunity.updatedAt = nowIso();
  opportunity.detail = `stage=${opportunity.stage} status=${opportunity.status} amount=${opportunity.amount}`;
  opportunities.set(opportunity.id, opportunity);
  return cloneOpportunity(opportunity);
}

export function getOpportunity(id: string): SalesOpportunity | undefined {
  const opportunity = opportunities.get(id.trim());
  return opportunity ? cloneOpportunity(opportunity) : undefined;
}

export function listOpportunities(filter?: {
  customerId?: string;
  offerId?: string;
  status?: OpportunityStatus;
  stage?: PipelineStage;
}): SalesOpportunity[] {
  let result = [...opportunities.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((o) => o.customerId === cid);
  }
  if (filter?.offerId) {
    const oid = filter.offerId.trim();
    result = result.filter((o) => o.offerId === oid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  if (filter?.stage) result = result.filter((o) => o.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOpportunity);
}

export function clearOpportunities(): void {
  opportunities.clear();
}
