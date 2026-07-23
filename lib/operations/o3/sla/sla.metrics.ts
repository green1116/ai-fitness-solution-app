/**
 * Operations O3 — SLA metrics
 */

import { getTicket } from "../ticket/ticket.registry";
import { getSlaPolicy } from "./sla.policy";
import type { MeasureSlaMetricsInput, SlaMetrics } from "./sla.types";

const metrics = new Map<string, SlaMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(entry: SlaMetrics): SlaMetrics {
  return { ...entry };
}

export function measureSlaMetrics(
  input: MeasureSlaMetricsInput,
): SlaMetrics {
  const ticketId = input.ticketId.trim();
  const policyId = input.policyId.trim();
  if (!ticketId) throw new Error("slaMetrics.ticketId is required");
  if (!policyId) throw new Error("slaMetrics.policyId is required");
  if (!getTicket(ticketId)) {
    throw new Error(`ticket not found: ${ticketId}`);
  }
  const policy = getSlaPolicy(policyId);
  if (!policy) {
    throw new Error(`sla policy not found: ${policyId}`);
  }
  if (!Number.isFinite(input.elapsedMinutes) || input.elapsedMinutes < 0) {
    throw new Error("slaMetrics.elapsedMinutes must be a non-negative number");
  }

  const id = input.id?.trim() || createId("o3smet");
  if (metrics.has(id)) {
    throw new Error(`sla metrics already exists: ${id}`);
  }

  const elapsedMinutes = Math.round(input.elapsedMinutes);
  const withinSla = elapsedMinutes <= policy.thresholdMinutes;
  const entry: SlaMetrics = {
    id,
    ticketId,
    policyId,
    elapsedMinutes,
    withinSla,
    detail: `elapsed=${elapsedMinutes}m within=${withinSla}`,
    measuredAt: nowIso(),
  };
  metrics.set(id, entry);
  return cloneMetrics(entry);
}

export function getSlaMetrics(id: string): SlaMetrics | undefined {
  const entry = metrics.get(id.trim());
  return entry ? cloneMetrics(entry) : undefined;
}

export function listSlaMetrics(filter?: {
  ticketId?: string;
}): SlaMetrics[] {
  let result = [...metrics.values()];
  if (filter?.ticketId) {
    const tid = filter.ticketId.trim();
    result = result.filter((m) => m.ticketId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearSlaMetrics(): void {
  metrics.clear();
}
