/**
 * WP-61 — Assignment Engine
 * Deterministic assignments from RouteItems (read-only).
 */
import { getRoute, type RouteItem } from "./route";

export const FEAT_62_ID = "FEAT-62" as const;
export const ASSIGNMENT_ENGINE_CAPABILITY = "AssignmentEngine" as const;

export const ASSIGNMENT_ASSIGNEES = ["CORE", "OPS", "ARCHIVE"] as const;

export type AssignmentAssignee = (typeof ASSIGNMENT_ASSIGNEES)[number];

export type AssignmentItem = Readonly<{
  id: string;
  routeId: string;
  assignee: AssignmentAssignee;
  position: number;
}>;

export type BuildAssignmentInput = Readonly<{
  routes?: readonly RouteItem[];
}>;

const ASSIGNEE_RANK: Record<AssignmentAssignee, number> = {
  CORE: 0,
  OPS: 1,
  ARCHIVE: 2,
};

let cachedAssignment: AssignmentItem[] | null = null;

function cloneItem(row: AssignmentItem): AssignmentItem {
  return { ...row };
}

function targetToAssignee(
  target: RouteItem["target"],
): AssignmentAssignee {
  if (target === "INTERNAL") return "CORE";
  if (target === "EXTERNAL") return "OPS";
  return "ARCHIVE";
}

/**
 * Build deterministic assignment items from RouteItems.
 * Sorted CORE → OPS → ARCHIVE, then stable routeId.
 */
export function buildAssignment(
  input: BuildAssignmentInput = {},
): AssignmentItem[] {
  const routes = input.routes ? [...input.routes] : getRoute();

  const ranked = routes.map((r) => ({
    routeId: r.id,
    assignee: targetToAssignee(r.target),
  }));

  ranked.sort((a, b) => {
    const byAssignee =
      ASSIGNEE_RANK[a.assignee] - ASSIGNEE_RANK[b.assignee];
    if (byAssignee !== 0) return byAssignee;
    return a.routeId.localeCompare(b.routeId);
  });

  const out: AssignmentItem[] = ranked.map((row, index) => ({
    id: `assign-${row.routeId}`,
    routeId: row.routeId,
    assignee: row.assignee,
    position: index + 1,
  }));

  cachedAssignment = out.map(cloneItem);
  return cachedAssignment.map(cloneItem);
}

/**
 * Get the last built assignments, or build if none cached.
 */
export function getAssignment(): AssignmentItem[] {
  if (!cachedAssignment) {
    return buildAssignment();
  }
  return cachedAssignment.map(cloneItem);
}

/** Test helper — clears cached assignments. */
export function clearAssignment(): void {
  cachedAssignment = null;
}
