/**
 * Commercialization P5 — Quality acceptance
 */

import { ACCEPTANCE_VERDICTS } from "../delivery/delivery.constants";
import { getDeliveryPlan } from "../delivery/delivery.registry";
import { listQualityChecks } from "./quality.checks";
import type {
  AcceptanceRecord,
  AcceptanceVerdict,
  RecordAcceptanceInput,
} from "./quality.types";

const acceptances = new Map<string, AcceptanceRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAcceptance(
  record: AcceptanceRecord,
): AcceptanceRecord {
  return { ...record };
}

export function recordAcceptance(
  input: RecordAcceptanceInput,
): AcceptanceRecord {
  const deliveryId = input.deliveryId.trim();
  if (!(ACCEPTANCE_VERDICTS as readonly string[]).includes(input.verdict)) {
    throw new Error(`invalid acceptance verdict: ${input.verdict}`);
  }

  const delivery = getDeliveryPlan(deliveryId);
  if (!delivery) throw new Error(`delivery plan not found: ${deliveryId}`);

  const checks = listQualityChecks({ deliveryId });
  if (checks.length === 0) {
    throw new Error(`acceptance requires quality checks: ${deliveryId}`);
  }

  const passed = checks.filter((c) => c.passed).length;
  const qualityPassRate = Math.round((passed / checks.length) * 100);

  if (input.verdict === "ACCEPTED" && qualityPassRate < 70) {
    throw new Error(
      `cannot accept with quality pass rate ${qualityPassRate}%`,
    );
  }

  const id = input.id?.trim() || createId("qacc");
  if (acceptances.has(id)) {
    throw new Error(`acceptance record already exists: ${id}`);
  }

  const record: AcceptanceRecord = {
    id,
    deliveryId,
    verdict: input.verdict,
    acceptedBy: (input.acceptedBy ?? "customer").trim() || "customer",
    notes: (input.notes ?? "").trim(),
    qualityPassRate,
    detail: `verdict=${input.verdict} passRate=${qualityPassRate}%`,
    acceptedAt: nowIso(),
  };
  acceptances.set(id, record);
  return cloneAcceptance(record);
}

export function getAcceptanceRecord(
  id: string,
): AcceptanceRecord | undefined {
  const record = acceptances.get(id.trim());
  return record ? cloneAcceptance(record) : undefined;
}

export function listAcceptanceRecords(filter?: {
  deliveryId?: string;
  verdict?: AcceptanceVerdict;
}): AcceptanceRecord[] {
  let result = [...acceptances.values()];
  if (filter?.deliveryId) {
    const did = filter.deliveryId.trim();
    result = result.filter((r) => r.deliveryId === did);
  }
  if (filter?.verdict) {
    result = result.filter((r) => r.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAcceptance);
}

export function clearAcceptanceRecords(): void {
  acceptances.clear();
}
