/**
 * V48 Production SaaS Foundation — Phase 8 verification
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import * as commercial from "../lib/saas-platform/commercial";
import * as foundation from "../lib/saas-platform/foundation";
import * as lifecycle from "../lib/saas-platform/lifecycle";
import { SAAS_PLATFORM_META } from "../lib/saas-platform/index";
import * as portal from "../lib/saas-platform/portal";
import * as rbac from "../lib/saas-platform/rbac";
import * as runtime from "../lib/saas-platform/runtime";
import * as subscription from "../lib/saas-platform/subscription";

const ROOT = process.cwd();

const PHASE_DIRS = [
  "lib/saas-foundation",
  "lib/saas-runtime",
  "lib/saas-lifecycle",
  "lib/saas-commercial-adapter",
  "lib/saas-rbac",
  "lib/saas-subscription",
  "lib/saas-portal",
] as const;

const PLATFORM_MODULES = [
  "foundation.ts",
  "runtime.ts",
  "lifecycle.ts",
  "commercial.ts",
  "rbac.ts",
  "subscription.ts",
  "portal.ts",
  "index.ts",
] as const;

const VERIFY_SCRIPTS = [
  "verify:saas-foundation-p1",
  "verify:saas-runtime-p2",
  "verify:saas-lifecycle-p3",
  "verify:saas-commercial-adapter-p4",
  "verify:saas-rbac-p5",
  "verify:saas-subscription-p6",
  "verify:saas-portal-p7",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function layerA(): void {
  for (const dir of PHASE_DIRS) {
    assert(existsSync(join(ROOT, dir)), `phase directory exists: ${dir}`);
  }
  console.log("✓ P1~P7 phase directories ok");
}

function layerB(): void {
  assert(typeof foundation.SAAS_PLANS !== "undefined", "foundation plan catalog");
  assert(typeof foundation.SAAS_SYSTEM_ROLES !== "undefined", "foundation role catalog");
  assert(typeof foundation.isValidPlanCode === "function", "foundation validation");
  assert(typeof runtime.resolveTenantContext === "function", "runtime resolveTenantContext");
  assert(typeof runtime.requireSession === "function", "runtime requireSession");
  assert(typeof runtime.resolvePermissions === "function", "runtime resolvePermissions");
  assert(typeof lifecycle.bootstrapTenant === "function", "lifecycle bootstrapTenant");
  assert(typeof lifecycle.createTenant === "function", "lifecycle createTenant");
  assert(typeof lifecycle.createOrganization === "function", "lifecycle createOrganization");
  assert(typeof lifecycle.createWorkspace === "function", "lifecycle createWorkspace");
  assert(typeof lifecycle.createOwnerMembership === "function", "lifecycle createOwnerMembership");
  assert(typeof lifecycle.bootstrapTrialSubscription === "function", "lifecycle bootstrapTrialSubscription");
  assert(typeof commercial.hydrateQuote === "function", "commercial hydrateQuote");
  assert(typeof commercial.executeCommercialQuote === "function", "commercial executeCommercialQuote");
  assert(typeof commercial.mapTenantToV47Context === "function", "commercial mapTenantToV47Context");
  assert(typeof rbac.requirePermission === "function", "rbac requirePermission");
  assert(typeof rbac.requireAnyPermission === "function", "rbac requireAnyPermission");
  assert(typeof rbac.requireRole === "function", "rbac requireRole");
  assert(typeof rbac.resolvePermissions === "function", "rbac resolvePermissions");
  assert(typeof subscription.resolveEntitlements === "function", "subscription resolveEntitlements");
  assert(typeof subscription.requireFeature === "function", "subscription requireFeature");
  assert(typeof subscription.requireQuota === "function", "subscription requireQuota");
  assert(typeof subscription.consumeQuota === "function", "subscription consumeQuota");
  assert(typeof portal.resolvePortal === "function", "portal resolvePortal");
  assert(typeof portal.buildNavigation === "function", "portal buildNavigation");
  assert(typeof portal.guardPortalAccess === "function", "portal guardPortalAccess");
  assert(typeof portal.resolvePortalContext === "function", "portal resolvePortalContext");
  assert(SAAS_PLATFORM_META.phases.length === 7, "platform meta phases");
  console.log("✓ unified platform exports ok");
}

function layerC(): void {
  const platformDir = join(ROOT, "lib", "saas-platform");
  for (const file of PLATFORM_MODULES) {
    const source = readFileSync(join(platformDir, file), "utf8");
    assert(!source.includes('from "./index"'), `${file} must not import platform index`);
    assert(!source.includes('from "../index"'), `${file} must not import platform index`);
  }

  const platformFiles = readdirSync(platformDir).filter((name) => name.endsWith(".ts"));
  assert(platformFiles.length === PLATFORM_MODULES.length, "platform module count");

  for (const file of PLATFORM_MODULES) {
    if (file === "index.ts") continue;
    const source = readFileSync(join(platformDir, file), "utf8");
    const imports = [...source.matchAll(/from "@\/lib\/saas-[^"]+"/g)].map((match) => match[0]);
    assert(imports.length >= 1, `${file} imports phase module`);
    for (const imp of imports) {
      assert(!imp.includes("saas-platform"), `${file} must not import saas-platform`);
    }
  }

  console.log("✓ saas-platform dependency graph ok");
}

function layerD(): void {
  const unstaged = execSync("git diff --name-only -- lib/commercial-products", {
    encoding: "utf8",
    cwd: ROOT,
  }).trim();
  const staged = execSync("git diff --cached --name-only -- lib/commercial-products", {
    encoding: "utf8",
    cwd: ROOT,
  }).trim();
  const changed = [...new Set([...unstaged.split("\n"), ...staged.split("\n")].filter(Boolean))];
  assert(changed.length === 0, `V47 commercial-products must be unchanged: ${changed.join(", ")}`);
  console.log("✓ V47 commercial-products unchanged");
}

function layerE(): void {
  for (const script of VERIFY_SCRIPTS) {
    execSync(`npm run ${script}`, { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
  }
  console.log("✓ P1~P7 verify scripts ok");
}

async function main() {
  layerA();
  layerB();
  layerC();
  layerD();
  layerE();

  console.log(`tag=${SAAS_PLATFORM_META.tag}`);
  console.log("PRODUCTION SAAS FOUNDATION PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
