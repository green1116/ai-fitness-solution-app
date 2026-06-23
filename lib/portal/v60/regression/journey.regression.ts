/**
 * V60 P10 — Regression test foundation (static journey coverage)
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());

export type RegressionSuite = {
  name: string;
  passed: boolean;
  checks: string[];
  failures: string[];
};

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

export function runJourneyRegression(): RegressionSuite {
  const checks: string[] = [];
  const failures: string[] = [];

  const journey = [
    "app/(auth)/register/page.tsx",
    "app/(auth)/onboarding/page.tsx",
    "app/dashboard/page.tsx",
    "app/(product)/quote/page.tsx",
    "app/(documents)/documents/page.tsx",
    "app/(intelligence)/intelligence/page.tsx",
    "app/(production)/production/page.tsx",
  ];

  for (const p of journey) {
    if (exists(p)) checks.push(p);
    else failures.push(`missing journey page: ${p}`);
  }

  return { name: "Journey", passed: failures.length === 0, checks, failures };
}

export function runWorkspaceRegression(): RegressionSuite {
  const required = [
    "components/workspace/WorkspaceShell.tsx",
    "app/api/workspace/summary/route.ts",
  ];
  const failures = required.filter((r) => !exists(r));
  return {
    name: "Workspace",
    passed: failures.length === 0,
    checks: required.filter(exists),
    failures: failures.map((f) => `missing: ${f}`),
  };
}

export function runQuoteRegression(): RegressionSuite {
  const failures: string[] = [];
  if (!exists("app/api/quote/generate/route.ts")) failures.push("missing quote generate API");
  const quotePage = exists("app/(product)/quote/page.tsx")
    ? fs.readFileSync(path.join(ROOT, "app/(product)/quote/page.tsx"), "utf8")
    : "";
  if (!quotePage.includes("quote_generated")) failures.push("quote analytics not wired");
  return {
    name: "Quote",
    passed: failures.length === 0,
    checks: ["app/api/quote/generate/route.ts"],
    failures,
  };
}

export function runDocumentRegression(): RegressionSuite {
  const required = [
    "app/api/documents/summary/route.ts",
    "app/api/documents/deliveries/route.ts",
    "lib/portal/v58/documents/documents.aggregator.ts",
  ];
  const failures = required.filter((r) => !exists(r));
  return {
    name: "Document",
    passed: failures.length === 0,
    checks: required.filter(exists),
    failures: failures.map((f) => `missing: ${f}`),
  };
}

export function runDeliveryRegression(): RegressionSuite {
  const required = [
    "lib/portal/v58/delivery/delivery.orchestrator.ts",
    "app/api/documents/deliveries/register/route.ts",
  ];
  const failures = required.filter((r) => !exists(r));
  return {
    name: "Delivery",
    passed: failures.length === 0,
    checks: required.filter(exists),
    failures: failures.map((f) => `missing: ${f}`),
  };
}

export function runIntelligenceRegression(): RegressionSuite {
  const required = [
    "app/api/intelligence/executive/route.ts",
    "lib/portal/v59/scoring/readiness.engine.ts",
  ];
  const failures = required.filter((r) => !exists(r));
  return {
    name: "Intelligence",
    passed: failures.length === 0,
    checks: required.filter(exists),
    failures: failures.map((f) => `missing: ${f}`),
  };
}

export function runAllRegressionSuites(): RegressionSuite[] {
  return [
    runJourneyRegression(),
    runWorkspaceRegression(),
    runQuoteRegression(),
    runDocumentRegression(),
    runDeliveryRegression(),
    runIntelligenceRegression(),
  ];
}
