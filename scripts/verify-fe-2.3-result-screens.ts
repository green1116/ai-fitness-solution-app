import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BudgetResultScreen } from "../components/screens/result/BudgetResultScreen";
import { SolutionResultScreen } from "../components/screens/result/SolutionResultScreen";
import { getScreenLayoutBinding } from "../lib/frontend/layout-patterns";
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

const solution = renderToStaticMarkup(
  createElement(SolutionResultScreen, { projectId: "proj-demo" }),
);
assertIncludes("SCR-05 markup", solution, [
  'data-screen="SCR-05"',
  'data-layout="LAY-RESULT"',
  "LAYCMP-RESULT",
  "CMP-RESULT-SUMMARY",
  "CMP-RESULT-BLOCKS",
  "CMP-ARTIFACT-ACTIONS",
  "CMP-FORWARD-GROUP",
  "ACT-05-01",
  "ACT-05-02",
  "ACT-05-03",
  "ACT-05-04",
  "ACT-05-05",
  "ACT-05-06",
  "ACT-05-07",
  "/budget?projectId=proj-demo",
  "/documents?projectId=proj-demo",
  "/workspace?projectId=proj-demo",
]);

const budget = renderToStaticMarkup(
  createElement(BudgetResultScreen, { projectId: "proj-demo" }),
);
assertIncludes("SCR-06 markup", budget, [
  'data-screen="SCR-06"',
  'data-layout="LAY-RESULT"',
  "LAYCMP-RESULT",
  "CMP-RESULT-SUMMARY",
  "CMP-BUDGET-OVERVIEW",
  "CMP-ARTIFACT-ACTIONS",
  "CMP-FORWARD-GROUP",
  "ACT-06-01",
  "ACT-06-02",
  "ACT-06-03",
  "ACT-06-04",
  "ACT-06-05",
  "/workspace?projectId=proj-demo",
  "/documents?projectId=proj-demo",
  "/solution?projectId=proj-demo",
]);

for (const row of [
  { path: "/solution", screenId: "SCR-05", layoutId: "LAY-RESULT" },
  { path: "/budget", screenId: "SCR-06", layoutId: "LAY-RESULT" },
] as const) {
  const route = PRESENTATION_ROUTES.find((r) => r.path === row.path);
  assert(Boolean(route), `route missing ${row.path}`);
  assert(route?.screenId === row.screenId, `screen mismatch ${row.path}`);
  assert(route?.layoutId === row.layoutId, `layout mismatch ${row.path}`);
  const binding = getScreenLayoutBinding(row.screenId);
  assert(binding.layoutId === "LAY-RESULT", `binding layout ${row.screenId}`);
  assert(binding.shellMode === "result", `shell mode ${row.screenId}`);
  console.log(`PASS route+layout ${row.path} → ${row.screenId}/LAY-RESULT`);
}

console.log("FE-2.3 result screens verification complete");
