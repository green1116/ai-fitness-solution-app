/**
 * V57 P2 — Canonical User Journey Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  completeRegistration,
  getPortalUserContext,
  submitOnboarding,
  resolvePostRegisterPath,
  resolvePostOnboardingPath,
  resolvePostQuotePath,
  WORKSPACE_DASHBOARD_PATH,
  saveOnboardingProfile,
  getOnboardingProfile,
} from "../lib/portal/v57";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/portal/v57/index.ts",
    "lib/portal/v57/register.service.ts",
    "lib/portal/v57/auth-context.ts",
    "lib/portal/v57/onboarding.service.ts",
    "lib/portal/v57/onboarding.store.ts",
    "lib/portal/v57/journey.redirect.ts",
    "app/api/register/route.ts",
    "app/api/onboarding/submit/route.ts",
    "app/(auth)/onboarding/page.tsx",
    "app/(auth)/register/page.tsx",
    "app/(product)/quote/page.tsx",
    "app/dashboard/page.tsx",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V57 P2 module structure");
}

function checkJourneyWiring() {
  assert(resolvePostRegisterPath() === "/onboarding", "register → onboarding");
  assert(resolvePostOnboardingPath("proj-1") === "/quote?projectId=proj-1", "onboarding → quote");
  assert(resolvePostQuotePath("q-1") === "/dashboard?quoteId=q-1", "quote → dashboard");
  assert(WORKSPACE_DASHBOARD_PATH === "/dashboard", "workspace path");
  console.log("✓ CANONICAL_JOURNEY_REDIRECTS");

  const registerPage = fs.readFileSync(path.join(ROOT, "app/(auth)/register/page.tsx"), "utf8");
  assert(registerPage.includes("/api/register"), "register uses /api/register");
  assert(!registerPage.includes("/api/auth/mock-login"), "register no longer mock-login only");

  const quotePage = fs.readFileSync(path.join(ROOT, "app/(product)/quote/page.tsx"), "utf8");
  assert(!quotePage.includes("ws-default"), "no ws-default hardcode");
  assert(quotePage.includes("organizationId"), "quote passes organizationId");

  const dashboardPage = fs.readFileSync(path.join(ROOT, "app/(auth)/register/page.tsx"), "utf8");
  void dashboardPage;

  const dash = fs.readFileSync(path.join(ROOT, "app/dashboard/page.tsx"), "utf8");
  assert(dash.includes("/api/auth/me"), "dashboard uses session me API");
  assert(!dash.includes("attaguy_authed"), "no localStorage auth");

  const onboardingPage = fs.readFileSync(path.join(ROOT, "app/(auth)/onboarding/page.tsx"), "utf8");
  assert(onboardingPage.includes("/api/onboarding/submit"), "onboarding submit wired");

  const meRoute = fs.readFileSync(path.join(ROOT, "app/api/auth/me/route.ts"), "utf8");
  assert(meRoute.includes("getPortalUserContext"), "me returns org context");
  assert(meRoute.includes("organizationId"), "me exposes organizationId");

  console.log("✓ PORTAL_WIRING_AUDIT");
}

function checkCapabilities() {
  assert(typeof completeRegistration === "function", "HAS_REGISTER_COMPLETION");
  assert(typeof submitOnboarding === "function", "HAS_ONBOARDING_SUBMIT");
  assert(typeof getPortalUserContext === "function", "HAS_PORTAL_AUTH_CONTEXT");
  console.log("✓ HAS_REGISTER_COMPLETION");
  console.log("✓ HAS_ONBOARDING_SUBMIT");
  console.log("✓ HAS_PORTAL_AUTH_CONTEXT");
}

function runRuntimeTests() {
  saveOnboardingProfile({
    userId: "test-user",
    organizationId: "org-test",
    company: "Test Co",
    updatedAt: new Date().toISOString(),
    projectId: "proj-test",
  });
  const profile = getOnboardingProfile("test-user");
  assert(profile?.projectId === "proj-test", "onboarding profile store");
  console.log("✓ ONBOARDING_PROFILE_STORE");

  const signupRedirect = fs.readFileSync(
    path.join(ROOT, "lib/landing/conversion/signup.redirect.ts"),
    "utf8",
  );
  assert(signupRedirect.includes("resolvePostRegisterPath"), "signup.redirect delegates to portal");
  console.log("✓ NO_JOURNEY_BREAKPOINTS (static audit)");
}

function main() {
  console.log("V57 P2 User Journey Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkJourneyWiring();
  runRuntimeTests();
  console.log("\n✅ V57 P2 Canonical User Journey verified");
  console.log("\nManual E2E steps:");
  console.log("  1. POST /api/register → 200 + session cookie");
  console.log("  2. GET /api/auth/me → authenticated=true + organizationId");
  console.log("  3. POST /api/onboarding/submit → 200 + projectId");
  console.log("  4. POST /api/quote/generate { organizationId, projectId } → 200");
  console.log("  5. Redirect → /dashboard");
}

main();
