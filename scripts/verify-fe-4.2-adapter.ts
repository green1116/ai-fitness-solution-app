/**
 * FE-4.2 — Adapter / Data Flow verification (PD-4.5).
 */
import fs from "node:fs";
import path from "node:path";

import {
  ADAPTER_BINDINGS,
  BINDING_KINDS,
  SCREEN_READ_TARGETS,
  bindingRequiresHttp,
  getAdapterBinding,
} from "../lib/frontend/adapter-bindings";
import {
  DATA_FLOW_PIPELINE,
  PIPELINE_STAGE_OWNERS,
  adapterLeavesDerivedToPresentation,
  beginAdapterMeta,
  buildRequestView,
  handoffScreenActionToAdapter,
  mapArtifactAffordanceResponse,
  mapDocumentListResponse,
  mapErrorCodeToMessage,
  mapProjectListResponse,
  mapStatusProcessResponse,
  planCommandFlow,
  planReadFlow,
  settleAdapterFailure,
  settleAdapterSuccess,
} from "../lib/frontend/presentation-adapter";
import { emitPresentationIntent } from "../lib/frontend/interaction-wiring";
import {
  STATE_CLASS_IDS,
  SERVER_STATE_KEYS,
} from "../lib/frontend/state-taxonomy";
import { createIdleMetaState } from "../lib/frontend/presentation-state";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// --- Catalogue / PD-2.4 coverage ---
assert(ADAPTER_BINDINGS.length === 47, `expected 47 bindings, got ${ADAPTER_BINDINGS.length}`);
assert(BINDING_KINDS.length === 5, "five binding kinds");

const kindCounts = { API: 0, "API+NAV": 0, NAV: 0, PREF: 0, NEAREST: 0 };
for (const row of ADAPTER_BINDINGS) {
  kindCounts[row.kind] += 1;
  if (bindingRequiresHttp(row.kind)) {
    assert(Boolean(row.existingApi), `${row.actionId} needs existingApi`);
  } else {
    assert(row.existingApi === null, `${row.actionId} must not invent API`);
  }
  if (row.kind === "NAV" || row.kind === "API+NAV") {
    assert(Boolean(row.navigateTo), `${row.actionId} needs navigateTo`);
  }
  if (row.serverKey) {
    assert(
      (SERVER_STATE_KEYS as readonly string[]).includes(row.serverKey),
      `${row.actionId} unknown server key`,
    );
  }
}
// Counts from PD-2.4 action rows (table), not the summary line.
assert(kindCounts.API === 19, `API count=${kindCounts.API}`);
assert(kindCounts["API+NAV"] === 10, `API+NAV count=${kindCounts["API+NAV"]}`);
assert(kindCounts.NAV === 9, `NAV count=${kindCounts.NAV}`);
assert(kindCounts.PREF === 1, "PREF count");
assert(kindCounts.NEAREST === 8, `NEAREST count=${kindCounts.NEAREST}`);
console.log("PASS PD-2.4 binding catalogue (47) + kind counts");

// --- Pipeline ownership ---
assert(DATA_FLOW_PIPELINE.length === 8, "pipeline stages");
assert(
  DATA_FLOW_PIPELINE.join("→") ===
    "INT→ACT→COMMAND→ADAPTER→EXISTING_API→RESPONSE→OBJ_ST_SERVER→SCREEN",
  "canonical pipeline order",
);
assert(PIPELINE_STAGE_OWNERS.ADAPTER === "Frontend delivery", "adapter owner");
assert(PIPELINE_STAGE_OWNERS.EXISTING_API === "Backend contract", "api owner");
console.log("PASS PD-4.5 canonical pipeline + ownership");

// --- Read targets ---
assert(SCREEN_READ_TARGETS.length === 9, "SCR-01…09 read targets");
for (const t of SCREEN_READ_TARGETS) {
  assert(t.readKeys.length >= 1, `${t.screenId} read key`);
  const plan = planReadFlow({ screenId: t.screenId, projectCue: "p1" });
  assert(plan.flow === "read", `${t.screenId} read flow`);
  assert(plan.pipeline === DATA_FLOW_PIPELINE, "read reuses pipeline");
}
console.log("PASS PD-4.5 screen read flow plans");

// --- Command / NAV / PREF ---
const nav = planCommandFlow({ actionId: "ACT-01-03" });
assert(nav.flow === "nav" && !nav.requiresHttp, "NAV no HTTP");
assert(nav.navigateTo === "/builder", "NAV target");
assert(nav.transport.mode === "none", "NAV transport none");

const pref = planCommandFlow({ actionId: "ACT-01-02" });
assert(pref.flow === "pref" && !pref.requiresHttp, "PREF no HTTP");

const api = planCommandFlow({
  actionId: "ACT-03-01",
  localDraft: { fileName: "t.pdf", projectId: "p1", secretBiz: "x" },
});
assert(api.requiresHttp && api.transport.mode === "existing-api", "API http");
if (api.transport.mode === "existing-api") {
  assert(api.transport.routeRef === "/api/v80/tender/intake", "existing route ref");
  assert(api.transport.requestView.fileName === "t.pdf", "draft pick");
  assert(
    !("secretBiz" in api.transport.requestView),
    "no extra business payload",
  );
}

const apiNav = planCommandFlow({ actionId: "ACT-07-02", localDraft: { projectId: "p9" } });
assert(apiNav.navigateTo === "/workspace", "API+NAV navigate");
assert(apiNav.invalidationTargets.includes("project-scoped"), "invalidate");
console.log("PASS command flow kinds (NAV/PREF/API/API+NAV)");

// --- INT → ACT → Adapter handoff (P-01) ---
const intent = emitPresentationIntent({
  intId: "INT-ENTRY-GOAL",
  screenId: "SCR-01",
  actionId: "ACT-01-03",
});
const handoff = handoffScreenActionToAdapter({
  actionId: intent.actionId ?? null,
  flowKind: intent.flowKind,
});
assert(handoff?.flow === "nav", "handoff after Screen Action");
assert(getAdapterBinding("ACT-01-03")?.command === "ChooseGoal.EnterpriseBuilder", "command name");
console.log("PASS INT→ACT→Adapter handoff (no component skip)");

// --- Meta / error / empty ---
let meta = beginAdapterMeta(createIdleMetaState());
assert(meta.loading === "loading", "META loading");
const ok = settleAdapterSuccess({
  meta,
  serverKey: "SRV-PROJECT",
  empty: false,
});
assert(ok.meta.loading === "success" && ok.wroteServer, "success writes server flag");
const empty = settleAdapterSuccess({
  meta: createIdleMetaState(),
  empty: true,
  emptyGuidanceRoute: "/projects",
  serverKey: "SRV-PROJECT",
});
assert(empty.meta.empty && !empty.wroteServer, "empty ≠ invent objects");
const fail = settleAdapterFailure({ code: "401" });
assert(fail.meta.error === "Sign in required" && !fail.wroteServer, "P-04 no fake success");
assert(mapErrorCodeToMessage("NETWORK") === "Connection unavailable", "error copy");
console.log("PASS ST-META loading / empty / error flows");

// --- Transformation boundary ---
const projects = mapProjectListResponse([
  { projectId: "b", label: "Beta", status: "Draft", createdAt: "2026-01-01" },
  { id: "a", name: "Alpha", status: "Active", createdDate: "2026-02-01" },
]);
assert(projects.length === 2 && projects[1]?.name === "Alpha", "project field rename");
assert(mapProjectListResponse(null).length === 0, "no invented list");
const docs = mapDocumentListResponse([
  { id: "d1", name: "Plan", category: "solution" },
  { id: "d2", name: "X", category: "invented" },
]);
assert(docs.length === 1 && docs[0]?.category === "solution", "drop unknown category");
const status = mapStatusProcessResponse({ status: "Processing", message: "Wait" });
assert(status.statusLabel === "Processing", "status map");
const art = mapArtifactAffordanceResponse({ artifactId: "a1", href: "/x" });
assert(art.canDownload && art.artifactId === "a1", "artifact affordance");
assert(adapterLeavesDerivedToPresentation() === true, "T-02 derived after adapter");
assert(
  Object.keys(buildRequestView("ACT-02-02", { goalCue: "Builder", pricing: "99" })).join(",") ===
    "goalCue",
  "T-03 no extra fields",
);
console.log("PASS transformation boundary (map-only)");

// --- No new state taxonomy ---
assert(STATE_CLASS_IDS.length === 7, "taxonomy unchanged (7 classes)");
assert(
  !(
    fs
      .readFileSync(
        path.join(__dirname, "../lib/frontend/adapter-bindings.ts"),
        "utf8",
      )
      .includes("export const STATE_CLASS_IDS") ||
    fs
      .readFileSync(
        path.join(__dirname, "../lib/frontend/presentation-adapter.ts"),
        "utf8",
      )
      .includes("export const STATE_CLASS_IDS")
  ),
  "adapter must not redefine state taxonomy",
);
console.log("PASS no new state taxonomy");

// --- Presentation-only / no fetch ownership ---
const root = path.resolve(__dirname, "..");
const files = [
  path.join(root, "lib/frontend/adapter-bindings.ts"),
  path.join(root, "lib/frontend/presentation-adapter.ts"),
];
const forbidden =
  /\b(fetch\s*\(|axios\b|prisma\b|from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)|["']\/api\/)/;
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  // Allow string literals that document existing API refs inside existingApi fields,
  // but forbid executable imports / fetch calls / Domain module imports.
  assert(!/\bfetch\s*\(/.test(text), `fetch call in ${path.basename(file)}`);
  assert(!/\baxios\b/.test(text), `axios in ${path.basename(file)}`);
  assert(!/\bprisma\b/i.test(text), `prisma in ${path.basename(file)}`);
  assert(
    !/from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
      text,
    ),
    `Domain import in ${path.basename(file)}`,
  );
  assert(
    !/from\s+["'][^"']*\/api\//.test(text),
    `API module import in ${path.basename(file)}`,
  );
}
void forbidden;
console.log("PASS adapter presentation-only (no fetch/API/Domain ownership)");

console.log("\nFE-4.2 adapter / data flow verification complete");
