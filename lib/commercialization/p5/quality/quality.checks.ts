/**
 * Commercialization P5 — Quality checks
 */

import { QUALITY_CHECK_KINDS } from "../delivery/delivery.constants";
import { getDeliveryPlan } from "../delivery/delivery.registry";
import type {
  QualityCheck,
  QualityCheckKind,
  RunQualityCheckInput,
} from "./quality.types";

const checks = new Map<string, QualityCheck>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheck(check: QualityCheck): QualityCheck {
  return { ...check };
}

export function runQualityCheck(
  input: RunQualityCheckInput,
): QualityCheck {
  const deliveryId = input.deliveryId.trim();
  const name = input.name.trim();
  if (!name) throw new Error("qualityCheck.name is required");
  if (!(QUALITY_CHECK_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid quality check kind: ${input.kind}`);
  }

  const delivery = getDeliveryPlan(deliveryId);
  if (!delivery) throw new Error(`delivery plan not found: ${deliveryId}`);

  const score = Math.max(
    0,
    Math.min(100, Math.round(input.score ?? 80)),
  );
  const passed = input.passed ?? score >= 70;

  const id = input.id?.trim() || createId("qchk");
  if (checks.has(id)) {
    throw new Error(`quality check already exists: ${id}`);
  }

  const check: QualityCheck = {
    id,
    deliveryId,
    kind: input.kind,
    name,
    passed,
    score,
    detail: `kind=${input.kind} passed=${passed} score=${score}`,
    checkedAt: nowIso(),
  };
  checks.set(id, check);
  return cloneCheck(check);
}

export function getQualityCheck(id: string): QualityCheck | undefined {
  const check = checks.get(id.trim());
  return check ? cloneCheck(check) : undefined;
}

export function listQualityChecks(filter?: {
  deliveryId?: string;
  kind?: QualityCheckKind;
  passed?: boolean;
}): QualityCheck[] {
  let result = [...checks.values()];
  if (filter?.deliveryId) {
    const did = filter.deliveryId.trim();
    result = result.filter((c) => c.deliveryId === did);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.passed !== undefined) {
    result = result.filter((c) => c.passed === filter.passed);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheck);
}

export function clearQualityChecks(): void {
  checks.clear();
}
