/**
 * V48 SaaS Portal — Phase 7 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  ENTERPRISE_PORTAL,
  PORTAL_ERROR_CODES,
  SAAS_PORTAL_P7_TAG,
  SaasPortalError,
  allPortalsResolvable,
  buildNavigation,
  enterpriseNavigationCount,
  enterpriseOwnerPortalAccess,
  guardPortalAccess,
  listPortals,
  resolvePortal,
  resolvePortalContext,
  supplierRepEnterpriseDenied,
  validateSaasPortalP7,
} from "../lib/saas-portal";
import { buildOwnerContext, buildSupplierRepContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = validateSaasPortalP7();
  assert(validation.portalCount === 4, "four portals registered");
  assert(validation.valid, `portal registry validation: ${validation.summary}`);
  assert(allPortalsResolvable(), "all portals resolvable");
  console.log("✓ portal registry ok");

  for (const portal of listPortals()) {
    const resolved = resolvePortal(portal.portalType);
    assert(resolved.displayName.length > 0, `${portal.portalType} displayName`);
    assert(resolved.roles.length >= 2, `${portal.portalType} roles`);
    assert(resolved.navigationKeys.length >= 4, `${portal.portalType} navigation keys`);
  }
  console.log("✓ four portal definitions ok");

  const ownerCtx = buildOwnerContext();
  const navigation = buildNavigation(ownerCtx);
  assert(navigation.length === ENTERPRISE_PORTAL.navigationKeys.length, "enterprise navigation count");
  assert(navigation.every((item) => item.path.includes("/saas/portal/enterprise/")), "enterprise nav paths");
  console.log("✓ navigation builder ok");

  assert(enterpriseOwnerPortalAccess(), "enterprise_owner enterprise portal access");
  const portalContext = resolvePortalContext(ownerCtx);
  assert(portalContext.portal.portalType === "enterprise", "resolvePortalContext portal");
  assert(portalContext.navigation.length === ENTERPRISE_PORTAL.navigationKeys.length, "resolvePortalContext navigation");
  console.log("✓ enterprise_owner portal access ok");

  assert(supplierRepEnterpriseDenied(), "supplier_rep enterprise portal denied");
  const supplierCtx = buildSupplierRepContext();
  let deniedCode: string | undefined;
  try {
    guardPortalAccess(supplierCtx, "enterprise");
  } catch (error) {
    if (error instanceof SaasPortalError) deniedCode = error.code;
  }
  assert(deniedCode === PORTAL_ERROR_CODES.PORTAL_ACCESS_DENIED, "PORTAL_ACCESS_DENIED code");
  console.log("✓ supplier_rep enterprise denial ok");

  assert(enterpriseNavigationCount() === ENTERPRISE_PORTAL.navigationKeys.length, "layer D navigation count");
  console.log("✓ navigation menu count ok");

  const guardSource = readFileSync(
    join(process.cwd(), "lib", "saas-portal", "guards", "portal-guard.ts"),
    "utf8",
  );
  assert(guardSource.includes("requireRole"), "portal guard rbac integration");
  assert(guardSource.includes("resolveEntitlementsSync"), "portal guard subscription integration");
  console.log("✓ portal guard runtime integration ok");

  console.log(`tag=${SAAS_PORTAL_P7_TAG}`);
  console.log("SAAS PORTAL P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
