import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { getScreenLayoutBinding } from "../lib/frontend/layout-patterns";
import {
  buildProjectScopedHref,
  OUTCOME_ENTRY_POINTS,
} from "../lib/frontend/navigation";
import { PRESENTATION_ROUTES } from "../lib/frontend/presentation-routes";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertIncludes(label: string, html: string, needles: string[]) {
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length > 0) {
    throw new Error(`${label} missing: ${missing.join(", ")}`);
  }
  console.log(`PASS ${label}`);
}

const absent = renderToStaticMarkup(createElement(WorkspaceScreen));
assertIncludes("SCR-04 markup (no cue)", absent, [
  'data-screen="SCR-04"',
  'data-layout="LAY-SPLIT-3"',
  "LAYCMP-SPLIT-3",
  "CMP-CONV-PANEL",
  "CMP-TASK-PANEL",
  "CMP-CONTEXT-PANEL",
  "CMP-OUTCOME-LINKS",
  "ACT-04-01",
  "ACT-04-02",
  "ACT-04-03",
  "ACT-04-04",
  "ACT-04-05",
  "ACT-04-06",
  "ACT-04-07",
  "ACT-04-08",
  'data-project-cue="absent"',
]);

const present = renderToStaticMarkup(
  createElement(WorkspaceScreen, { projectId: "proj-demo" }),
);
assertIncludes("SCR-04 markup (project cue)", present, [
  'data-project-cue="present"',
  'data-project-id="proj-demo"',
  "/documents?projectId=proj-demo",
  "/solution?projectId=proj-demo",
  "/budget?projectId=proj-demo",
]);

const route = PRESENTATION_ROUTES.find((r) => r.path === "/workspace");
assert(Boolean(route), "RT-WORKSPACE missing");
assert(route?.screenId === "SCR-04", "route screen mismatch");
assert(route?.layoutId === "LAY-SPLIT-3", "route layout mismatch");
assert(route?.pageId === "PG-WORKSPACE", "route page mismatch");
console.log("PASS route /workspace → SCR-04/LAY-SPLIT-3");

const binding = getScreenLayoutBinding("SCR-04");
assert(binding.layoutId === "LAY-SPLIT-3", "layout binding mismatch");
assert(binding.shellMode === "work", "shell mode mismatch");
assert(binding.layoutHostId === "LAYCMP-SPLIT-3", "layout host mismatch");
console.log("PASS layout binding SCR-04 → LAY-SPLIT-3 / work");

assert(
  buildProjectScopedHref("/workspace", "proj-demo") ===
    "/workspace?projectId=proj-demo",
  "project scoped href failed",
);
assert(
  buildProjectScopedHref("/solution", null) === "/solution",
  "empty project href should stay bare",
);
console.log("PASS project cue href helper");

const outcomeActions = OUTCOME_ENTRY_POINTS.map((e) => e.actionId);
assert(outcomeActions.includes("ACT-04-06"), "missing ACT-04-06");
assert(outcomeActions.includes("ACT-04-07"), "missing ACT-04-07");
assert(outcomeActions.includes("ACT-04-08"), "missing ACT-04-08");
console.log("PASS outcome action catalogue");

console.log("FE-2.2 workspace verification complete");
