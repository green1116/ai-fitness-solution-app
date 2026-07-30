import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentsScreen } from "../components/screens/library/DocumentsScreen";
import { ProjectsScreen } from "../components/screens/library/ProjectsScreen";
import { getScreenLayoutBinding } from "../lib/frontend/layout-patterns";
import {
  buildDocumentsHref,
  buildProjectScopedHref,
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

const projects = renderToStaticMarkup(createElement(ProjectsScreen));
assertIncludes("SCR-07 markup", projects, [
  'data-screen="SCR-07"',
  'data-layout="LAY-LIST"',
  "LAYCMP-LIST",
  "CMP-PROJECT-LIST",
  "CMP-PROJECT-ROW",
  "ACT-07-01",
  "ACT-07-02",
  "ACT-07-03",
  "/workspace?projectId=proj-alpha",
  "/documents?projectId=proj-alpha",
]);

const documents = renderToStaticMarkup(
  createElement(DocumentsScreen, {
    projectId: "proj-demo",
    category: "solution",
  }),
);
assertIncludes("SCR-08 markup", documents, [
  'data-screen="SCR-08"',
  'data-layout="LAY-LIBRARY"',
  "LAYCMP-LIBRARY",
  "CMP-DOC-CATEGORIES",
  "CMP-DOC-ITEM",
  "CMP-ARTIFACT-ACTIONS",
  "CMP-FORWARD-GROUP",
  "ACT-08-01",
  "ACT-08-02",
  "ACT-08-03",
  "ACT-08-04",
  "ACT-08-05",
  "ACT-08-06",
  'data-doc-category="solution"',
  "/workspace?projectId=proj-demo",
]);

for (const row of [
  { path: "/projects", screenId: "SCR-07", layoutId: "LAY-LIST", shell: "library" },
  {
    path: "/documents",
    screenId: "SCR-08",
    layoutId: "LAY-LIBRARY",
    shell: "library",
  },
] as const) {
  const route = PRESENTATION_ROUTES.find((r) => r.path === row.path);
  assert(Boolean(route), `route missing ${row.path}`);
  assert(route?.screenId === row.screenId, `screen mismatch ${row.path}`);
  assert(route?.layoutId === row.layoutId, `layout mismatch ${row.path}`);
  const binding = getScreenLayoutBinding(row.screenId);
  assert(binding.layoutId === row.layoutId, `binding ${row.screenId}`);
  assert(binding.shellMode === row.shell, `shell ${row.screenId}`);
  console.log(
    `PASS route+layout ${row.path} → ${row.screenId}/${row.layoutId}`,
  );
}

assert(
  buildDocumentsHref({ projectId: "p1", category: "budget" }) ===
    "/documents?projectId=p1&category=budget",
  "documents href failed",
);
assert(
  buildProjectScopedHref("/projects", "x") === "/projects?projectId=x",
  "projects scoped href unexpected but ok if used",
);
console.log("PASS documents category href helper");

console.log("FE-2.4 library screens verification complete");
