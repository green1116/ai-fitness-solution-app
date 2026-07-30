/**
 * FE-4.5 — Frontend verification consolidation (FE-4.1…FE-4.4).
 * Cross-checks state / adapter / security / performance presentation rules.
 * Owns no Domain / API / Persistence behavior.
 */
import fs from "node:fs";
import path from "node:path";

import {
  ADAPTER_BINDINGS,
  BINDING_KINDS,
  SCREEN_READ_TARGETS,
  bindingRequiresHttp,
  getAdapterBinding,
} from "@/lib/frontend/adapter-bindings";
import {
  DATA_FLOW_PIPELINE,
  beginAdapterMeta,
  handoffScreenActionToAdapter,
  planCommandFlow,
  planReadFlow,
  settleAdapterFailure,
  settleAdapterSuccess,
} from "@/lib/frontend/presentation-adapter";
import { emitPresentationIntent } from "@/lib/frontend/interaction-wiring";
import {
  AUTH_PRESENTATION_CLASSES,
  FORBIDDEN_SECURITY_ROUTES,
  SECURITY_BASELINE_ID,
  SECURITY_FALLBACK_ROUTES,
  VISIBILITY_KEYS,
  classifyAuthSignal,
  isAllowedSecurityFallback,
  resolvePermissionVisibility,
  scrubSensitiveFields,
  settleSecuritySignal,
  shouldShowOpsShellNav,
} from "@/lib/frontend/presentation-security";
import {
  BUNDLE_SPLIT_UNITS,
  FETCH_TIMING_CLASSES,
  INITIAL_RENDER_PRIORITY,
  PERFORMANCE_ANTI_PATTERNS,
  PERFORMANCE_BASELINE_ID,
  PREFETCH_IDS,
  PREFETCH_POLICY,
  SCREEN_INITIAL_RENDER,
  SKELETON_MODES,
  opsBundleIsolatedFromEntry,
  planPrefetchHint,
  planScreenEnterPerformance,
  prefetchIssuesCommand,
  resolveBundleUnitForPath,
  screenEnterIssuesCommand,
  shouldDropOpsPayload,
} from "@/lib/frontend/presentation-performance";
import {
  buildServerCacheKey,
  createEmptySharedState,
  createIdleMetaState,
  deriveProjectListView,
} from "@/lib/frontend/presentation-state";
import {
  CACHE_INVALIDATION_POLICY,
  DERIVED_STATE_KEYS,
  SCREEN_STATE_BINDINGS,
  SERVER_STATE_KEYS,
  STATE_CLASS_IDS,
} from "@/lib/frontend/state-taxonomy";
import { PRESENTATION_GUARD_IDS } from "@/lib/frontend/presentation-guards";

export type Fe4VerificationCheck = Readonly<{
  id: string;
  source: "FE-4.1" | "FE-4.2" | "FE-4.3" | "FE-4.4" | "FE-4.5";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type Fe4VerificationReport = Readonly<{
  layer: "FE-4.5";
  passed: boolean;
  checks: readonly Fe4VerificationCheck[];
  summary: Readonly<{
    stateClasses: number;
    adapterBindings: number;
    visibilityKeys: number;
    prefetchIds: number;
    packages: number;
    scannedFiles: number;
  }>;
}>;

const FE4_PACKAGE_IDS = ["FE-4.1", "FE-4.2", "FE-4.3", "FE-4.4"] as const;

const FE4_PRESENTATION_FILES = [
  "lib/frontend/state-taxonomy.ts",
  "lib/frontend/presentation-state.ts",
  "lib/frontend/adapter-bindings.ts",
  "lib/frontend/presentation-adapter.ts",
  "lib/frontend/presentation-security.ts",
  "lib/frontend/presentation-performance.ts",
  "components/presentation/PresentationSkeleton.tsx",
] as const;

function check(
  id: string,
  source: Fe4VerificationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): Fe4VerificationCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function rootDir(): string {
  return path.resolve(__dirname, "../..");
}

function scanOwnership(files: readonly string[]): string[] {
  const hits: string[] = [];
  const domainImport =
    /from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/;
  const fetchCall = /\bfetch\s*\(/;
  const prisma = /\bprisma\b/i;
  const axios = /\baxios\b/;
  const apiImport = /from\s+["'][^"']*\/api\//;
  const engine =
    /\b(evaluatePermission|checkEntitlement|hasRole\s*\(|computeTotal|eligibilityMatrix)\b/;

  for (const rel of files) {
    const abs = path.join(rootDir(), rel);
    if (!fs.existsSync(abs)) {
      hits.push(`${rel}:missing`);
      continue;
    }
    const text = fs.readFileSync(abs, "utf8");
    if (fetchCall.test(text)) hits.push(`${rel}:fetch`);
    if (axios.test(text)) hits.push(`${rel}:axios`);
    if (prisma.test(text)) hits.push(`${rel}:prisma`);
    if (domainImport.test(text)) hits.push(`${rel}:domain-import`);
    if (apiImport.test(text)) hits.push(`${rel}:api-import`);
    if (engine.test(text)) hits.push(`${rel}:biz-engine`);
    if (
      rel !== "lib/frontend/state-taxonomy.ts" &&
      text.includes("export const STATE_CLASS_IDS")
    ) {
      hits.push(`${rel}:taxonomy-redefine`);
    }
  }
  return hits;
}

export function runFe4Verification(): Fe4VerificationReport {
  const checks: Fe4VerificationCheck[] = [];

  // --- FE-4.1 State ---
  checks.push(
    check(
      "ST-TAXONOMY",
      "FE-4.1",
      "Seven ST-* classes locked; no FE-4 expansion",
      STATE_CLASS_IDS.length === 7 &&
        SERVER_STATE_KEYS.length === 11 &&
        DERIVED_STATE_KEYS.length === 5 &&
        SCREEN_STATE_BINDINGS.length === 9,
      `classes=${STATE_CLASS_IDS.length} server=${SERVER_STATE_KEYS.length} derived=${DERIVED_STATE_KEYS.length} screens=${SCREEN_STATE_BINDINGS.length}`,
    ),
  );

  const shared = createEmptySharedState();
  const derived = deriveProjectListView([
    {
      id: "b",
      name: "B",
      status: "Draft",
      createdDate: "2026-01-01",
    },
    {
      id: "a",
      name: "A",
      status: "Active",
      createdDate: "2026-03-01",
    },
  ]);
  checks.push(
    check(
      "ST-DERIVED-PURE",
      "FE-4.1",
      "Derived projections remain pure presentation",
      derived[0]?.id === "a" && shared.projectCue === "",
      `first=${derived[0]?.id ?? "none"} cacheKey=${buildServerCacheKey("SRV-PROJECT", "p1")}`,
    ),
  );

  checks.push(
    check(
      "ST-CACHE-POLICY",
      "FE-4.1",
      "Cache invalidation policy registry present",
      CACHE_INVALIDATION_POLICY.some((p) => p.commandClass === "sign-in-out") &&
        CACHE_INVALIDATION_POLICY.some((p) => p.commandClass === "nav-only"),
      CACHE_INVALIDATION_POLICY.map((p) => p.commandClass).join(","),
    ),
  );

  // --- FE-4.2 Adapter ---
  const kindCounts = { API: 0, "API+NAV": 0, NAV: 0, PREF: 0, NEAREST: 0 };
  let bindingServerOk = true;
  for (const row of ADAPTER_BINDINGS) {
    kindCounts[row.kind] += 1;
    if (
      row.serverKey &&
      !(SERVER_STATE_KEYS as readonly string[]).includes(row.serverKey)
    ) {
      bindingServerOk = false;
    }
    if (bindingRequiresHttp(row.kind) && !row.existingApi) {
      bindingServerOk = false;
    }
  }
  checks.push(
    check(
      "DF-BINDINGS",
      "FE-4.2",
      "PD-2.4 adapter bindings closed (47) with valid ST-SERVER keys",
      ADAPTER_BINDINGS.length === 47 &&
        BINDING_KINDS.length === 5 &&
        bindingServerOk &&
        kindCounts.API === 19 &&
        kindCounts["API+NAV"] === 10 &&
        kindCounts.NAV === 9 &&
        kindCounts.PREF === 1 &&
        kindCounts.NEAREST === 8,
      `n=${ADAPTER_BINDINGS.length} API=${kindCounts.API} API+NAV=${kindCounts["API+NAV"]} NAV=${kindCounts.NAV} PREF=${kindCounts.PREF} NEAREST=${kindCounts.NEAREST}`,
    ),
  );

  checks.push(
    check(
      "DF-PIPELINE",
      "FE-4.2",
      "Canonical INT→…→SCREEN pipeline intact",
      DATA_FLOW_PIPELINE.join("→") ===
        "INT→ACT→COMMAND→ADAPTER→EXISTING_API→RESPONSE→OBJ_ST_SERVER→SCREEN",
      DATA_FLOW_PIPELINE.join("→"),
    ),
  );

  const navPlan = planCommandFlow({ actionId: "ACT-01-03" });
  const intent = emitPresentationIntent({
    intId: "INT-ENTRY-GOAL",
    screenId: "SCR-01",
    actionId: "ACT-01-03",
  });
  const handoff = handoffScreenActionToAdapter({
    actionId: intent.actionId ?? null,
    flowKind: intent.flowKind,
  });
  checks.push(
    check(
      "DF-HANDOFF",
      "FE-4.2",
      "INT→ACT→Adapter handoff; NAV invents no HTTP",
      navPlan.flow === "nav" &&
        !navPlan.requiresHttp &&
        handoff?.flow === "nav" &&
        getAdapterBinding("ACT-01-03")?.command ===
          "ChooseGoal.EnterpriseBuilder",
      `navHttp=${navPlan.requiresHttp} handoff=${handoff?.flow}`,
    ),
  );

  const readOk = SCREEN_READ_TARGETS.every((t) => {
    const plan = planReadFlow({ screenId: t.screenId });
    return plan.flow === "read" && t.readKeys.length >= 1;
  });
  checks.push(
    check(
      "DF-READ-TARGETS",
      "FE-4.2",
      "SCR-01…09 read targets plan without transport ownership",
      SCREEN_READ_TARGETS.length === 9 && readOk,
      `reads=${SCREEN_READ_TARGETS.length}`,
    ),
  );

  // --- FE-4.3 Security ---
  const visOut = resolvePermissionVisibility({ session: null });
  const visOps = resolvePermissionVisibility({
    session: { presentedSession: true, presentedOpsCapability: true },
  });
  checks.push(
    check(
      "SEC-VIS",
      "FE-4.3",
      "Visibility catalogue; visibility ≠ authorization",
      SECURITY_BASELINE_ID === "product-frontend-security-v1" &&
        VISIBILITY_KEYS.length === 6 &&
        visOut.showSignIn &&
        !visOut.showOpsChrome &&
        visOps.showOpsChrome,
      `vis=${VISIBILITY_KEYS.length} guards=${PRESENTATION_GUARD_IDS.length}`,
    ),
  );

  const unauth = settleSecuritySignal({
    status: 401,
    context: "customer-command",
    resumePath: "/workspace",
  });
  const opsDeny = settleSecuritySignal({
    code: "FORBIDDEN",
    context: "grd-ops",
  });
  const noForbidden = FORBIDDEN_SECURITY_ROUTES.every(
    (r) => !isAllowedSecurityFallback(r),
  );
  checks.push(
    check(
      "SEC-FALLBACK",
      "FE-4.3",
      "UNAUTH/FORBIDDEN map to safe fallbacks only",
      AUTH_PRESENTATION_CLASSES.length === 4 &&
        classifyAuthSignal({ status: 403 }) === "FORBIDDEN" &&
        !unauth.session.signedIn &&
        opsDeny.fallback?.to === "/" &&
        SECURITY_FALLBACK_ROUTES.length === 3 &&
        noForbidden,
      `authClass=${unauth.authClass} opsTo=${opsDeny.fallback?.to}`,
    ),
  );

  const scrubbed = scrubSensitiveFields({
    projectId: "p1",
    password: "x",
    otp: "1",
  });
  checks.push(
    check(
      "SEC-SENSITIVE",
      "FE-4.3",
      "Sensitive fields scrubbed from presentation drafts",
      scrubbed.projectId === "p1" &&
        !("password" in scrubbed) &&
        !("otp" in scrubbed) &&
        !shouldShowOpsShellNav({
          shellMode: "work",
          visibility: visOps,
        }),
      `keys=${Object.keys(scrubbed).join(",")}`,
    ),
  );

  // --- FE-4.4 Performance ---
  const enter = planScreenEnterPerformance({
    screenId: "SCR-07",
    projectCue: "p1",
  });
  const cached = planScreenEnterPerformance({
    screenId: "SCR-07",
    projectCue: "p1",
    hasValidCache: true,
  });
  const pf = planPrefetchHint({
    prefetchId: "PF-CODE-NEXT",
    routeRef: "/workspace",
  });
  checks.push(
    check(
      "PERF-ENTER",
      "FE-4.4",
      "Shell-first enter + cache reuse; no auto Command",
      PERFORMANCE_BASELINE_ID === "product-frontend-performance-v1" &&
        INITIAL_RENDER_PRIORITY[0] === "shell-chrome" &&
        enter.timing === "T-ENTER" &&
        enter.meta.loading === "loading" &&
        cached.reuseCache &&
        cached.skeleton === "SK-NONE" &&
        screenEnterIssuesCommand() === false &&
        prefetchIssuesCommand(pf) === false,
      `skeleton=${enter.skeleton} cacheReuse=${cached.reuseCache}`,
    ),
  );

  checks.push(
    check(
      "PERF-SPLIT-PREFETCH",
      "FE-4.4",
      "Bundle split isolates ops; prefetch never Commands",
      BUNDLE_SPLIT_UNITS.length === 8 &&
        FETCH_TIMING_CLASSES.length === 6 &&
        PREFETCH_IDS.length === 3 &&
        SKELETON_MODES.length === 4 &&
        SCREEN_INITIAL_RENDER.length === 9 &&
        PERFORMANCE_ANTI_PATTERNS.length === 8 &&
        opsBundleIsolatedFromEntry() &&
        resolveBundleUnitForPath("/admin") === "BU-OPS" &&
        PREFETCH_POLICY.every((p) => p.allowsCommand === false) &&
        shouldDropOpsPayload({
          fromScreenId: "SCR-09",
          toScreenId: "SCR-01",
        }),
      `ops=${resolveBundleUnitForPath("/admin")} entry=${resolveBundleUnitForPath("/")}`,
    ),
  );

  // --- Cross-package consistency (FE-4.5) ---
  const screenAlign = SCREEN_STATE_BINDINGS.every((binding) => {
    const read = SCREEN_READ_TARGETS.find((t) => t.screenId === binding.screenId);
    const posture = SCREEN_INITIAL_RENDER.find(
      (t) => t.screenId === binding.screenId,
    );
    return Boolean(read && posture);
  });
  checks.push(
    check(
      "X-SCREEN-ALIGN",
      "FE-4.5",
      "State / read / performance postures align on SCR-01…09",
      screenAlign &&
        SCREEN_STATE_BINDINGS.length === SCREEN_READ_TARGETS.length &&
        SCREEN_READ_TARGETS.length === SCREEN_INITIAL_RENDER.length,
      `bindings=${SCREEN_STATE_BINDINGS.length}`,
    ),
  );

  const metaStart = beginAdapterMeta(createIdleMetaState());
  const fail = settleAdapterFailure({ status: 403 });
  const okSettle = settleAdapterSuccess({
    meta: metaStart,
    serverKey: "SRV-PROJECT",
    empty: false,
  });
  const secFail = settleSecuritySignal({ status: 403, context: "customer-command" });
  checks.push(
    check(
      "X-ADAPTER-SECURITY",
      "FE-4.5",
      "Adapter failure uses security copy; no fake ST-SERVER writes",
      metaStart.loading === "loading" &&
        fail.meta.error === "Access unavailable" &&
        !fail.wroteServer &&
        okSettle.wroteServer &&
        secFail.authClass === "FORBIDDEN",
      `fail=${fail.meta.error} wrote=${fail.wroteServer}`,
    ),
  );

  const enterReadKey = planReadFlow({ screenId: "SCR-07" }).serverKey;
  checks.push(
    check(
      "X-PERF-ADAPTER-STATE",
      "FE-4.5",
      "Performance enter reuses adapter read + FE-4.1 cache keys",
      enterReadKey === "SRV-PROJECT" &&
        enter.cacheKey === buildServerCacheKey("SRV-PROJECT", "p1") &&
        enter.readPlanRequiresHttp === true,
      `cacheKey=${enter.cacheKey}`,
    ),
  );

  checks.push(
    check(
      "X-PACKAGES",
      "FE-4.5",
      "FE-4.1…FE-4.4 packages consolidated (no new taxonomy package)",
      FE4_PACKAGE_IDS.length === 4 && STATE_CLASS_IDS.length === 7,
      FE4_PACKAGE_IDS.join(","),
    ),
  );

  const ownershipHits = scanOwnership(FE4_PRESENTATION_FILES);
  checks.push(
    check(
      "NO-BIZ-LOGIC",
      "FE-4.5",
      "No Domain/API/Persistence ownership in FE-4 presentation modules",
      ownershipHits.length === 0,
      ownershipHits.length
        ? ownershipHits.join(",")
        : `scanned=${FE4_PRESENTATION_FILES.length} files`,
    ),
  );

  const childScripts = [
    "scripts/verify-fe-4.1-state.ts",
    "scripts/verify-fe-4.2-adapter.ts",
    "scripts/verify-fe-4.3-security.ts",
    "scripts/verify-fe-4.4-performance.ts",
  ];
  const missingScripts = childScripts.filter(
    (rel) => !fs.existsSync(path.join(rootDir(), rel)),
  );
  checks.push(
    check(
      "CHILD-EVIDENCE",
      "FE-4.5",
      "Child FE-4.1…FE-4.4 verification scripts present",
      missingScripts.length === 0,
      missingScripts.length ? missingScripts.join(",") : childScripts.join(","),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "FE-4.5",
    passed,
    checks,
    summary: {
      stateClasses: STATE_CLASS_IDS.length,
      adapterBindings: ADAPTER_BINDINGS.length,
      visibilityKeys: VISIBILITY_KEYS.length,
      prefetchIds: PREFETCH_IDS.length,
      packages: FE4_PACKAGE_IDS.length,
      scannedFiles: FE4_PRESENTATION_FILES.length,
    },
  };
}

export function assertFe4Verification(
  report: Fe4VerificationReport = runFe4Verification(),
): Fe4VerificationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `FE-4.5 verification failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
