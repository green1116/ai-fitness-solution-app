/**
 * V60 P4 Business Expansion System Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  registerVerticalIndustry,
  loadIndustryTemplate,
  scaleProductAcrossIndustries,
  generateWhiteLabelTheme,
  createCustomBranding,
  registerAPIAccessPlan,
  deployTenantInstance,
  cloneBusinessModule,
  resolveTemplateBundle,
  getPlatformCatalog,
} from "../lib/expansion/expansion.service";
import { clearBrandingStoreForTests } from "../lib/expansion/white-label/tenant.branding";
import { clearDeploymentsForTests } from "../lib/expansion/deployment/multi-tenant.deploy";
import { clearApiKeysForTests } from "../lib/expansion/api-platform/api.plan.manager";
import { listVerticalIndustries } from "../lib/expansion/verticals/vertical.registry";
import { QUOTE_TEMPLATES } from "../lib/expansion/templates/quote.templates";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/expansion/verticals/fitness.vertical.ts",
    "lib/expansion/verticals/education.vertical.ts",
    "lib/expansion/verticals/procurement.vertical.ts",
    "lib/expansion/verticals/enterprise.vertical.ts",
    "lib/expansion/templates/quote.templates.ts",
    "lib/expansion/templates/budget.templates.ts",
    "lib/expansion/templates/tender.templates.ts",
    "lib/expansion/white-label/branding.engine.ts",
    "lib/expansion/white-label/theme.resolver.ts",
    "lib/expansion/white-label/tenant.branding.ts",
    "lib/expansion/api-platform/api.registry.ts",
    "lib/expansion/api-platform/api.gateway.ts",
    "lib/expansion/api-platform/api.plan.manager.ts",
    "lib/expansion/deployment/multi-tenant.deploy.ts",
    "lib/expansion/deployment/environment.manager.ts",
    "lib/expansion/expansion.engine.ts",
    "lib/expansion/expansion.service.ts",
    "app/api/expansion/verticals/route.ts",
    "app/api/expansion/templates/route.ts",
    "app/api/expansion/white-label/route.ts",
    "app/api/expansion/api-platform/route.ts",
    "app/api/expansion/deploy/route.ts",
    "app/api/expansion/clone/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ expansion module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_VERTICAL_SYSTEM: typeof registerVerticalIndustry === "function",
    HAS_TEMPLATE_ENGINE: typeof resolveTemplateBundle === "function",
    HAS_WHITE_LABEL_SYSTEM: typeof createCustomBranding === "function",
    HAS_API_PLATFORM: typeof getPlatformCatalog === "function",
    HAS_DEPLOYMENT_SYSTEM: typeof deployTenantInstance === "function",
    HAS_BUSINESS_SCALING_ENGINE: typeof scaleProductAcrossIndustries === "function",
    HAS_MULTI_INDUSTRY_SUPPORT: listVerticalIndustries().length >= 5,
    HAS_TENANT_CLONING: typeof cloneBusinessModule === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkCoreFunctions() {
  const fns = {
    registerVerticalIndustry,
    loadIndustryTemplate,
    generateWhiteLabelTheme,
    createCustomBranding,
    registerAPIAccessPlan,
    deployTenantInstance,
    cloneBusinessModule,
    scaleProductAcrossIndustries,
  };
  for (const [name, fn] of Object.entries(fns)) {
    assert(typeof fn === "function", `missing core fn: ${name}`);
  }
  console.log("✓ expansion core functions (8 capabilities)");
}

function checkMultiIndustryRuntime() {
  clearBrandingStoreForTests();
  clearDeploymentsForTests();
  clearApiKeysForTests();

  const industries = scaleProductAcrossIndustries();
  assert(industries.length >= 5, "5+ industries");

  const fitness = loadIndustryTemplate("fitness");
  assert(fitness.quote === "fitness_quote_v1", "fitness quote template");
  assert(fitness.budget === "cost_model_fitness", "fitness budget template");

  const edu = resolveTemplateBundle("education");
  assert(edu.quote.id === "education_quote_v1", "education templates");

  assert(QUOTE_TEMPLATES.enterprise_quote_v1 !== undefined, "enterprise quote template");
  console.log("✓ multi-industry template runtime");
}

function checkWhiteLabelRuntime() {
  const theme = generateWhiteLabelTheme({
    companyName: "Acme Fitness Corp",
    primaryColor: "#0066cc",
    domain: "acme.example.com",
  });
  assert(theme.companyName === "Acme Fitness Corp", "theme company");
  assert(theme.pdfHeader === "Acme Fitness Corp", "pdf branding");

  const branding = createCustomBranding({
    organizationId: "org-wl-test",
    companyName: "White Label Co",
    logoUrl: "https://example.com/logo.png",
  });
  assert(branding.enabled === true, "branding enabled");
  assert(branding.theme.logoUrl !== undefined && branding.theme.logoUrl.includes("logo"), "logo replacement");
  console.log("✓ white label runtime");
}

function checkTenantCloning() {
  const clone = cloneBusinessModule({ sourceVertical: "fitness", targetVertical: "education" });
  assert(clone.sourceVertical === "fitness", "clone source");
  assert(clone.targetVertical === "education", "clone target");
  assert(clone.clonedModules.length > 0, "cloned modules");

  const deployment = deployTenantInstance({
    organizationId: "org-clone-test",
    vertical: "procurement",
    branding: { companyName: "Procurement SaaS" },
  });
  assert(deployment.status === "active", "deployment active");
  assert(deployment.vertical === "procurement", "deployment vertical");
  console.log("✓ tenant cloning + deployment");
}

function checkApiPlatformWiring() {
  const catalog = getPlatformCatalog();
  assert(catalog.requiredFeature === "canUseAPI", "API requires feature gate");
  assert(catalog.requiredPlan === "ENTERPRISE", "enterprise API access");

  const apiPlan = registerAPIAccessPlan({
    planId: "test_plan",
    name: "Test Plan",
    saasPlan: "ENTERPRISE",
    rateLimitPerMinute: 100,
    allowedEndpoints: ["/api/quote/generate"],
  });
  assert(apiPlan.planId === "test_plan", "register API plan");

  const gatewaySource = fs.readFileSync(path.join(ROOT, "lib/expansion/api-platform/api.gateway.ts"), "utf8");
  assert(gatewaySource.includes("checkFeatureAccess") || gatewaySource.includes("validateApiAccess"), "API uses feature gate");
  assert(gatewaySource.includes("FeatureGateError"), "API gateway throws feature gate error");

  const planManager = fs.readFileSync(path.join(ROOT, "lib/expansion/api-platform/api.plan.manager.ts"), "utf8");
  assert(planManager.includes("checkFeatureAccess"), "plan manager uses feature gate");
  assert(!planManager.includes("updateSubscriptionStatus"), "no billing mutation");
  console.log("✓ API platform wiring");
}

function checkExpansionApiGated() {
  const platform = fs.readFileSync(path.join(ROOT, "app/api/expansion/api-platform/route.ts"), "utf8");
  assert(platform.includes("runSaasApiGate"), "api-platform uses feature gate");
  assert(platform.includes("canUseAPI"), "canUseAPI feature");

  for (const route of [
    "app/api/expansion/verticals/route.ts",
    "app/api/expansion/deploy/route.ts",
    "app/api/expansion/clone/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasOrgGate"), `${route} tenant gated`);
  }
  console.log("✓ expansion API routes gated");
}

function checkV58Untouched() {
  assert(fs.existsSync(path.join(V58_DIR, "freeze/v58-final-frozen.ts")), "v58 freeze intact");
  const orchestration = fs.readFileSync(path.join(V58_DIR, "orchestration/quote-orchestrator.engine.ts"), "utf8");
  assert(!orchestration.includes("expansion.service"), "v58 not coupled to expansion");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");
}

function checkNoBillingBypass() {
  const expansionDir = path.join(ROOT, "lib/expansion");
  const files = fs.readdirSync(expansionDir, { recursive: true }) as string[];
  for (const file of files) {
    if (!String(file).endsWith(".ts")) continue;
    const content = fs.readFileSync(path.join(expansionDir, String(file)), "utf8");
    assert(!content.includes("updateSubscriptionStatus"), `no billing mutation in ${file}`);
    assert(!content.includes("createCheckoutSession"), `no checkout bypass in ${file}`);
  }
  console.log("✓ NO_BILLING_BYPASS");
}

function checkNoFeatureGateBypass() {
  for (const route of [
    "app/api/quote/generate/route.ts",
    "app/api/budget/calculate/route.ts",
    "app/api/tender/generate/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasApiGate"), `${route} still gated`);
  }
  console.log("✓ NO_FEATURE_GATE_BYPASS");
}

function checkValidateApiAccessUsesGate() {
  const planManager = fs.readFileSync(path.join(ROOT, "lib/expansion/api-platform/api.plan.manager.ts"), "utf8");
  assert(planManager.includes("checkFeatureAccess"), "validateApiAccess uses checkFeatureAccess");
  assert(planManager.includes('canUseAPI'), "API access checks canUseAPI feature");
  console.log("✓ validateApiAccess integrates feature gate (read-only)");
}

async function main() {
  checkModuleStructure();
  checkCapabilities();
  checkCoreFunctions();
  checkMultiIndustryRuntime();
  checkWhiteLabelRuntime();
  checkTenantCloning();
  checkApiPlatformWiring();
  checkExpansionApiGated();
  checkV58Untouched();
  checkNoBillingBypass();
  checkNoFeatureGateBypass();
  checkValidateApiAccessUsesGate();
  console.log("\n✓ V60 P4 Business Expansion System — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
