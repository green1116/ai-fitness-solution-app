/**
 * FE-5.2 — Frontend Regression Verification.
 * Re-runs FE-5.1 and asserts FE-1…FE-5.1 remain intact — no redesign.
 * Presentation only; owns no Domain / API / Persistence.
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertFrontendVerification,
  runFrontendVerification,
  type Fe5VerificationReport,
} from "@/lib/frontend/frontend-verification";
import { STATE_CLASS_IDS } from "@/lib/frontend/state-taxonomy";
import { PRODUCT_CMP_COUNT } from "@/lib/frontend/component-composition";
import { INTERACTION_COUNT } from "@/lib/frontend/interaction-wiring";
import { ADAPTER_BINDINGS } from "@/lib/frontend/adapter-bindings";
import { SCREEN_LAYOUT_BINDINGS } from "@/lib/frontend/layout-patterns";
import { PRESENTATION_ROUTES } from "@/lib/frontend/presentation-routes";
import { PRESENTATION_GUARD_IDS } from "@/lib/frontend/presentation-guards";

export type Fe52RegressionCheck = Readonly<{
  id: string;
  source: "FE-1" | "FE-2" | "FE-3" | "FE-4" | "FE-5.1" | "FE-5.2";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type Fe52RegressionReport = Readonly<{
  layer: "FE-5.2";
  passed: boolean;
  checks: readonly Fe52RegressionCheck[];
  baseline: Fe5VerificationReport;
  summary: Readonly<{
    packages: number;
    baselineChecks: number;
    regressionChecks: number;
    stateClasses: number;
    cmpCatalogue: number;
    intCatalogue: number;
    adapterBindings: number;
  }>;
}>;

/** Locked presentation baselines — regression must not drift. */
export const FE_REGRESSION_BASELINE = {
  routes: 12,
  screens: 9,
  layouts: 7,
  guards: 5,
  cmpCatalogue: 26,
  intCatalogue: 25,
  stateClasses: 7,
  adapterBindings: 47,
  fe51MinChecks: 13,
  fe3MinChecks: 30,
  fe4MinChecks: 18,
} as const;

const REGRESSION_PACKAGES = [
  "FE-1",
  "FE-2",
  "FE-3",
  "FE-4",
  "FE-5.1",
] as const;

const REGRESSION_EVIDENCE_SCRIPTS = [
  "scripts/verify-fe-2.ts",
  "scripts/verify-fe-3.3-component-verification.ts",
  "scripts/verify-fe-4.ts",
  "scripts/verify-fe-4.5.ts",
  "scripts/verify-fe-5.1.ts",
  "scripts/verify-fe.ts",
] as const;

function check(
  id: string,
  source: Fe52RegressionCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): Fe52RegressionCheck {
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

function packagePassed(
  baseline: Fe5VerificationReport,
  source: "FE-1" | "FE-2" | "FE-3" | "FE-4" | "FE-5.1",
): { ok: boolean; evidence: string } {
  if (source === "FE-3") {
    return {
      ok: baseline.children.fe3.passed,
      evidence: `fe3Checks=${baseline.children.fe3.checks.length} passed=${baseline.children.fe3.passed}`,
    };
  }
  if (source === "FE-4") {
    return {
      ok: baseline.children.fe4.passed,
      evidence: `fe4Checks=${baseline.children.fe4.checks.length} passed=${baseline.children.fe4.passed}`,
    };
  }
  if (source === "FE-5.1") {
    return {
      ok: baseline.passed,
      evidence: `fe51Checks=${baseline.checks.length} passed=${baseline.passed}`,
    };
  }
  const rows = baseline.checks.filter((c) => c.source === source);
  const ok = rows.length > 0 && rows.every((c) => c.status === "PASS");
  return {
    ok,
    evidence: `checks=${rows.length} fail=${rows.filter((c) => c.status === "FAIL").length}`,
  };
}

export function runFrontendRegression(
  rootDir?: string,
): Fe52RegressionReport {
  const root = resolveRoot(rootDir);
  const baseline = runFrontendVerification(root);
  const checks: Fe52RegressionCheck[] = [];

  for (const pkg of REGRESSION_PACKAGES) {
    const result = packagePassed(baseline, pkg);
    checks.push(
      check(
        `REG-${pkg}`,
        pkg,
        `${pkg} intact under regression`,
        result.ok,
        result.evidence,
      ),
    );
  }

  checks.push(
    check(
      "REG-BASELINE-LOCK",
      "FE-5.2",
      "Frozen catalogues unchanged vs FE regression baseline",
      PRESENTATION_ROUTES.length === FE_REGRESSION_BASELINE.routes &&
        SCREEN_LAYOUT_BINDINGS.length === FE_REGRESSION_BASELINE.screens &&
        PRESENTATION_GUARD_IDS.length === FE_REGRESSION_BASELINE.guards &&
        PRODUCT_CMP_COUNT === FE_REGRESSION_BASELINE.cmpCatalogue &&
        INTERACTION_COUNT === FE_REGRESSION_BASELINE.intCatalogue &&
        STATE_CLASS_IDS.length === FE_REGRESSION_BASELINE.stateClasses &&
        ADAPTER_BINDINGS.length === FE_REGRESSION_BASELINE.adapterBindings &&
        baseline.summary.layouts === FE_REGRESSION_BASELINE.layouts,
      `routes=${PRESENTATION_ROUTES.length} SCR=${SCREEN_LAYOUT_BINDINGS.length} CMP=${PRODUCT_CMP_COUNT} INT=${INTERACTION_COUNT} ST=${STATE_CLASS_IDS.length} bindings=${ADAPTER_BINDINGS.length}`,
    ),
  );

  checks.push(
    check(
      "REG-FE51-DEPTH",
      "FE-5.2",
      "FE-5.1 verification depth intact (nested FE-3 / FE-4)",
      baseline.checks.length >= FE_REGRESSION_BASELINE.fe51MinChecks &&
        baseline.summary.fe3Checks >= FE_REGRESSION_BASELINE.fe3MinChecks &&
        baseline.summary.fe4Checks >= FE_REGRESSION_BASELINE.fe4MinChecks &&
        baseline.children.fe3.passed &&
        baseline.children.fe4.passed,
      `fe51=${baseline.checks.length} fe3=${baseline.summary.fe3Checks} fe4=${baseline.summary.fe4Checks}`,
    ),
  );

  const missingScripts = REGRESSION_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "REG-EVIDENCE",
      "FE-5.2",
      "Regression evidence scripts present (FE-2…FE-5.1 + master)",
      missingScripts.length === 0,
      missingScripts.length
        ? missingScripts.join(",")
        : REGRESSION_EVIDENCE_SCRIPTS.join(","),
    ),
  );

  const fe51Module = path.join(root, "lib/frontend/frontend-verification.ts");
  const fe51Text = fs.existsSync(fe51Module)
    ? fs.readFileSync(fe51Module, "utf8")
    : "";
  checks.push(
    check(
      "REG-NO-REDESIGN",
      "FE-5.2",
      "No implementation redesign — FE-5.1 module remains verification-only",
      fe51Text.includes("runFrontendVerification") &&
        fe51Text.includes("runComponentVerification") &&
        fe51Text.includes("runFe4Verification") &&
        !/\bfetch\s*\(/.test(fe51Text) &&
        !/from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
          fe51Text,
        ),
      fe51Text
        ? "frontend-verification.ts reuses FE-3.3/FE-4.5"
        : "missing frontend-verification.ts",
    ),
  );

  checks.push(
    check(
      "REG-NO-TAXONOMY",
      "FE-5.2",
      "No new state taxonomy under regression",
      STATE_CLASS_IDS.length === FE_REGRESSION_BASELINE.stateClasses &&
        !/^export const STATE_CLASS_IDS\b/m.test(fe51Text),
      `STATE_CLASS_IDS=${STATE_CLASS_IDS.length}`,
    ),
  );

  const regressionSelf = path.join(
    root,
    "lib/frontend/frontend-regression.ts",
  );
  const selfText = fs.existsSync(regressionSelf)
    ? fs.readFileSync(regressionSelf, "utf8")
    : "";
  checks.push(
    check(
      "REG-NO-BIZ",
      "FE-5.2",
      "No Domain/API/Persistence ownership in regression layer",
      selfText.length > 0 &&
        !/\bfetch\s*\(/.test(selfText) &&
        !/\bprisma\b/i.test(selfText) &&
        !/from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
          selfText,
        ) &&
        !/\b(evaluatePermission|checkEntitlement|hasRole)\s*\(/.test(selfText),
      selfText ? "frontend-regression.ts presentation-only" : "missing module",
    ),
  );

  // Second pass — regression stability (same FE-5.1 result shape).
  const second = runFrontendVerification(root);
  checks.push(
    check(
      "REG-STABLE",
      "FE-5.2",
      "Repeated FE-5.1 run remains PASS with stable summary",
      second.passed &&
        second.summary.screens === baseline.summary.screens &&
        second.summary.cmpCatalogue === baseline.summary.cmpCatalogue &&
        second.summary.stateClasses === baseline.summary.stateClasses &&
        second.checks.length === baseline.checks.length,
      `first=${baseline.passed} second=${second.passed} checks=${second.checks.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS") && baseline.passed;
  return {
    layer: "FE-5.2",
    passed,
    checks,
    baseline,
    summary: {
      packages: REGRESSION_PACKAGES.length,
      baselineChecks: baseline.checks.length,
      regressionChecks: checks.length,
      stateClasses: STATE_CLASS_IDS.length,
      cmpCatalogue: PRODUCT_CMP_COUNT,
      intCatalogue: INTERACTION_COUNT,
      adapterBindings: ADAPTER_BINDINGS.length,
    },
  };
}

export function assertFrontendRegression(
  report: Fe52RegressionReport = runFrontendRegression(),
): Fe52RegressionReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `FE-5.2 regression failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  assertFrontendVerification(report.baseline);
  return report;
}
