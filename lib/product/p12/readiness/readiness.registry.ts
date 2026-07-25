/**
 * Product P12 — Readiness gate registry
 */

import { READINESS_GATES } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  LaunchReadinessCheck,
  ReadinessGate,
  RecordReadinessInput,
} from "./readiness.types";

const readinessChecks = new Map<string, LaunchReadinessCheck>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheck(check: LaunchReadinessCheck): LaunchReadinessCheck {
  return { ...check, metadata: { ...check.metadata } };
}

export function recordReadiness(
  input: RecordReadinessInput,
): LaunchReadinessCheck {
  const launchId = input.launchId.trim();
  const name = input.name.trim();
  if (!launchId) throw new Error("readiness.launchId is required");
  if (!name) throw new Error("readiness.name is required");
  if (!(READINESS_GATES as readonly string[]).includes(input.gate)) {
    throw new Error(`invalid readiness gate: ${input.gate}`);
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const id = input.id?.trim() || createId("p12rdy");
  if (readinessChecks.has(id)) {
    throw new Error(`readiness check already exists: ${id}`);
  }

  const evidence = (input.evidence ?? "").trim() || `gate=${input.gate}`;
  const check: LaunchReadinessCheck = {
    id,
    launchId,
    name,
    gate: input.gate,
    evidence,
    detail: `gate=${input.gate} name=${name}`,
    metadata: { ...(input.metadata ?? {}) },
    evaluatedAt: nowIso(),
  };
  readinessChecks.set(id, check);
  return cloneCheck(check);
}

export function getReadiness(id: string): LaunchReadinessCheck | undefined {
  const check = readinessChecks.get(id.trim());
  return check ? cloneCheck(check) : undefined;
}

export function listReadiness(filter?: {
  launchId?: string;
  gate?: ReadinessGate;
}): LaunchReadinessCheck[] {
  let result = [...readinessChecks.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((c) => c.launchId === lid);
  }
  if (filter?.gate) result = result.filter((c) => c.gate === filter.gate);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheck);
}

export function clearReadiness(): void {
  readinessChecks.clear();
}
