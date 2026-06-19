/**
 * V52 Portal UI — P2 Session & Tenant Wiring verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { validatePortalSession, assertPortalSessionResolverContract } from "../lib/saas-product-portal/validation/validate-session";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import {
  SAAS_PRODUCT_API_ME_PATH,
  SAAS_PRODUCT_PORTAL_P2_TAG,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_META } from "../lib/saas-product-portal/index-meta";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function walkTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function auditSessionNoTenantParam(): boolean {
  const files = [...walkTsFiles(PORTAL_ROOT), ...walkTsFiles(APP_PORTAL_ROOT)];
  const forbidden = [
    /searchParams\.get\(\s*["']tenantId["']\s*\)/,
    /body\s*\?\.\s*tenantId/,
    /tenantId\s*:\s*.*searchParams/,
  ];
  return !files.some((file) => forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

function auditCookieResolution(): boolean {
  return assertPortalSessionResolverContract();
}

function auditMeEndpointUsage(): boolean {
  const hookPath = join(PORTAL_ROOT, "session", "use-portal-session.ts");
  const actionPath = join(PORTAL_ROOT, "session", "fetch-portal-session-action.ts");
  const resolvePath = join(PORTAL_ROOT, "session", "resolve-portal-session.ts");
  const hook = readFileSync(hookPath, "utf8");
  const action = readFileSync(actionPath, "utf8");
  const resolve = readFileSync(resolvePath, "utf8");
  return (
    hook.includes("fetchPortalSessionViaMeAction") &&
    action.includes("fetchPortalSessionViaMe") &&
    (resolve.includes(SAAS_PRODUCT_API_ME_PATH) || resolve.includes("SAAS_PRODUCT_API_ME_PATH"))
  );
}

function auditNoDirectTenantAccess(): boolean {
  const layoutPath = join(APP_PORTAL_ROOT, "layout.tsx");
  const layout = readFileSync(layoutPath, "utf8");
  return layout.includes("requirePortalSession") && !layout.includes("tenantId");
}

async function main() {
  const sessionValidation = await validatePortalSession();
  assert(sessionValidation.valid, `Portal session validation: ${sessionValidation.summary}`);
  console.log("✓ portal session validation ok");

  assert(auditSessionNoTenantParam(), "SESSION_NO_TENANT_PARAM");
  console.log("✓ SESSION_NO_TENANT_PARAM");

  assert(auditCookieResolution(), "COOKIE_RESOLUTION");
  console.log("✓ COOKIE_RESOLUTION");

  assert(auditMeEndpointUsage(), "ME_ENDPOINT_USAGE");
  console.log("✓ ME_ENDPOINT_USAGE");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(audit.PORTAL_NO_V49_V50, "NO_V49_V50");
  console.log("✓ NO_V49_V50");

  assert(existsSync(join(PORTAL_ROOT, "session", "require-portal-session.ts")), "require-portal-session.ts");
  assert(existsSync(join(PORTAL_ROOT, "validation", "validate-session.ts")), "validate-session.ts");
  console.log("✓ P2 session files ok");

  assert(SAAS_PRODUCT_PORTAL_META.tag === SAAS_PRODUCT_PORTAL_P2_TAG, "portal meta tag");
  assert(SAAS_PRODUCT_PORTAL_META.phase === "v52-portal-ui-p2", "portal meta phase");
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P2_TAG}`);
  console.log("V52 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
