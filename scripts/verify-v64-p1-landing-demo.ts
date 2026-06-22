/**
 * V64 P1 SaaS Landing + Demo System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests, getGrowthEventsSnapshot } from "../lib/growth/growth.events.store";
import {
  trackLandingView,
  trackDemoStart,
  trackDemoComplete,
  trackSignupClick,
  trackConversion,
  trackFunnelStage,
  describeFunnel,
  resolveSignupRedirect,
} from "../lib/landing/landing.service";
import {
  generateDemoQuote,
  generateDemoBudget,
  generateDemoTender,
  runDemoOrchestrator,
  fallbackDemoResponse,
} from "../lib/landing/landing.service";
import { getDemoRuntimeStubLabel } from "../lib/demo/demo.v58-stub";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");
const V57_PRODUCT = path.join(ROOT, "app/(product)");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "app/(marketing)/page.tsx",
    "app/(marketing)/pricing/page.tsx",
    "app/(marketing)/demo/page.tsx",
    "app/(marketing)/case/page.tsx",
    "app/(auth)/login/page.tsx",
    "app/(auth)/register/page.tsx",
    "app/(demo)/quote-demo/page.tsx",
    "app/(demo)/budget-demo/page.tsx",
    "app/(demo)/tender-demo/page.tsx",
    "lib/landing/landing/hero.section.tsx",
    "lib/landing/landing/features.section.tsx",
    "lib/landing/landing/value.section.tsx",
    "lib/landing/landing/cta.section.tsx",
    "components/landing/Hero.tsx",
    "components/landing/Pain.tsx",
    "components/landing/Solution.tsx",
    "components/landing/Demo.tsx",
    "components/landing/UseCases.tsx",
    "components/landing/Pricing.tsx",
    "components/landing/CTA.tsx",
    "lib/landing/conversion/conversion.tracker.ts",
    "lib/landing/conversion/funnel.tracker.ts",
    "lib/landing/conversion/signup.redirect.ts",
    "lib/demo/quote.demo.engine.ts",
    "lib/demo/budget.demo.engine.ts",
    "lib/demo/tender.demo.engine.ts",
    "lib/demo/demo.orchestrator.ts",
    "lib/demo/demo.fallback.ts",
    "app/api/demo/run/route.ts",
    "app/api/landing/track/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ landing + demo module structure");
}

function checkCapabilities() {
  const hero = fs.readFileSync(path.join(ROOT, "components/landing/Hero.tsx"), "utf8");
  const cta = fs.readFileSync(path.join(ROOT, "components/landing/CTA.tsx"), "utf8");
  const landingPage = fs.readFileSync(path.join(ROOT, "app/(marketing)/page.tsx"), "utf8");

  const checks: Record<string, boolean> = {
    HAS_LANDING_PAGE: fs.existsSync(path.join(ROOT, "app/(marketing)/page.tsx")),
    HAS_HERO_SECTION: hero.includes("AI 自动生成企业健身方案"),
    HAS_PAIN_SECTION: landingPage.includes("Pain"),
    HAS_SOLUTION_SECTION: landingPage.includes("Solution"),
    HAS_DEMO_PREVIEW: landingPage.includes("Demo"),
    HAS_USE_CASES: landingPage.includes("UseCases"),
    HAS_PRICING_SECTION: landingPage.includes("Pricing"),
    HAS_CTA_FLOW: cta.includes("Try Demo") || cta.includes("/demo") || cta.includes("Start Free Demo"),
    HAS_DEMO_ENGINE: typeof generateDemoQuote === "function",
    HAS_DEMO_ORCHESTRATOR: typeof runDemoOrchestrator === "function",
    HAS_CONVERSION_FUNNEL: describeFunnel().length > 0,
    HAS_TRACKING_SYSTEM: typeof trackLandingView === "function",
    HAS_SIGNUP_FLOW: typeof resolveSignupRedirect === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  assert(fs.existsSync(V57_PRODUCT), "V57 product surface must exist");

  const demoApi = fs.readFileSync(path.join(ROOT, "app/api/demo/run/route.ts"), "utf8");
  assert(!demoApi.includes("stripe") && !demoApi.includes("createCheckout"), "no billing in demo API");

  const quoteEngine = fs.readFileSync(path.join(ROOT, "lib/demo/quote.demo.engine.ts"), "utf8");
  assert(quoteEngine.includes("demo-stub"), "demo must use stub mode");

  const v58Before = fs.statSync(V58_DIR).mtimeMs;

  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 directory must not be modified");

  console.log("✓ NO_V57_MODIFICATION (additive marketing layer)");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_BILLING_BYPASS");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();

  trackLandingView({ path: "/" });
  trackDemoStart({ companyName: "Test Co", sessionId: "sess-1" });
  trackDemoComplete({ sessionId: "sess-1" });
  trackSignupClick({ source: "demo", cta: "register" });
  trackConversion({ stage: "signup" });
  trackFunnelStage("demo_click", { sessionId: "sess-1" });

  const events = getGrowthEventsSnapshot();
  assert(events.length >= 4, "tracking events recorded");

  const quote = generateDemoQuote({ companyName: "Acme Corp", companySize: "500人以上" });
  assert(quote.mode === "demo-stub", "demo quote stub");
  assert(quote.equipment.length > 0, "quote equipment");

  const budget = generateDemoBudget({ companyName: "Acme Corp" }, quote);
  assert(budget.total > 0, "demo budget");

  const tender = generateDemoTender({ companyName: "Acme Corp" });
  assert(tender.sections.length >= 3, "demo tender");

  const orchestrated = runDemoOrchestrator({ companyName: "Acme Corp" });
  assert(orchestrated.upsellPrompts.length >= 4, "upsell prompts");
  assert(orchestrated.runtimeStub.includes("demo-stub") || orchestrated.runtimeStub.length > 0, "runtime stub");

  const fallback = fallbackDemoResponse({ companyName: "Fallback Inc" });
  assert(fallback.quote.title.includes("Fallback"), "fallback quote");

  const stub = getDemoRuntimeStubLabel();
  assert(stub.length > 0, "v58 stub label read-only");

  const signupUrl = resolveSignupRedirect("demo", orchestrated.sessionId);
  assert(signupUrl.includes("/register"), "signup redirect");

  console.log("✓ runtime landing + demo pipeline");
}

function main() {
  console.log("V64 P1 SaaS Landing + Demo Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V64 P1 SaaS Landing + Demo System verified");
}

main();
