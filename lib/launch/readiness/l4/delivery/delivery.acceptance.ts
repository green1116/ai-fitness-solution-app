/**
 * Launch L4 — Delivery acceptance
 */

import { DELIVERY_ACCEPTANCE_VERDICTS } from "../scenario/scenario.constants";
import { getScenario } from "../scenario/scenario.registry";
import { listValidationResults } from "../validation/validation.result";
import type {
  AcceptDeliveryInput,
  DeliveryAcceptance,
  DeliveryAcceptanceVerdict,
} from "./delivery.types";

const acceptances = new Map<string, DeliveryAcceptance>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAcceptance(
  acceptance: DeliveryAcceptance,
): DeliveryAcceptance {
  return { ...acceptance };
}

export function acceptEnterpriseDelivery(
  input: AcceptDeliveryInput,
): DeliveryAcceptance {
  const scenarioId = input.scenarioId.trim();
  if (!scenarioId) throw new Error("acceptance.scenarioId is required");
  if (!getScenario(scenarioId)) {
    throw new Error(`scenario not found: ${scenarioId}`);
  }

  const allowed: ReadonlyArray<
    Exclude<DeliveryAcceptanceVerdict, "PENDING">
  > = ["ACCEPTED", "REJECTED", "CONDITIONAL"];
  if (!allowed.includes(input.verdict)) {
    throw new Error(`invalid acceptance verdict: ${input.verdict}`);
  }
  if (
    !(DELIVERY_ACCEPTANCE_VERDICTS as readonly string[]).includes(
      input.verdict,
    )
  ) {
    throw new Error(`invalid acceptance verdict: ${input.verdict}`);
  }
  if (
    !Number.isFinite(input.score) ||
    input.score < 0 ||
    input.score > 100
  ) {
    throw new Error("acceptance.score must be between 0 and 100");
  }

  const validationResults = listValidationResults({ scenarioId });
  if (validationResults.length < 1) {
    throw new Error(`no validation results for scenario: ${scenarioId}`);
  }

  const id = input.id?.trim() || createId("l4acc");
  if (acceptances.has(id)) {
    throw new Error(`delivery acceptance already exists: ${id}`);
  }

  const score = Math.round(input.score);
  const notes = (input.notes ?? "").trim() || `verdict=${input.verdict}`;
  const acceptance: DeliveryAcceptance = {
    id,
    scenarioId,
    verdict: input.verdict,
    score,
    notes,
    detail: `verdict=${input.verdict} score=${score}`,
    acceptedAt: nowIso(),
  };
  acceptances.set(id, acceptance);
  return cloneAcceptance(acceptance);
}

export function getDeliveryAcceptance(
  id: string,
): DeliveryAcceptance | undefined {
  const acceptance = acceptances.get(id.trim());
  return acceptance ? cloneAcceptance(acceptance) : undefined;
}

export function listDeliveryAcceptances(filter?: {
  scenarioId?: string;
  verdict?: DeliveryAcceptanceVerdict;
}): DeliveryAcceptance[] {
  let result = [...acceptances.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((a) => a.scenarioId === sid);
  }
  if (filter?.verdict) {
    result = result.filter((a) => a.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAcceptance);
}

export function clearDeliveryAcceptances(): void {
  acceptances.clear();
}
