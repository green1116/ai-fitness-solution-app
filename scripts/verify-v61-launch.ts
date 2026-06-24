/**
 * V61 P11 — Commercial launch verification suite
 */
import fs from "node:fs";
import path from "node:path";

import {
  PORTAL_ROLES,
  PORTAL_PERMISSION_MATRIX,
  canAccessSurface,
  buildDebtClosureReport,
  validateUserJourney,
  validateCommercialWorkflow,
  getLaunchDocumentation,
  evaluateGoNoGo,
} from "../lib/portal/v61";
import { runAllRegressionSuites } from "../lib/portal/v60/regression/journey.regression";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkStructure() {
  const required = [
    "lib/portal/v61/rbac/portal-rbac.ts",
    "lib/portal/v61/rbac/portal-access.guard.ts",
    "lib/portal/v61/debt/debt-closure.ts",
    "lib/portal/v61/launch/go-no-go.engine.ts",
    "lib/portal/v61/launch/launch-checklist.engine.ts",
    "app/api/launch/go-no-go/route.ts",
    "app/(launch)/launch/page.tsx",
    "components/launch/LaunchShell.tsx",
    "docs/production/V61-LAUNCH.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V61 module structure");
}

function checkRbac() {
  assert(PORTAL_ROLES.includes("MANAGER"), "MANAGER role");
  assert(PORTAL_PERMISSION_MATRIX.length >= 10, "permission matrix");
  assert(canAccessSurface("MEMBER", "workspace"), "member workspace");
  assert(!canAccessSurface("MEMBER", "executive"), "member no executive");
  assert(canAccessSurface("ADMIN", "executive"), "admin executive");
  assert(canAccessSurface("OWNER", "launch"), "owner launch");
  assert(!canAccessSurface("MEMBER", "launch"), "member no launch");
  console.log("✓ RBAC_MATRIX");
}

function checkDebtClosure() {
  const report = buildDebtClosureReport();
  const ids = report.closed.map((c) => c.id);
  for (const id of ["td_mock_auth", "td_org_column_env", "td_executive_rbac", "td_manager_role"]) {
    assert(ids.includes(id), `closed: ${id}`);
  }
  assert(report.highMediumEliminated, "targeted debt eliminated");
  console.log("✓ DEBT_CLOSURE");
}

function checkMockAuthGated() {
  const mock = fs.readFileSync(path.join(ROOT, "app/api/auth/mock-login/route.ts"), "utf8");
  assert(mock.includes('NODE_ENV !== "production"'), "mock-login production gated");
  assert(!mock.includes("ENABLE_MOCK_AUTH === \"1\""), "no mock auth in production path");

  const register = fs.readFileSync(path.join(ROOT, "app/api/register/route.ts"), "utf8");
  assert(register.includes("ENABLE_COMMERCIAL_REGISTER"), "commercial register flag");
  console.log("✓ MOCK_AUTH_CLOSURE");
}

function checkExecutiveRbac() {
  const exec = fs.readFileSync(path.join(ROOT, "app/api/intelligence/executive/route.ts"), "utf8");
  assert(exec.includes("withPortalRoute"), "executive uses portal route");
  assert(exec.includes('"executive"'), "executive surface");
  console.log("✓ EXECUTIVE_RBAC");
}

function checkJourneyAndCommercial() {
  const journey = validateUserJourney();
  assert(journey.complete, `journey incomplete: ${journey.steps.filter((s) => s.status === "fail").map((s) => s.step).join(", ")}`);

  const commercial = validateCommercialWorkflow();
  assert(commercial.rbacMatrixPresent, "commercial rbac");
  assert(commercial.score >= 85, "commercial score");
  console.log("✓ JOURNEY_AND_COMMERCIAL");
}

function checkRegression() {
  const suites = runAllRegressionSuites();
  for (const s of suites) {
    assert(s.passed, `regression ${s.name}: ${s.failures.join(", ")}`);
  }
  console.log("✓ V60_REGRESSION_SUITES");
}

function checkLaunchApisReadOnly() {
  const launchDir = path.join(ROOT, "app/api/launch");
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) out.push(...walk(full));
      else if (ent.name === "route.ts") out.push(full);
    }
    return out;
  };
  for (const file of walk(launchDir)) {
    const src = fs.readFileSync(file, "utf8");
    assert(src.includes("export async function GET"), `${file} GET`);
    assert(!src.includes("export async function POST"), `${file} no POST`);
    assert(src.includes("withPortalRoute"), `${file} portal guard`);
  }
  console.log("✓ LAUNCH_API_GUARDS");
}

function checkDocs() {
  assert(getLaunchDocumentation().length >= 6, "launch docs");
  console.log("✓ LAUNCH_DOCUMENTATION");
}

function checkFrozenBoundary() {
  const v60 = fs.readFileSync(path.join(ROOT, "lib/portal/v60/index.ts"), "utf8");
  assert(!v60.includes("v61"), "v60 index untouched");
  console.log("✓ FROZEN_BOUNDARY");
}

async function smokeGoNoGo() {
  const report = await evaluateGoNoGo("__test_org__");
  assert(report.decision === "GO" || report.decision === "NO-GO", "go/no-go decision");
  console.log(`✓ GO_NO_GO_ENGINE decision=${report.decision} score=${report.overallLaunchScore}`);
}

async function main() {
  checkStructure();
  checkRbac();
  checkDebtClosure();
  checkMockAuthGated();
  checkExecutiveRbac();
  checkJourneyAndCommercial();
  checkRegression();
  checkLaunchApisReadOnly();
  checkDocs();
  checkFrozenBoundary();
  await smokeGoNoGo();
  console.log("\n✅ V61 Commercial Launch — verify PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
