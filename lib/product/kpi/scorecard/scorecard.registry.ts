/**
 * Product KPI — Scorecard registry
 */

import { getKpiDefinition } from "../definition/definition.registry";
import { listKpiMeasurements } from "../measurement/measurement.registry";
import type {
  BuildScorecardInput,
  KpiScorecard,
} from "./scorecard.types";

const scorecards = new Map<string, KpiScorecard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScorecard(scorecard: KpiScorecard): KpiScorecard {
  return {
    ...scorecard,
    kpiIds: [...scorecard.kpiIds],
    metadata: { ...scorecard.metadata },
  };
}

export function buildScorecard(input: BuildScorecardInput): KpiScorecard {
  const name = input.name.trim();
  if (!name) throw new Error("scorecard.name is required");
  if (!input.kpiIds.length) {
    throw new Error("scorecard.kpiIds is required");
  }

  const kpiIds = input.kpiIds.map((id) => id.trim()).filter(Boolean);
  for (const kpiId of kpiIds) {
    if (!getKpiDefinition(kpiId)) {
      throw new Error(`kpi not found: ${kpiId}`);
    }
  }

  const id = input.id?.trim() || createId("kpisc");
  if (scorecards.has(id)) throw new Error(`scorecard already exists: ${id}`);

  const measurements = listKpiMeasurements();
  const onTrackCount = kpiIds.filter((kpiId) =>
    measurements.some(
      (m) =>
        m.kpiId === kpiId &&
        (m.result === "ON_TRACK" || m.result === "ABOVE"),
    ),
  ).length;

  const scorecard: KpiScorecard = {
    id,
    name,
    kpiIds,
    onTrackCount,
    detail: `kpis=${kpiIds.length} onTrack=${onTrackCount}`,
    metadata: { ...(input.metadata ?? {}) },
    builtAt: nowIso(),
  };
  scorecards.set(id, scorecard);
  return cloneScorecard(scorecard);
}

export function getScorecard(id: string): KpiScorecard | undefined {
  const scorecard = scorecards.get(id.trim());
  return scorecard ? cloneScorecard(scorecard) : undefined;
}

export function listScorecards(): KpiScorecard[] {
  return [...scorecards.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScorecard);
}

export function clearScorecards(): void {
  scorecards.clear();
}
