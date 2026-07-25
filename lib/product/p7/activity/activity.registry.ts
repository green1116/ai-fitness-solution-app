/**
 * Product P7 — Activity registry
 */

import { ACTIVITY_KINDS } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  ActivityKind,
  CollaborationActivity,
  RecordActivityInput,
} from "./activity.types";

const activities = new Map<string, CollaborationActivity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneActivity(
  activity: CollaborationActivity,
): CollaborationActivity {
  return { ...activity, metadata: { ...activity.metadata } };
}

export function recordActivity(
  input: RecordActivityInput,
): CollaborationActivity {
  const collaborationId = input.collaborationId.trim();
  const actor = input.actor.trim();
  const summary = input.summary.trim();
  if (!collaborationId) {
    throw new Error("activity.collaborationId is required");
  }
  if (!actor) throw new Error("activity.actor is required");
  if (!summary) throw new Error("activity.summary is required");
  if (!(ACTIVITY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid activity kind: ${input.kind}`);
  }
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7act");
  if (activities.has(id)) {
    throw new Error(`activity already exists: ${id}`);
  }

  const activity: CollaborationActivity = {
    id,
    collaborationId,
    kind: input.kind,
    actor,
    summary,
    detail: `kind=${input.kind} actor=${actor}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  activities.set(id, activity);
  return cloneActivity(activity);
}

export function getActivity(id: string): CollaborationActivity | undefined {
  const activity = activities.get(id.trim());
  return activity ? cloneActivity(activity) : undefined;
}

export function listActivities(filter?: {
  collaborationId?: string;
  kind?: ActivityKind;
}): CollaborationActivity[] {
  let result = [...activities.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((a) => a.collaborationId === cid);
  }
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneActivity);
}

export function clearActivities(): void {
  activities.clear();
}
