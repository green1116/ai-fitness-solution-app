import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { HomepageScreen } from "../components/screens/entry/HomepageScreen";
import { TenderEntryScreen } from "../components/screens/entry/TenderEntryScreen";
import { getScreenLayoutBinding } from "../lib/frontend/layout-patterns";
import { PRESENTATION_ROUTES } from "../lib/frontend/presentation-routes";

function assertIncludes(label: string, html: string, needles: string[]) {
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length > 0) {
    throw new Error(`${label} missing: ${missing.join(", ")}`);
  }
  console.log(`PASS ${label}`);
}

const home = renderToStaticMarkup(createElement(HomepageScreen));
const builder = renderToStaticMarkup(createElement(BuilderEntryScreen));
const tender = renderToStaticMarkup(createElement(TenderEntryScreen));

assertIncludes("SCR-01 markup", home, [
  'data-screen="SCR-01"',
  'data-layout="LAY-ENTRY"',
  "LAYCMP-ENTRY",
  "CMP-ACCESS-SIGNIN",
  "CMP-GOAL-CARD",
  "CMP-NAV-CONTINUITY",
  "ACT-01-03",
  "ACT-01-04",
  "ACT-01-05",
  "ACT-01-06",
]);

assertIncludes("SCR-02 markup", builder, [
  'data-screen="SCR-02"',
  'data-layout="LAY-INTAKE"',
  "LAYCMP-INTAKE",
  "CMP-GUIDE-PANEL",
  "CMP-INPUT-PLANNING",
  "CMP-FORWARD-PRIMARY",
  "ACT-02-01",
  "ACT-02-02",
  "ACT-02-03",
]);

assertIncludes("SCR-03 markup", tender, [
  'data-screen="SCR-03"',
  'data-layout="LAY-INTAKE"',
  "LAYCMP-INTAKE",
  "CMP-GUIDE-PANEL",
  "CMP-UPLOAD-TENDER",
  "CMP-STATUS-PROCESS",
  "CMP-FORWARD-PRIMARY",
  "ACT-03-01",
  "ACT-03-02",
  "ACT-03-03",
]);

const expected = [
  { path: "/", screenId: "SCR-01", layoutId: "LAY-ENTRY" },
  { path: "/builder", screenId: "SCR-02", layoutId: "LAY-INTAKE" },
  { path: "/tender", screenId: "SCR-03", layoutId: "LAY-INTAKE" },
] as const;

for (const row of expected) {
  const route = PRESENTATION_ROUTES.find((r) => r.path === row.path);
  if (!route || route.screenId !== row.screenId || route.layoutId !== row.layoutId) {
    throw new Error(`Route ownership mismatch for ${row.path}`);
  }
  const binding = getScreenLayoutBinding(row.screenId);
  if (binding.layoutId !== row.layoutId) {
    throw new Error(`Layout binding mismatch for ${row.screenId}`);
  }
  console.log(`PASS route+layout ${row.path} → ${row.screenId}/${row.layoutId}`);
}

console.log("FE-2.1 entry screen verification complete");
