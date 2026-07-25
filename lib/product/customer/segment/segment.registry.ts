/**
 * Product Customer — Segment registry
 */

import { CUSTOMER_SEGMENTS } from "../foundation/foundation.constants";
import { getCustomer } from "../profile/profile.registry";
import type {
  AssignSegmentInput,
  CustomerSegmentAssignment,
  CustomerSegmentCode,
} from "./segment.types";

const segments = new Map<string, CustomerSegmentAssignment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSegment(
  assignment: CustomerSegmentAssignment,
): CustomerSegmentAssignment {
  return { ...assignment, metadata: { ...assignment.metadata } };
}

export function assignSegment(
  input: AssignSegmentInput,
): CustomerSegmentAssignment {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("segment.customerId is required");
  if (!(CUSTOMER_SEGMENTS as readonly string[]).includes(input.segment)) {
    throw new Error(`invalid customer segment: ${input.segment}`);
  }
  if (!getCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }

  const duplicate = [...segments.values()].find(
    (s) => s.customerId === customerId && s.segment === input.segment,
  );
  if (duplicate) {
    throw new Error(
      `segment already assigned: ${customerId}/${input.segment}`,
    );
  }

  const id = input.id?.trim() || createId("cusseg");
  if (segments.has(id)) throw new Error(`segment already exists: ${id}`);

  const assignment: CustomerSegmentAssignment = {
    id,
    customerId,
    segment: input.segment,
    detail: `segment=${input.segment}`,
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  segments.set(id, assignment);
  return cloneSegment(assignment);
}

export function getSegment(
  id: string,
): CustomerSegmentAssignment | undefined {
  const assignment = segments.get(id.trim());
  return assignment ? cloneSegment(assignment) : undefined;
}

export function listSegments(filter?: {
  customerId?: string;
  segment?: CustomerSegmentCode;
}): CustomerSegmentAssignment[] {
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

export function clearSegments(): void {
  segments.clear();
}
