/**
 * WP-60 — Route Engine
 * Deterministic routes from DispatchItems (read-only).
 */
import { getDispatch, type DispatchItem } from "./dispatch";

export const FEAT_61_ID = "FEAT-61" as const;
export const ROUTE_ENGINE_CAPABILITY = "RouteEngine" as const;

export const ROUTE_TARGETS = ["INTERNAL", "EXTERNAL", "ARCHIVE"] as const;

export type RouteTarget = (typeof ROUTE_TARGETS)[number];

export type RouteItem = Readonly<{
  id: string;
  dispatchId: string;
  target: RouteTarget;
  position: number;
}>;

export type BuildRouteInput = Readonly<{
  dispatches?: readonly DispatchItem[];
}>;

const TARGET_RANK: Record<RouteTarget, number> = {
  INTERNAL: 0,
  EXTERNAL: 1,
  ARCHIVE: 2,
};

let cachedRoute: RouteItem[] | null = null;

function cloneItem(row: RouteItem): RouteItem {
  return { ...row };
}

function priorityToTarget(
  priority: DispatchItem["priority"],
): RouteTarget {
  if (priority === "CRITICAL") return "INTERNAL";
  if (priority === "HIGH") return "EXTERNAL";
  return "ARCHIVE";
}

/**
 * Build deterministic route items from DispatchItems.
 * Sorted by target (INTERNAL → EXTERNAL → ARCHIVE), then stable dispatch id.
 */
export function buildRoute(input: BuildRouteInput = {}): RouteItem[] {
  const dispatches = input.dispatches ? [...input.dispatches] : getDispatch();

  const ranked = dispatches.map((d) => ({
    dispatchId: d.id,
    target: priorityToTarget(d.priority),
  }));

  ranked.sort((a, b) => {
    const byTarget = TARGET_RANK[a.target] - TARGET_RANK[b.target];
    if (byTarget !== 0) return byTarget;
    return a.dispatchId.localeCompare(b.dispatchId);
  });

  const out: RouteItem[] = ranked.map((row, index) => ({
    id: `route-${row.dispatchId}`,
    dispatchId: row.dispatchId,
    target: row.target,
    position: index + 1,
  }));

  cachedRoute = out.map(cloneItem);
  return cachedRoute.map(cloneItem);
}

/**
 * Get the last built routes, or build if none cached.
 */
export function getRoute(): RouteItem[] {
  if (!cachedRoute) {
    return buildRoute();
  }
  return cachedRoute.map(cloneItem);
}

/** Test helper — clears cached routes. */
export function clearRoute(): void {
  cachedRoute = null;
}
