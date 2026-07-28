/**
 * Product M15 — Evolution track in-memory registry
 */

import {
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
} from "./evolution.constants";
import { validateEvolutionTrackInput } from "./evolution.metadata";
import type {
  EvolutionTrack,
  EvolutionTrackKind,
  EvolutionTrackStatus,
  RegisterEvolutionTrackInput,
  UpdateEvolutionTrackStatusInput,
} from "./evolution.types";

const tracks = new Map<string, EvolutionTrack>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrack(track: EvolutionTrack): EvolutionTrack {
  return { ...track, metadata: { ...track.metadata } };
}

export function registerEvolutionTrack(
  input: RegisterEvolutionTrackInput,
): EvolutionTrack {
  const validation = validateEvolutionTrackInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution track: ${first?.field} ${first?.message}`,
    );
  }

  const trackKey = input.trackKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const intelligenceBaselineRef = (
    input.intelligenceBaselineRef ?? PRODUCT_EVOLUTION_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(trackKey)) {
    throw new Error(`trackKey already exists: ${trackKey}`);
  }

  const id = input.id?.trim() || createId("evotrk");
  if (tracks.has(id)) throw new Error(`track already exists: ${id}`);

  const now = nowIso();
  const track: EvolutionTrack = {
    id,
    trackKey,
    kind: input.kind,
    status: EVOLUTION_TRACK_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    intelligenceBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  tracks.set(id, track);
  keys.set(trackKey, id);
  return cloneTrack(track);
}

export function updateEvolutionTrackStatus(
  input: UpdateEvolutionTrackStatusInput,
): EvolutionTrack {
  const trackId = input.trackId.trim();
  if (!trackId) throw new Error("track.trackId is required");
  if (
    !(EVOLUTION_TRACK_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid track status: ${input.status}`);
  }

  const existing = tracks.get(trackId);
  if (!existing) throw new Error(`track not found: ${trackId}`);

  const updated: EvolutionTrack = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  tracks.set(trackId, updated);
  return cloneTrack(updated);
}

export function getEvolutionTrack(id: string): EvolutionTrack | undefined {
  const track = tracks.get(id.trim());
  return track ? cloneTrack(track) : undefined;
}

export function getEvolutionTrackByKey(
  trackKey: string,
): EvolutionTrack | undefined {
  const id = keys.get(trackKey.trim().toUpperCase());
  return id ? getEvolutionTrack(id) : undefined;
}

export function listEvolutionTracks(filter?: {
  kind?: EvolutionTrackKind;
  status?: EvolutionTrackStatus;
}): EvolutionTrack[] {
  let result = [...tracks.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.trackKey.localeCompare(b.trackKey))
    .map(cloneTrack);
}

export function clearEvolutionTracks(): void {
  tracks.clear();
  keys.clear();
}
