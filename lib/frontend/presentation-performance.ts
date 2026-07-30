/**
 * FE-4.4 — Frontend Performance Presentation (PD-4.7).
 * Shell-first loading, prefetch/cache hints, skeletons — presentation only.
 * No hidden Commands, no fake Objects, no Domain/API ownership.
 */
import { SCREEN_READ_TARGETS } from "@/lib/frontend/adapter-bindings";
import { planReadFlow } from "@/lib/frontend/presentation-adapter";
import type { PresentationRoutePath } from "@/lib/frontend/presentation-routes";
import {
  buildServerCacheKey,
  createIdleMetaState,
  setMetaLoading,
  type PresentationMetaState,
} from "@/lib/frontend/presentation-state";
import { sessionInvalidationTargets } from "@/lib/frontend/presentation-security";
import {
  CACHE_INVALIDATION_POLICY,
  type ServerStateKey,
} from "@/lib/frontend/state-taxonomy";

export const PERFORMANCE_BASELINE_ID =
  "product-frontend-performance-v1" as const;

/** PD-4.7 §3.2 — initial render priority (shell before Domain data). */
export const INITIAL_RENDER_PRIORITY = [
  "shell-chrome",
  "layout-host",
  "local-affordances",
  "session-observe",
  "screen-server-reads",
  "secondary-regions",
] as const;

export type InitialRenderStep = (typeof INITIAL_RENDER_PRIORITY)[number];

export const FETCH_TIMING_CLASSES = [
  "T-BOOT",
  "T-ENTER",
  "T-ACTION",
  "T-INVALIDATE",
  "T-MANUAL",
  "T-IDLE",
] as const;

export type FetchTimingClass = (typeof FETCH_TIMING_CLASSES)[number];

export const PREFETCH_IDS = [
  "PF-CODE-NEXT",
  "PF-READ-PROBABLE",
  "PF-SESSION",
] as const;

export type PrefetchId = (typeof PREFETCH_IDS)[number];

export const BUNDLE_SPLIT_UNITS = [
  "BU-SHELL",
  "BU-ENTRY",
  "BU-INTAKE",
  "BU-WORKSPACE",
  "BU-RESULT",
  "BU-CONTINUITY",
  "BU-OPS",
  "BU-SYSTEM",
] as const;

export type BundleSplitUnit = (typeof BUNDLE_SPLIT_UNITS)[number];

export const SKELETON_MODES = [
  "SK-SHELL",
  "SK-REGION",
  "SK-COMMAND",
  "SK-NONE",
] as const;

export type SkeletonMode = (typeof SKELETON_MODES)[number];

export const ASSET_LOAD_CLASSES = [
  "brand-chrome",
  "illustrative",
  "icons",
  "document-preview",
  "user-upload",
] as const;

export type AssetLoadClass = (typeof ASSET_LOAD_CLASSES)[number];

export const PERFORMANCE_ANTI_PATTERNS = [
  "AP-01",
  "AP-02",
  "AP-03",
  "AP-04",
  "AP-05",
  "AP-06",
  "AP-07",
  "AP-08",
] as const;

export type PerformanceAntiPatternId =
  (typeof PERFORMANCE_ANTI_PATTERNS)[number];

export const SCREEN_INITIAL_RENDER = [
  {
    screenId: "SCR-01",
    firstMeaningful: "Brand + Goal cards + Sign In / Language",
    deferred: "Optional auth me observe",
    preferredSkeleton: "SK-NONE" as SkeletonMode,
  },
  {
    screenId: "SCR-02",
    firstMeaningful: "Guide + input structure",
    deferred: "Status / resume reads",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-03",
    firstMeaningful: "Guide + upload structure",
    deferred: "Status / resume reads",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-04",
    firstMeaningful: "Three-zone layout chrome",
    deferred: "Conversation / task / context data",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-05",
    firstMeaningful: "Result layout chrome",
    deferred: "Summary / blocks Objects",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-06",
    firstMeaningful: "Result layout chrome",
    deferred: "Budget overview Objects",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-07",
    firstMeaningful: "List layout chrome",
    deferred: "Project rows",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-08",
    firstMeaningful: "Category chrome",
    deferred: "Document items / artifacts",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
  {
    screenId: "SCR-09",
    firstMeaningful: "Ops layout chrome",
    deferred: "Per-area observations (may stagger)",
    preferredSkeleton: "SK-REGION" as SkeletonMode,
  },
] as const;

export const BUNDLE_ROUTE_BINDINGS = [
  { unit: "BU-ENTRY", paths: ["/", "/home"] as const, load: "eager" as const },
  {
    unit: "BU-INTAKE",
    paths: ["/builder", "/tender"] as const,
    load: "lazy" as const,
  },
  {
    unit: "BU-WORKSPACE",
    paths: ["/workspace"] as const,
    load: "lazy" as const,
  },
  {
    unit: "BU-RESULT",
    paths: ["/solution", "/budget"] as const,
    load: "lazy" as const,
  },
  {
    unit: "BU-CONTINUITY",
    paths: ["/projects", "/documents"] as const,
    load: "lazy" as const,
  },
  { unit: "BU-OPS", paths: ["/admin"] as const, load: "lazy" as const },
  {
    unit: "BU-SYSTEM",
    paths: ["/404", "/unavailable"] as const,
    load: "lazy" as const,
  },
] as const;

export const PREFETCH_POLICY = [
  {
    id: "PF-CODE-NEXT" as PrefetchId,
    trigger: "Hover/focus on primary Forward with known edge",
    what: "Next route Screen bundle",
    timing: "T-IDLE" as FetchTimingClass,
    allowsCommand: false,
  },
  {
    id: "PF-READ-PROBABLE" as PrefetchId,
    trigger: "After intake success before nav settles",
    what: "Target workspace/result read for known projectId",
    timing: "T-IDLE" as FetchTimingClass,
    allowsCommand: false,
  },
  {
    id: "PF-SESSION" as PrefetchId,
    trigger: "Boot",
    what: "Auth me observe once",
    timing: "T-BOOT" as FetchTimingClass,
    allowsCommand: false,
  },
] as const;

export const LIST_PAINT_PHASES = [
  "chrome",
  "first-page-rows",
  "remainder",
] as const;

export type ListPaintPhase = (typeof LIST_PAINT_PHASES)[number];

export type PrefetchHint = Readonly<{
  id: PrefetchId;
  timing: FetchTimingClass;
  /** Presentation descriptor only — never auto-issues Commands. */
  kind: "code-bundle" | "probable-read" | "session-observe";
  routeRef: PresentationRoutePath | null;
  projectCue: string;
  allowsCommand: false;
}>;

export type ScreenEnterPerformancePlan = Readonly<{
  screenId: string;
  renderPriority: typeof INITIAL_RENDER_PRIORITY;
  timing: "T-ENTER";
  skeleton: SkeletonMode;
  meta: PresentationMetaState;
  readPlanRequiresHttp: boolean;
  cacheKey: string | null;
  reuseCache: boolean;
  dropOpsPayload: boolean;
}>;

export type CacheHint = Readonly<{
  key: string;
  serverKey: ServerStateKey | null;
  disposable: true;
  invalidateOn: readonly string[];
}>;

/**
 * Resolve skeleton mode from META + cache hit (SK-01…SK-05).
 * Never invents OBJ-* values.
 */
export function resolveSkeletonMode(input: {
  screenId: string;
  meta: PresentationMetaState;
  cacheHitReady?: boolean;
  commandInFlight?: boolean;
  regionScoped?: boolean;
}): SkeletonMode {
  if (input.commandInFlight) return "SK-COMMAND";
  if (input.cacheHitReady && input.meta.loading !== "loading") {
    return "SK-NONE";
  }
  if (input.meta.loading !== "loading") {
    return "SK-NONE";
  }
  if (input.meta.empty || input.meta.error) {
    return "SK-NONE";
  }
  const posture = SCREEN_INITIAL_RENDER.find(
    (row) => row.screenId === input.screenId,
  );
  if (posture?.preferredSkeleton === "SK-NONE") return "SK-SHELL";
  if (input.regionScoped) return "SK-REGION";
  return posture?.preferredSkeleton ?? "SK-SHELL";
}

/**
 * Plan Screen enter: shell META-LOADING + read descriptor (no fetch execution).
 */
export function planScreenEnterPerformance(input: {
  screenId: string;
  projectCue?: string;
  hasValidCache?: boolean;
  leavingOps?: boolean;
}): ScreenEnterPerformancePlan {
  const read = planReadFlow({
    screenId: input.screenId,
    projectCue: input.projectCue,
  });
  const reuseCache = Boolean(input.hasValidCache) && !input.leavingOps;
  const meta = reuseCache
    ? createIdleMetaState()
    : setMetaLoading(createIdleMetaState(), "loading");
  const posture = SCREEN_INITIAL_RENDER.find(
    (row) => row.screenId === input.screenId,
  );
  const skeleton = resolveSkeletonMode({
    screenId: input.screenId,
    meta,
    cacheHitReady: reuseCache,
  });

  return {
    screenId: input.screenId,
    renderPriority: INITIAL_RENDER_PRIORITY,
    timing: "T-ENTER",
    skeleton:
      reuseCache
        ? "SK-NONE"
        : skeleton === "SK-NONE" && posture?.preferredSkeleton !== "SK-NONE"
          ? "SK-SHELL"
          : skeleton,
    meta,
    readPlanRequiresHttp: read.requiresHttp && !reuseCache,
    cacheKey: read.serverKey
      ? buildServerCacheKey(read.serverKey, input.projectCue)
      : null,
    reuseCache,
    dropOpsPayload: Boolean(input.leavingOps),
  };
}

/**
 * Prefetch hint only (PC-01) — never a hidden Command.
 */
export function planPrefetchHint(input: {
  prefetchId: PrefetchId;
  routeRef?: PresentationRoutePath | null;
  projectCue?: string | null;
}): PrefetchHint {
  const policy = PREFETCH_POLICY.find((row) => row.id === input.prefetchId);
  if (!policy) {
    throw new Error(`Unknown prefetch id ${input.prefetchId}`);
  }
  if (policy.allowsCommand) {
    throw new Error("Prefetch must never allow Commands");
  }

  const kind =
    input.prefetchId === "PF-CODE-NEXT"
      ? "code-bundle"
      : input.prefetchId === "PF-READ-PROBABLE"
        ? "probable-read"
        : "session-observe";

  const projectCue = input.projectCue?.trim() ?? "";
  if (input.prefetchId === "PF-READ-PROBABLE" && !projectCue) {
    throw new Error("PF-READ-PROBABLE requires opaque projectCue");
  }

  return {
    id: input.prefetchId,
    timing: policy.timing,
    kind,
    routeRef: input.routeRef ?? null,
    projectCue,
    allowsCommand: false,
  };
}

export function resolveBundleUnitForPath(
  pathname: string,
): BundleSplitUnit | "BU-SHELL" {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname || "/";
  for (const row of BUNDLE_ROUTE_BINDINGS) {
    if ((row.paths as readonly string[]).includes(normalized)) {
      return row.unit;
    }
  }
  return "BU-SHELL";
}

/** BS-02 — Admin must not be on customer Entry critical path. */
export function opsBundleIsolatedFromEntry(): boolean {
  const entry = BUNDLE_ROUTE_BINDINGS.find((b) => b.unit === "BU-ENTRY");
  const ops = BUNDLE_ROUTE_BINDINGS.find((b) => b.unit === "BU-OPS");
  if (!entry || !ops) return false;
  return (
    entry.load === "eager" &&
    ops.load === "lazy" &&
    !(entry.paths as readonly string[]).includes("/admin")
  );
}

export function buildCacheHint(input: {
  serverKey: ServerStateKey;
  projectCue?: string | null;
  invalidationClass?: (typeof CACHE_INVALIDATION_POLICY)[number]["commandClass"];
}): CacheHint {
  const row = CACHE_INVALIDATION_POLICY.find(
    (p) => p.commandClass === (input.invalidationClass ?? "nav-only"),
  );
  return {
    key: buildServerCacheKey(input.serverKey, input.projectCue),
    serverKey: input.serverKey,
    disposable: true,
    invalidateOn: row?.invalidate ?? [],
  };
}

/**
 * PC-06 / FE-4.3 — auth failure clears warm caches.
 */
export function cacheClearedOnAuthFailure(): readonly string[] {
  return sessionInvalidationTargets();
}

/**
 * List paint phases (LR-02) — chrome before rows; no fabricated rows.
 */
export function planListPaintPhases(input: {
  rowCount: number;
  firstPageSize?: number;
}): readonly ListPaintPhase[] {
  if (input.rowCount <= 0) return ["chrome"];
  const page = input.firstPageSize ?? 20;
  if (input.rowCount <= page) return ["chrome", "first-page-rows"];
  return [...LIST_PAINT_PHASES];
}

/**
 * Asset load posture — decorative never blocks primary INT-* (IA-01).
 */
export function assetBlocksPrimaryIntent(
  _assetClass: AssetLoadClass,
): false {
  return false;
}

export function assetLoadPriority(
  assetClass: AssetLoadClass,
): "eager" | "lazy" | "command-only" | "not-display" {
  switch (assetClass) {
    case "brand-chrome":
      return "eager";
    case "icons":
      return "eager";
    case "illustrative":
      return "lazy";
    case "document-preview":
      return "lazy";
    case "user-upload":
      return "not-display";
  }
}

export function isPerformanceAntiPattern(
  id: string,
): id is PerformanceAntiPatternId {
  return (PERFORMANCE_ANTI_PATTERNS as readonly string[]).includes(id);
}

/** FT-02 — Commands never auto-fire on enter. */
export function screenEnterIssuesCommand(): false {
  return false;
}

/** AP-02 / PC-01 — prefetch never mutates. */
export function prefetchIssuesCommand(_hint: PrefetchHint): false {
  return false;
}

/**
 * RT-05 — leaving SCR-09 drops ops presentation payload from customer memory.
 */
export function shouldDropOpsPayload(input: {
  fromScreenId?: string | null;
  toScreenId?: string | null;
}): boolean {
  return (
    input.fromScreenId === "SCR-09" &&
    Boolean(input.toScreenId) &&
    input.toScreenId !== "SCR-09"
  );
}

export function getScreenReadKeys(screenId: string): readonly ServerStateKey[] {
  const target = SCREEN_READ_TARGETS.find((t) => t.screenId === screenId);
  return target?.readKeys ?? [];
}
