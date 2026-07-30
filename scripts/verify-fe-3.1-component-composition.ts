/**
 * FE-3.1 — Component Composition verification (PD-3.4 / PD-4.4).
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
  FEATCMP_COUNT,
  FEATCMP_IDS,
  PRODUCT_CMP_COUNT,
  PRODUCT_CMP_IDS,
  SCRCMP_COUNT,
  SCRCMP_IDS,
  SCREEN_CMP_COMPOSITION,
} from "../lib/frontend/component-composition";

const ROOT = path.resolve(__dirname, "..");

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

assert(PRODUCT_CMP_COUNT === 26, `product CMP count ${PRODUCT_CMP_COUNT}`);
assert(FEATCMP_COUNT === 11, `FEATCMP count ${FEATCMP_COUNT}`);
assert(SCRCMP_COUNT === 9, `SCRCMP count ${SCRCMP_COUNT}`);
console.log("PASS catalogue sizes (26 CMP / 11 FEATCMP / 9 SCRCMP)");

const renders: Array<{ screenId: string; html: string }> = [
  { screenId: "SCR-01", html: renderToStaticMarkup(createElement(HomepageScreen)) },
  {
    screenId: "SCR-02",
    html: renderToStaticMarkup(createElement(BuilderEntryScreen)),
  },
  {
    screenId: "SCR-03",
    html: renderToStaticMarkup(createElement(TenderEntryScreen)),
  },
  {
    screenId: "SCR-04",
    html: renderToStaticMarkup(
      createElement(WorkspaceScreen, { projectId: "proj-demo" }),
    ),
  },
  {
    screenId: "SCR-05",
    html: renderToStaticMarkup(
      createElement(SolutionResultScreen, { projectId: "proj-demo" }),
    ),
  },
  {
    screenId: "SCR-06",
    html: renderToStaticMarkup(
      createElement(BudgetResultScreen, { projectId: "proj-demo" }),
    ),
  },
  { screenId: "SCR-07", html: renderToStaticMarkup(createElement(ProjectsScreen)) },
  {
    screenId: "SCR-08",
    html: renderToStaticMarkup(
      createElement(DocumentsScreen, {
        projectId: "proj-demo",
        category: "solution",
      }),
    ),
  },
  {
    screenId: "SCR-09",
    html: renderToStaticMarkup(
      createElement(AdminDashboardScreen, { area: "usage" }),
    ),
  },
];

for (const entry of SCREEN_CMP_COMPOSITION) {
  const rendered = renders.find((r) => r.screenId === entry.screenId);
  assert(Boolean(rendered), `missing render ${entry.screenId}`);
  const html = rendered!.html;

  assertIncludes(`${entry.screenId} SCRCMP+LAY`, html, [
    `data-scrcmp="${entry.scrcmpId}"`,
    `data-layout-host="${entry.laycmpId}"`,
  ]);

  for (const feat of entry.featcmpIds) {
    assert(
      html.includes(`data-featcmp="${feat}"`),
      `${entry.screenId} missing ${feat}`,
    );
  }

  for (const cmp of entry.screenCmps) {
    assert(html.includes(`data-cmp="${cmp}"`), `${entry.screenId} missing ${cmp}`);
  }

  console.log(
    `PASS ${entry.screenId} → ${entry.scrcmpId} / ${entry.laycmpId} / ${entry.featcmpIds.join("+")}`,
  );
}

// CR-03: three goal cards
const home = renders.find((r) => r.screenId === "SCR-01")!.html;
const goalCards = (home.match(/data-cmp="CMP-GOAL-CARD"/g) ?? []).length;
assert(goalCards === 3, `expected 3 goal cards, got ${goalCards}`);
console.log("PASS CR-03 CMP-GOAL-CARD ×3");

// CR-04: split-3 trio
const workspace = renders.find((r) => r.screenId === "SCR-04")!.html;
assertIncludes("CR-04 LAY-SPLIT-3 trio", workspace, [
  "CMP-CONV-PANEL",
  "CMP-TASK-PANEL",
  "CMP-CONTEXT-PANEL",
]);

// CR-07: four categories
const documents = renders.find((r) => r.screenId === "SCR-08")!.html;
for (const cat of ["solution", "budget", "tender", "delivery"]) {
  assert(
    documents.includes(`data-doc-category="${cat}"`),
    `missing category ${cat}`,
  );
}
console.log("PASS CR-07 four document categories");

// CR-08: five ops areas
const admin = renders.find((r) => r.screenId === "SCR-09")!.html;
const opsAreas = (admin.match(/data-cmp="CMP-OPS-AREA"/g) ?? []).length;
assert(opsAreas === 5, `expected 5 ops areas, got ${opsAreas}`);
console.log("PASS CR-08 CMP-OPS-AREA ×5");

// No product CMP IDs outside catalogue in screens+features
const scanRoots = [
  path.join(ROOT, "components", "screens"),
  path.join(ROOT, "components", "features"),
];
const found = new Set<string>();
for (const root of scanRoots) {
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (full.endsWith(".tsx")) {
        const text = fs.readFileSync(full, "utf8");
        for (const match of text.matchAll(/data-cmp="(CMP-[A-Z0-9-]+)"/g)) {
          const id = match[1];
          // ignore set wrappers and non-catalogue helpers
          if (
            id.endsWith("-SET") ||
            id === "CMP-ACCESS" ||
            id === "CMP-OUTCOME-LINK"
          ) {
            continue;
          }
          found.add(id);
        }
      }
    }
  };
  walk(root);
}

const catalogue = new Set<string>(PRODUCT_CMP_IDS);
const extras = [...found].filter((id) => !catalogue.has(id));
assert(
  extras.length === 0,
  `new/non-catalogue CMP ids: ${extras.join(", ")}`,
);
const missingImpl = PRODUCT_CMP_IDS.filter(
  (id) =>
    !["CMP-SHELL-HEADER", "CMP-SHELL-CONTEXT", "CMP-SHELL-FOOTER"].includes(
      id,
    ) && !found.has(id),
);
assert(
  missingImpl.length === 0,
  `catalogue CMP not composed in screens/features: ${missingImpl.join(", ")}`,
);
console.log("PASS no new product CMP-* (closed catalogue of 26)");

// Shell CMPs exist in FE-1 shell hosts
const header = fs.readFileSync(
  path.join(ROOT, "components", "application-shell", "ApplicationHeader.tsx"),
  "utf8",
);
const footer = fs.readFileSync(
  path.join(ROOT, "components", "application-shell", "ApplicationFooter.tsx"),
  "utf8",
);
const context = fs.readFileSync(
  path.join(ROOT, "components", "application-shell", "ShellContextHost.tsx"),
  "utf8",
);
assert(header.includes('data-cmp="CMP-SHELL-HEADER"'), "missing shell header CMP");
assert(footer.includes('data-cmp="CMP-SHELL-FOOTER"'), "missing shell footer CMP");
assert(context.includes('data-cmp="CMP-SHELL-CONTEXT"'), "missing shell context CMP");
console.log("PASS shell CMPs composed via FE-1 LAYCMP-SHELL");

// No business ownership in features
const forbidden = /\b(fetch\s*\(|prisma\b|["']\/api\/|useRouter\s*\()/;
for (const file of fs.readdirSync(path.join(ROOT, "components", "features"))) {
  if (!file.endsWith(".tsx")) continue;
  const text = fs.readFileSync(
    path.join(ROOT, "components", "features", file),
    "utf8",
  );
  assert(!forbidden.test(text), `business ownership in features/${file}`);
}
console.log("PASS no business logic in FEATCMP assemblies");

assert(
  FEATCMP_IDS.every((id) =>
    SCREEN_CMP_COMPOSITION.some((row) =>
      (row.featcmpIds as readonly string[]).includes(id),
    ),
  ),
  "FEATCMP not all mapped to screens",
);
assert(
  SCRCMP_IDS.every((id) =>
    SCREEN_CMP_COMPOSITION.some((row) => row.scrcmpId === id),
  ),
  "SCRCMP not all mapped",
);
console.log("PASS PD-4.4 SCRCMP + FEATCMP map complete");

console.log("\nFE-3.1 component composition verification complete");
