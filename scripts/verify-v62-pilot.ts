/**
 * V62 P12 — Real user pilot verification suite
 */
import fs from "node:fs";
import path from "node:path";

import {
  PILOT_TELEMETRY_EVENTS,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  buildPilotProgramReport,
  buildFeedbackLoopReport,
  buildTelemetryReport,
  buildIssueTriageReport,
  buildPilotHealthDashboard,
  buildFunnelAnalyticsReport,
  buildSupportReadinessReport,
  computePilotSuccessScore,
  buildOperationalImprovementLog,
  evaluateScaleDecision,
  validatePilotJourney,
  getPilotDocumentation,
  recordPilotTelemetry,
  submitPilotFeedback,
  reportPilotIssue,
  ensurePilotEnrollment,
  clearPilotRegistryForTests,
  clearPilotTelemetryForTests,
  clearPilotFeedbackForTests,
  clearPilotIssuesForTests,
  clearOperationalImprovementsForTests,
} from "../lib/portal/v62";
import {
  PORTAL_PERMISSION_MATRIX,
  canAccessSurface,
} from "../lib/portal/v61/rbac/portal-rbac";
import { validateUserJourney } from "../lib/portal/v61/validation/journey-validation.engine";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkStructure() {
  const required = [
    "lib/portal/v62/index.ts",
    "lib/portal/v62/store/pilot-registry.store.ts",
    "lib/portal/v62/store/pilot-telemetry.store.ts",
    "lib/portal/v62/store/pilot-feedback.store.ts",
    "lib/portal/v62/store/pilot-issues.store.ts",
    "lib/portal/v62/pilot/pilot-program.engine.ts",
    "lib/portal/v62/pilot/pilot-health.engine.ts",
    "lib/portal/v62/feedback/feedback-loop.engine.ts",
    "lib/portal/v62/telemetry/pilot-telemetry.engine.ts",
    "lib/portal/v62/issues/issue-triage.engine.ts",
    "lib/portal/v62/funnel/conversion-funnel.engine.ts",
    "lib/portal/v62/support/support-readiness.engine.ts",
    "lib/portal/v62/scale/scale-decision.engine.ts",
    "app/api/pilot/health/route.ts",
    "app/api/pilot/feedback/submit/route.ts",
    "app/api/pilot/telemetry/record/route.ts",
    "app/api/pilot/issues/report/route.ts",
    "app/(pilot)/pilot/page.tsx",
    "components/pilot/PilotShell.tsx",
    "docs/production/V62-PILOT.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V62 module structure");
}

function checkRbac() {
  assert(PORTAL_PERMISSION_MATRIX.some((r) => r.surface === "pilot"), "pilot surface");
  assert(canAccessSurface("OWNER", "pilot"), "owner pilot");
  assert(canAccessSurface("MANAGER", "pilot"), "manager pilot");
  assert(!canAccessSurface("MEMBER", "pilot"), "member no pilot");
  console.log("✓ PILOT_RBAC");
}

function checkSchemas() {
  assert(PILOT_TELEMETRY_EVENTS.length >= 8, "telemetry events");
  assert(FEEDBACK_CATEGORIES.length === 7, "feedback categories");
  assert(FEEDBACK_STATUSES.length === 5, "feedback statuses");
  assert(ISSUE_SEVERITIES.length === 4, "issue severities");
  assert(ISSUE_STATUSES.length === 5, "issue statuses");
  console.log("✓ SCHEMAS");
}

function checkPilotApis() {
  const pilotDir = path.join(ROOT, "app/api/pilot");
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) out.push(...walk(full));
      else if (ent.name === "route.ts") out.push(full);
    }
    return out;
  };
  for (const file of walk(pilotDir)) {
    const src = fs.readFileSync(file, "utf8");
    assert(
      src.includes("withPortalRoute"),
      `${path.relative(ROOT, file)} portal guard`,
    );
  }
  console.log("✓ PILOT_API_GUARDS");
}

function checkFrozenBoundary() {
  const v61 = fs.readFileSync(path.join(ROOT, "lib/portal/v61/index.ts"), "utf8");
  assert(!v61.includes("v62"), "v61 index untouched");
  console.log("✓ FROZEN_BOUNDARY");
}

function seedPilotData() {
  clearPilotRegistryForTests();
  clearPilotTelemetryForTests();
  clearPilotFeedbackForTests();
  clearPilotIssuesForTests();
  clearOperationalImprovementsForTests();

  ensurePilotEnrollment({
    organizationId: "org_pilot_test",
    organizationName: "Pilot Test Org",
    userId: "user_pilot_test",
    userEmail: "pilot@test.example",
  });

  for (const name of [
    "pilot_registered",
    "workspace_entered",
    "project_created",
    "quote_generated",
    "pdf_downloaded",
    "tender_pack_opened",
  ] as const) {
    recordPilotTelemetry({
      name,
      organizationId: "org_pilot_test",
      userId: "user_pilot_test",
      success: true,
    });
  }

  submitPilotFeedback({
    organizationId: "org_pilot_test",
    userId: "user_pilot_test",
    category: "UX",
    message: "Pilot feedback smoke test",
  });

  reportPilotIssue({
    organizationId: "org_pilot_test",
    title: "Smoke test issue",
    description: "Non-blocker validation issue",
    severity: "low",
  });
}

function checkEngines() {
  seedPilotData();

  const program = buildPilotProgramReport("org_pilot_test");
  assert(program.activeOrganizations >= 1, "pilot org");

  const feedback = buildFeedbackLoopReport("org_pilot_test");
  assert(feedback.items.length >= 1, "feedback items");

  const telemetry = buildTelemetryReport("org_pilot_test");
  assert(telemetry.totalEvents >= 6, "telemetry events");

  const issues = buildIssueTriageReport("org_pilot_test");
  assert(issues.issues.length >= 1, "issues");

  const health = buildPilotHealthDashboard("org_pilot_test");
  assert(health.overallHealth >= 0, "health dashboard");

  const funnel = buildFunnelAnalyticsReport("org_pilot_test");
  assert(funnel.stages.length >= 8, "funnel stages");

  const support = buildSupportReadinessReport();
  assert(support.ready, "support readiness");

  const success = computePilotSuccessScore("org_pilot_test");
  assert(success.overallScore >= 0, "success score");

  buildOperationalImprovementLog();

  const scale = evaluateScaleDecision("org_pilot_test");
  assert(
    ["Pilot Stable", "Pilot Needs Fixes", "Ready to Scale"].includes(scale.decision),
    "scale decision",
  );

  console.log(`✓ ENGINES scale=${scale.decision} success=${success.overallScore}`);
}

function checkJourney() {
  const pilot = validatePilotJourney();
  assert(pilot.complete, `pilot journey: ${pilot.steps.filter((s) => s.status === "fail").map((s) => s.step).join(", ")}`);

  const user = validateUserJourney();
  assert(user.complete, "frozen user journey");

  console.log("✓ JOURNEY");
}

function checkDocs() {
  assert(getPilotDocumentation().length >= 5, "pilot docs");
  console.log("✓ DOCUMENTATION");
}

async function main() {
  checkStructure();
  checkRbac();
  checkSchemas();
  checkPilotApis();
  checkFrozenBoundary();
  checkEngines();
  checkJourney();
  checkDocs();
  console.log("\n✅ V62 Real User Pilot — verify PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
