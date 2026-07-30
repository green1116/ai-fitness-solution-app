/**
 * FE-4.1 — Frontend State Foundation verification (PD-4.3).
 */
import fs from "node:fs";
import path from "node:path";

import {
  CACHE_INVALIDATION_POLICY,
  CONTEXT_STATE_KEYS,
  DERIVED_STATE_KEYS,
  LOCAL_STATE_KEYS,
  META_STATE_KEYS,
  SCREEN_STATE_BINDINGS,
  SERVER_STATE_KEYS,
  SESSION_STATE_KEYS,
  SHARED_STATE_KEYS,
  STATE_CLASS_IDS,
} from "../lib/frontend/state-taxonomy";
import {
  applyRouteContextToShared,
  buildServerCacheKey,
  createEmptySharedState,
  createIdleMetaState,
  deriveDocumentsByCategory,
  deriveForwardEnabled,
  deriveGoldenPathStep,
  deriveProjectListView,
  deriveShellContextLabel,
  mapSessionObservation,
  readNavigationContext,
  resolveProjectCue,
  setMetaEmpty,
  setMetaError,
  setMetaLoading,
} from "../lib/frontend/presentation-state";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(STATE_CLASS_IDS.length === 7, "expected 7 ST-* classes");
assert(LOCAL_STATE_KEYS.length === 9, "local catalogue");
assert(SHARED_STATE_KEYS.length === 5, "shared catalogue");
assert(SERVER_STATE_KEYS.length === 11, "server catalogue");
assert(DERIVED_STATE_KEYS.length === 5, "derived catalogue");
assert(META_STATE_KEYS.length === 3, "meta catalogue");
assert(SESSION_STATE_KEYS.length === 3, "session catalogue");
assert(CONTEXT_STATE_KEYS.length === 5, "context catalogue");
assert(SCREEN_STATE_BINDINGS.length === 9, "screen state bindings");
console.log("PASS PD-4.3 state taxonomy catalogues");

const shared = applyRouteContextToShared(createEmptySharedState(), {
  projectId: "proj-demo",
  docCategory: "solution",
});
assert(shared.projectCue === "proj-demo", "CX-01 project cue from route");
assert(shared.libraryCategory === "solution", "CX-01 category sync");
assert(
  resolveProjectCue({
    routeProjectId: "from-route",
    sharedProjectCue: "from-shared",
  }) === "from-route",
  "route wins over shared cue",
);
console.log("PASS ST-SHARED / ST-CONTEXT route-wins rules");

const ctx = readNavigationContext({
  pathname: "/documents",
  projectId: "p1",
  category: "budget",
  area: "users",
});
assert(ctx.docCategory === "budget", "context category");
assert(ctx.adminArea === "users", "admin area cue");
console.log("PASS ST-CONTEXT reader");

const session = mapSessionObservation({
  presentedSession: true,
  presentedOpsCapability: false,
});
assert(session.signedIn && !session.opsCapable, "session mapping");
console.log("PASS ST-SESSION observation mapping");

let meta = createIdleMetaState();
meta = setMetaLoading(meta, "loading");
assert(meta.loading === "loading" && meta.error === null, "meta loading");
meta = setMetaError(meta, "Unavailable");
assert(meta.error === "Unavailable" && meta.loading === "idle", "meta error");
meta = setMetaEmpty(createIdleMetaState(), true, "/projects");
assert(meta.empty && meta.emptyGuidanceRoute === "/projects", "meta empty");
console.log("PASS ST-META helpers");

const rows = deriveProjectListView([
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
assert(rows[0]?.id === "a", "project list sorted by createdDate desc");

const docs = deriveDocumentsByCategory(
  [
    { id: "1", label: "S", category: "solution" },
    { id: "2", label: "B", category: "budget" },
  ],
  "solution",
);
assert(docs.length === 1 && docs[0]?.id === "1", "doc category filter");
assert(
  deriveShellContextLabel({ projectCue: "proj-x" }) === "proj-x",
  "shell label from cue",
);
assert(
  deriveForwardEnabled({
    meta: { loading: "loading", error: null, empty: false },
  }) === false,
  "forward disabled while loading",
);
assert(deriveGoldenPathStep("/workspace") === "GP-WORKSPACE", "gp step");
console.log("PASS ST-DERIVED pure projections");

assert(
  buildServerCacheKey("SRV-PROJECT", "p1") === "SRV-PROJECT:project:p1",
  "cache key",
);
assert(
  CACHE_INVALIDATION_POLICY.some((p) => p.commandClass === "nav-only"),
  "nav-only invalidation policy",
);
console.log("PASS cache key + invalidation policy registry");

const root = path.resolve(__dirname, "..");
const files = [
  path.join(root, "lib/frontend/state-taxonomy.ts"),
  path.join(root, "lib/frontend/presentation-state.ts"),
];
const forbidden = /\b(fetch\s*\(|prisma\b|from\s+["']@\/lib\/(services|product|tender|saas|billing)|["']\/api\/)/;
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  assert(!forbidden.test(text), `business ownership in ${path.basename(file)}`);
}
console.log("PASS no business logic in FE-4.1 state modules");

console.log("\nFE-4.1 state foundation verification complete");
