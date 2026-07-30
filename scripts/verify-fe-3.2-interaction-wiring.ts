/**
 * FE-3.2 — Interaction wiring verification (PD-3.5 / PD-4.5).
 */
import fs from "node:fs";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HomepageScreen } from "../components/screens/entry/HomepageScreen";
import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { TenderEntryScreen } from "../components/screens/entry/TenderEntryScreen";
import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { SolutionResultScreen } from "../components/screens/result/SolutionResultScreen";
import { BudgetResultScreen } from "../components/screens/result/BudgetResultScreen";
import { ProjectsScreen } from "../components/screens/library/ProjectsScreen";
import { DocumentsScreen } from "../components/screens/library/DocumentsScreen";
import { AdminDashboardScreen } from "../components/screens/ops/AdminDashboardScreen";
import {
  emitPresentationIntent,
  GOLDEN_PATH_INT_CHAINS,
  INTERACTION_BINDINGS,
  INTERACTION_COUNT,
  INTERACTION_IDS,
  resolveScreenAction,
} from "../lib/frontend/interaction-wiring";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(INTERACTION_COUNT === 25, `expected 25 INT-*, got ${INTERACTION_COUNT}`);
assert(
  INTERACTION_BINDINGS.length === 25,
  `bindings length ${INTERACTION_BINDINGS.length}`,
);
assert(
  new Set(INTERACTION_IDS).size === 25,
  "duplicate INT ids in catalogue",
);
console.log("PASS INT catalogue locked at 25 (no new interactions)");

// Every INT binds to ≥1 Screen and ≥1 Component
for (const binding of INTERACTION_BINDINGS) {
  assert(binding.screenIds.length > 0, `${binding.id} missing screens`);
  assert(binding.componentIds.length > 0, `${binding.id} missing components`);
  assert(Boolean(binding.flowKind), `${binding.id} missing PD-4.5 flowKind`);
}
console.log("PASS INT-* binds to existing Screens + Components + flowKind");

// Screen Action resolution (PD-4.5 INT → ACT)
const signIn = resolveScreenAction({
  intId: "INT-ACCESS-SIGNIN",
  screenId: "SCR-01",
  actionId: "ACT-01-01",
});
assert(signIn.ok && signIn.flowKind === "NAV", "signin flow");

const language = resolveScreenAction({
  intId: "INT-ACCESS-LANGUAGE",
  screenId: "SCR-01",
  actionId: "ACT-01-02",
});
assert(language.ok && language.flowKind === "PREF", "language pref flow");

const reject = resolveScreenAction({
  intId: "INT-ENTRY-GOAL",
  screenId: "SCR-04",
  actionId: "ACT-01-03",
});
assert(!reject.ok, "goal INT must not bind to SCR-04");

const emitted = emitPresentationIntent({
  intId: "INT-FORWARD-PRIMARY",
  screenId: "SCR-02",
  actionId: "ACT-02-03",
  componentId: "CMP-FORWARD-PRIMARY",
});
assert(emitted.accepted && emitted.flowKind === "NAV", "emit NAV intent");
console.log("PASS PD-4.5 INT → ACT resolution (NAV/PREF) without Adapter");

// Markup wiring evidence
const screens = [
  { id: "SCR-01", html: renderToStaticMarkup(createElement(HomepageScreen)), ints: ["INT-ACCESS-SIGNIN", "INT-ACCESS-LANGUAGE", "INT-ENTRY-GOAL", "INT-ENTRY-CONTINUITY"] },
  { id: "SCR-02", html: renderToStaticMarkup(createElement(BuilderEntryScreen)), ints: ["INT-INTAKE-START", "INT-INTAKE-INPUT", "INT-FORWARD-PRIMARY"] },
  { id: "SCR-03", html: renderToStaticMarkup(createElement(TenderEntryScreen)), ints: ["INT-INTAKE-UPLOAD", "INT-INTAKE-STATUS", "INT-FORWARD-PRIMARY"] },
  { id: "SCR-04", html: renderToStaticMarkup(createElement(WorkspaceScreen, { projectId: "p1" })), ints: ["INT-WS-CONVERSE", "INT-WS-TASK", "INT-WS-CONTEXT", "INT-WS-OUTCOME"] },
  { id: "SCR-05", html: renderToStaticMarkup(createElement(SolutionResultScreen, { projectId: "p1" })), ints: ["INT-RESULT-REVIEW", "INT-ARTIFACT-DOWNLOAD", "INT-ARTIFACT-SHARE", "INT-FORWARD-GROUP"] },
  { id: "SCR-06", html: renderToStaticMarkup(createElement(BudgetResultScreen, { projectId: "p1" })), ints: ["INT-RESULT-REVIEW", "INT-ARTIFACT-DOWNLOAD", "INT-FORWARD-GROUP"] },
  { id: "SCR-07", html: renderToStaticMarkup(createElement(ProjectsScreen)), ints: ["INT-LIST-BROWSE", "INT-LIST-CONTINUE", "INT-LIST-DOCS"] },
  { id: "SCR-08", html: renderToStaticMarkup(createElement(DocumentsScreen, { projectId: "p1", category: "solution" })), ints: ["INT-LIB-CATEGORY", "INT-LIB-SELECT", "INT-ARTIFACT-PREVIEW", "INT-ARTIFACT-DOWNLOAD", "INT-ARTIFACT-SHARE", "INT-FORWARD-GROUP"] },
  { id: "SCR-09", html: renderToStaticMarkup(createElement(AdminDashboardScreen, { area: "usage" })), ints: ["INT-OPS-VIEW"] },
] as const;

for (const screen of screens) {
  for (const intId of screen.ints) {
    assert(
      screen.html.includes(`data-int-id="${intId}"`),
      `${screen.id} missing wired ${intId}`,
    );
  }
  console.log(`PASS ${screen.id} INT wiring present`);
}

// GP chains reference only catalogue INTs
for (const [gp, chain] of Object.entries(GOLDEN_PATH_INT_CHAINS)) {
  for (const intId of chain) {
    assert(
      (INTERACTION_IDS as readonly string[]).includes(intId),
      `${gp} references unknown ${intId}`,
    );
  }
}
console.log("PASS Golden Path INT chains stay inside catalogue");

// No business ownership in wiring module / features / screens int attrs
const wiring = fs.readFileSync(
  path.join(ROOT, "lib", "frontend", "interaction-wiring.ts"),
  "utf8",
);
assert(!/\bfetch\s*\(|prisma\b|["']\/api\//.test(wiring), "wiring has API ownership");
console.log("PASS no business logic in interaction wiring");

// No extra INT ids in FE surfaces
const scanDirs = [
  path.join(ROOT, "components", "screens"),
  path.join(ROOT, "components", "features"),
  path.join(ROOT, "components", "navigation"),
];
const found = new Set<string>();
for (const dir of scanDirs) {
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (full.endsWith(".tsx")) {
        const text = fs.readFileSync(full, "utf8");
        for (const match of text.matchAll(/data-int-id="(INT-[A-Z0-9-]+)"/g)) {
          found.add(match[1]);
        }
      }
    }
  };
  walk(dir);
}
const extras = [...found].filter(
  (id) => !(INTERACTION_IDS as readonly string[]).includes(id),
);
assert(extras.length === 0, `new INT ids introduced: ${extras.join(", ")}`);
console.log(`PASS no new INT-* in markup (${found.size} wired from catalogue)`);

console.log("\nFE-3.2 interaction wiring verification complete");
