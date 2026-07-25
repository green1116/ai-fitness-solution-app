/**
 * Product Customer Insight — Segment registry
 */

import { INSIGHT_SEGMENT_CODES } from "../insight/insight.constants";
import type {
  AssignInsightSegmentInput,
  CustomerInsightSegment,
  InsightSegmentCode,
} from "./segment.types";

const segments = new Map<string, CustomerInsightSegment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSegment(
  segment: CustomerInsightSegment,
): CustomerInsightSegment {
  return { ...segment, metadata: { ...segment.metadata } };
}

export function assignInsightSegment(
  input: AssignInsightSegmentInput,
): CustomerInsightSegment {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("segment.customerId is required");
  if (!(INSIGHT_SEGMENT_CODES as readonly string[]).includes(input.segment)) {
    throw new Error(`invalid insight segment: ${input.segment}`);
  }

  const existing = [...segments.values()].find(
    (s) => s.customerId === customerId,
  );
  const id = input.id?.trim() || existing?.id || createId("cinseg");
  if (segments.has(id) && existing && existing.id !== id) {
    throw new Error(`insight segment already exists: ${id}`);
  }

  const segment: CustomerInsightSegment = {
    id,
    customerId,
    segment: input.segment,
    detail: `segment=${input.segment}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  segments.set(id, segment);
  return cloneSegment(segment);
}

export function getInsightSegment(
  id: string,
): CustomerInsightSegment | undefined {
  const segment = segments.get(id.trim());
  return segment ? cloneSegment(segment) : undefined;
}

export function listInsightSegments(filter?: {
  customerId?: string;
  segment?: InsightSegmentCode;
}): CustomerInsightSegment[] {
  let result = [...segments.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((s) => s.customerId === customerId);
  }
  if (filter?.segment) {
    result = result.filter((s) => s.segment === filter.segment);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSegment);
}

export function clearInsightSegments(): void {
  segments.clear();
}
