/**
 * FE-5.3 — Frontend Readiness.
 * Gate: FE-1…FE-5.2 presentation stacks are verification-ready.
 * Reuses FE-5.2 regression; no redesign; no Domain/API/Persistence ownership.
 */
import fs from "node:fs";
import path from "node:path";

import {
  ADAPTER_BINDINGS,
} from "@/lib/frontend/adapter-bindings";
import { PRODUCT_CMP_COUNT } from "@/lib/frontend/component-composition";
import {
  assertFrontendRegression,
  FE_REGRESSION_BASELINE,
  runFrontendRegression,
  type Fe52RegressionReport,
} from "@/lib/frontend/frontend-regression";
import { INTERACTION_COUNT } from "@/lib/frontend/interaction-wiring";
import { PRESENTATION_GUARD_IDS } from "@/lib/frontend/presentation-guards";
import { PRESENTATION_ROUTES } from "@/lib/frontend/presentation-routes";
import { SCREEN_LAYOUT_BINDINGS } from "@/lib/frontend/layout-patterns";
import { STATE_CLASS_IDS } from "@/lib/frontend/state-taxonomy";

export const FRONTEND_READINESS_ID = "product-frontend-readiness-v1" as const;
export const FRONTEND_READINESS_GATE = "product-frontend-readiness-gate" as const;

export type Fe53ReadinessCheck = Readonly<{
  id: string;
  source: "FE-1" | "FE-2" | "FE-3" | "FE-4" | "FE-5.1" | "FE-5.2" | "FE-5.3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type Fe53ReadinessReport = Readonly<{
  layer: "FE-5.3";
  readinessId: typeof FRONTEND_READINESS_ID;
  gateId: typeof FRONTEND_READINESS_GATE;
  ready: boolean;
  passed: boolean;
  checks: readonly Fe53ReadinessCheck[];
  regression: Fe52RegressionReport;
  summary: Readonly<{
    packages: number;
    regressionChecks: number;
    readinessChecks: number;
    routes: number;
    screens: number;
    cmpCatalogue: number;
    intCatalogue: number;
    stateClasses: number;
    adapterBindings: number;
  }>;
}>;

const READINESS_PACKAGES = [
  "FE-1",
  "FE-2",
  "FE-3",
  "FE-4",
  "FE-5.1",
  "FE-5.2",
] as const;

const READINESS_EVIDENCE_SCRIPTS = [
  "scripts/verify-fe-2.ts",
  "scripts/verify-fe-3.3-component-verification.ts",
  "scripts/verify-fe-4.ts",
  "scripts/verify-fe-5.1.ts",
  "scripts/verify-fe-5.2.ts",
  "scripts/verify-fe.ts",
] as const;

const READINESS_MODULES = [
  "lib/frontend/frontend-verification.ts",
  "lib/frontend/frontend-regression.ts",
  "lib/frontend/frontend-readiness.ts",
  "lib/frontend/fe4-verification.ts",
  "lib/frontend/component-verification.ts",
] as const;

function check(
  id: string,
  source: Fe53ReadinessCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): Fe53ReadinessCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir ? path.resolve(rootDir) : path.resolve(__dirname, "../..");
}

function packageReady(
  regression: Fe52RegressionReport,
  pkg: (typeof READINESS_PACKAGES)[number],
): { ok: boolean; evidence: string } {
  if (pkg === "FE-5.2") {
    return {
      ok: regression.passed,
      evidence: `regressionChecks=${regression.checks.length} passed=${regression.passed}`,
    };
  }
  const row = regression.checks.find((c) => c.id === `REG-${pkg}`);
  if (!row) {
    return { ok: false, evidence: `missing REG-${pkg}` };
  }
  return {
    ok: row.status === "PASS",
    evidence: row.evidence,
  };
}

export function runFrontendReadiness(
  rootDir?: string,
): Fe53ReadinessReport {
  const root = resolveRoot(rootDir);
  const regression = runFrontendRegression(root);
  const checks: Fe53ReadinessCheck[] = [];

  for (const pkg of READINESS_PACKAGES) {
    const result = packageReady(regression, pkg);
    checks.push(
      check(
        `READY-${pkg}`,
        pkg,
        `${pkg} ready for frontend freeze path`,
        result.ok,
        result.evidence,
      ),
    );
  }

  checks.push(
    check(
      "READY-BASELINE",
      "FE-5.3",
      "Presentation catalogues match readiness baseline",
      PRESENTATION_ROUTES.length === FE_REGRESSION_BASELINE.routes &&
        SCREEN_LAYOUT_BINDINGS.length === FE_REGRESSION_BASELINE.screens &&
        PRESENTATION_GUARD_IDS.length === FE_REGRESSION_BASELINE.guards &&
        PRODUCT_CMP_COUNT === FE_REGRESSION_BASELINE.cmpCatalogue &&
        INTERACTION_COUNT === FE_REGRESSION_BASELINE.intCatalogue &&
        STATE_CLASS_IDS.length === FE_REGRESSION_BASELINE.stateClasses &&
        ADAPTER_BINDINGS.length === FE_REGRESSION_BASELINE.adapterBindings,
      `routes=${PRESENTATION_ROUTES.length} SCR=${SCREEN_LAYOUT_BINDINGS.length} CMP=${PRODUCT_CMP_COUNT} INT=${INTERACTION_COUNT} ST=${STATE_CLASS_IDS.length} bindings=${ADAPTER_BINDINGS.length}`,
    ),
  );

  checks.push(
    check(
      "READY-REGRESSION",
      "FE-5.3",
      "FE-5.2 regression gate PASS with nested FE-5.1",
      regression.passed &&
        regression.baseline.passed &&
        regression.baseline.children.fe3.passed &&
        regression.baseline.children.fe4.passed,
      `reg=${regression.passed} fe51=${regression.baseline.passed} fe3=${regression.baseline.children.fe3.passed} fe4=${regression.baseline.children.fe4.passed}`,
    ),
  );

  const missingScripts = READINESS_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = READINESS_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "READY-EVIDENCE",
      "FE-5.3",
      "Readiness evidence scripts + verification modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      [
        ...(missingScripts.length ? missingScripts : []),
        ...(missingModules.length ? missingModules : []),
      ].join(",") ||
        `scripts=${READINESS_EVIDENCE_SCRIPTS.length} modules=${READINESS_MODULES.length}`,
    ),
  );

  checks.push(
    check(
      "READY-NO-TAXONOMY",
      "FE-5.3",
      "No new state taxonomy at readiness gate",
      STATE_CLASS_IDS.length === FE_REGRESSION_BASELINE.stateClasses,
      `STATE_CLASS_IDS=${STATE_CLASS_IDS.length}`,
    ),
  );

  const ownershipHits: string[] = [];
  for (const rel of READINESS_MODULES) {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    if (/\bfetch\s*\(/.test(text)) ownershipHits.push(`${rel}:fetch`);
    if (
      /\bfrom\s+["'][^"']*prisma[^"']*["']|\bprisma\.(client|\$)/i.test(text)
    ) {
      ownershipHits.push(`${rel}:prisma`);
    }
    if (
      /from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
        text,
      )
    ) {
      ownershipHits.push(`${rel}:domain-import`);
    }
    if (/\b(evaluatePermission|checkEntitlement|hasRole)\s*\(/.test(text)) {
      ownershipHits.push(`${rel}:biz-engine`);
    }
    if (/^export const STATE_CLASS_IDS\b/m.test(text)) {
      ownershipHits.push(`${rel}:taxonomy-redefine`);
    }
  }
  checks.push(
    check(
      "READY-NO-BIZ",
      "FE-5.3",
      "No Domain/API/Persistence ownership in readiness stack",
      ownershipHits.length === 0,
      ownershipHits.length
        ? ownershipHits.join(",")
        : `scanned=${READINESS_MODULES.length} modules`,
    ),
  );

  checks.push(
    check(
      "READY-GATE",
      "FE-5.3",
      "Frontend readiness gate IDs locked",
      FRONTEND_READINESS_ID === "product-frontend-readiness-v1" &&
        FRONTEND_READINESS_GATE === "product-frontend-readiness-gate",
      `${FRONTEND_READINESS_ID} / ${FRONTEND_READINESS_GATE}`,
    ),
  );

  const passed =
    checks.every((c) => c.status === "PASS") && regression.passed;
  return {
    layer: "FE-5.3",
    readinessId: FRONTEND_READINESS_ID,
    gateId: FRONTEND_READINESS_GATE,
    ready: passed,
    passed,
    checks,
    regression,
    summary: {
      packages: READINESS_PACKAGES.length,
      regressionChecks: regression.checks.length,
      readinessChecks: checks.length,
      routes: PRESENTATION_ROUTES.length,
      screens: SCREEN_LAYOUT_BINDINGS.length,
      cmpCatalogue: PRODUCT_CMP_COUNT,
      intCatalogue: INTERACTION_COUNT,
      stateClasses: STATE_CLASS_IDS.length,
      adapterBindings: ADAPTER_BINDINGS.length,
    },
  };
}

export function assertFrontendReadiness(
  report: Fe53ReadinessReport = runFrontendReadiness(),
): Fe53ReadinessReport {
  if (!report.passed || !report.ready) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `FE-5.3 readiness failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  assertFrontendRegression(report.regression);
  return report;
}
