/**
 * FE-4.4 — Performance Presentation verification (PD-4.7).
 */
import fs from "node:fs";
import path from "node:path";

import {
  ASSET_LOAD_CLASSES,
  BUNDLE_SPLIT_UNITS,
  FETCH_TIMING_CLASSES,
  INITIAL_RENDER_PRIORITY,
  LIST_PAINT_PHASES,
  PERFORMANCE_ANTI_PATTERNS,
  PERFORMANCE_BASELINE_ID,
  PREFETCH_IDS,
  PREFETCH_POLICY,
  SCREEN_INITIAL_RENDER,
  SKELETON_MODES,
  assetBlocksPrimaryIntent,
  assetLoadPriority,
  buildCacheHint,
  cacheClearedOnAuthFailure,
  getScreenReadKeys,
  isPerformanceAntiPattern,
  opsBundleIsolatedFromEntry,
  planListPaintPhases,
  planPrefetchHint,
  planScreenEnterPerformance,
  prefetchIssuesCommand,
  resolveBundleUnitForPath,
  resolveSkeletonMode,
  screenEnterIssuesCommand,
  shouldDropOpsPayload,
} from "../lib/frontend/presentation-performance";
import { STATE_CLASS_IDS } from "../lib/frontend/state-taxonomy";
import { createIdleMetaState } from "../lib/frontend/presentation-state";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(
  PERFORMANCE_BASELINE_ID === "product-frontend-performance-v1",
  "baseline",
);
assert(INITIAL_RENDER_PRIORITY[0] === "shell-chrome", "shell first");
assert(INITIAL_RENDER_PRIORITY.length === 6, "render steps");
assert(SCREEN_INITIAL_RENDER.length === 9, "SCR-01…09 posture");
assert(FETCH_TIMING_CLASSES.length === 6, "timing classes");
assert(PREFETCH_IDS.length === 3, "prefetch ids");
assert(BUNDLE_SPLIT_UNITS.length === 8, "bundle units");
assert(SKELETON_MODES.length === 4, "skeleton modes");
assert(PERFORMANCE_ANTI_PATTERNS.length === 8, "anti-patterns");
assert(ASSET_LOAD_CLASSES.length === 5, "asset classes");
console.log("PASS PD-4.7 performance catalogues");

const enter = planScreenEnterPerformance({
  screenId: "SCR-07",
  projectCue: "p1",
});
assert(enter.timing === "T-ENTER", "T-ENTER");
assert(enter.meta.loading === "loading", "META loading on enter");
assert(enter.readPlanRequiresHttp, "read planned without executing fetch");
assert(enter.cacheKey === "SRV-PROJECT:project:p1", "opaque cache key");
assert(enter.renderPriority[0] === "shell-chrome", "priority order");
assert(screenEnterIssuesCommand() === false, "FT-02 no auto Command");

const cached = planScreenEnterPerformance({
  screenId: "SCR-07",
  projectCue: "p1",
  hasValidCache: true,
});
assert(cached.reuseCache && cached.skeleton === "SK-NONE", "SK-NONE on cache hit");
assert(!cached.readPlanRequiresHttp, "skip repeat read when cache valid");
console.log("PASS initial render + route enter timing");

const skCmd = resolveSkeletonMode({
  screenId: "SCR-03",
  meta: { loading: "loading", error: null, empty: false },
  commandInFlight: true,
});
assert(skCmd === "SK-COMMAND", "command skeleton");

const skEmpty = resolveSkeletonMode({
  screenId: "SCR-07",
  meta: { loading: "success", error: null, empty: true },
});
assert(skEmpty === "SK-NONE", "empty ≠ skeleton (SK-02/LR-07)");

const loadingMeta = setLoading();
const skRegion = resolveSkeletonMode({
  screenId: "SCR-09",
  meta: loadingMeta,
  regionScoped: true,
});
assert(skRegion === "SK-REGION", "ops per-area skeleton");
console.log("PASS skeleton / loading strategy (no fake Objects)");

function setLoading() {
  return { loading: "loading" as const, error: null, empty: false };
}

for (const row of PREFETCH_POLICY) {
  assert(row.allowsCommand === false, `${row.id} never Command`);
}
const codeHint = planPrefetchHint({
  prefetchId: "PF-CODE-NEXT",
  routeRef: "/workspace",
});
assert(codeHint.kind === "code-bundle" && !codeHint.allowsCommand, "PF-CODE");
assert(prefetchIssuesCommand(codeHint) === false, "AP-02");

const readHint = planPrefetchHint({
  prefetchId: "PF-READ-PROBABLE",
  routeRef: "/workspace",
  projectCue: "p1",
});
assert(readHint.kind === "probable-read", "probable read");

let threw = false;
try {
  planPrefetchHint({ prefetchId: "PF-READ-PROBABLE" });
} catch {
  threw = true;
}
assert(threw, "probable read requires projectCue");
console.log("PASS prefetch policy (presentation-only; no hidden Commands)");

const hint = buildCacheHint({
  serverKey: "SRV-DOCUMENTS",
  projectCue: "p2",
  invalidationClass: "intake-submit",
});
assert(hint.disposable && hint.key.includes("p2"), "disposable cache");
assert(
  cacheClearedOnAuthFailure().includes("session"),
  "PC-06 auth clears cache",
);
console.log("PASS cache hints (FE-4.1 / FE-4.3 aligned)");

assert(resolveBundleUnitForPath("/") === "BU-ENTRY", "entry bundle");
assert(resolveBundleUnitForPath("/admin") === "BU-OPS", "ops bundle");
assert(resolveBundleUnitForPath("/builder") === "BU-INTAKE", "intake lazy unit");
assert(opsBundleIsolatedFromEntry(), "BS-02 ops isolated from entry");
console.log("PASS bundle / component split guidance");

assert(
  planListPaintPhases({ rowCount: 0 }).join(",") === "chrome",
  "empty list chrome only",
);
assert(
  planListPaintPhases({ rowCount: 5 }).includes("first-page-rows"),
  "incremental rows",
);
assert(LIST_PAINT_PHASES.length === 3, "list phases");
assert(getScreenReadKeys("SCR-08")[0] === "SRV-DOCUMENTS", "list read keys");
console.log("PASS list paint guidance");

assert(assetLoadPriority("illustrative") === "lazy", "lazy atmosphere");
assert(assetLoadPriority("user-upload") === "not-display", "upload not display");
assert(!assetBlocksPrimaryIntent("illustrative"), "IA-01");
assert(
  shouldDropOpsPayload({ fromScreenId: "SCR-09", toScreenId: "SCR-01" }),
  "RT-05 drop ops payload",
);
assert(
  !shouldDropOpsPayload({ fromScreenId: "SCR-09", toScreenId: "SCR-09" }),
  "stay on ops keeps",
);
console.log("PASS assets + ops memory drop");

for (const id of PERFORMANCE_ANTI_PATTERNS) {
  assert(isPerformanceAntiPattern(id), id);
}
assert(STATE_CLASS_IDS.length === 7, "no new state taxonomy");
assert(createIdleMetaState().loading === "idle", "reuse FE-4.1 meta");

const root = path.resolve(__dirname, "..");
const files = [
  path.join(root, "lib/frontend/presentation-performance.ts"),
  path.join(root, "components/presentation/PresentationSkeleton.tsx"),
];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  assert(!/\bfetch\s*\(/.test(text), `no fetch in ${path.basename(file)}`);
  assert(!/\baxios\b/.test(text), `no axios in ${path.basename(file)}`);
  assert(!/\bprisma\b/i.test(text), `no prisma in ${path.basename(file)}`);
  assert(
    !/from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
      text,
    ),
    `no Domain import in ${path.basename(file)}`,
  );
  assert(!text.includes("export const STATE_CLASS_IDS"), "no taxonomy redefine");
  assert(
    !/\b(evaluatePermission|checkEntitlement|hasRole\s*\()/.test(text),
    "no business engines",
  );
}
console.log("PASS no hidden fetch/API/Domain ownership; no business logic");

console.log("\nFE-4.4 performance presentation verification complete");
