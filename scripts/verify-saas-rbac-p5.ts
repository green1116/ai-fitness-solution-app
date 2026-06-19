/**
 * V48 SaaS RBAC — Phase 5 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  RBAC_ERROR_CODES,
  SaasRbacError,
  buildOwnerContext,
  buildSupplierRepContext,
  clearAccessAuditRecords,
  getPermissionCacheSize,
  getPermissionsForRole,
  ownerHasRequiredPermissions,
  requireAnyPermission,
  requirePermission,
  requireRole,
  resolvePermissions,
  supplierRepDeniedPermissions,
  validateSaasRbacP5,
  withPermission,
  SAAS_RBAC_P5_TAG,
} from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = validateSaasRbacP5();
  assert(validation.permissionCatalogCount >= 16, "permission catalog");
  assert(validation.roleCatalogCount >= 10, "role catalog");
  assert(validation.valid, `static validation: ${validation.summary}`);
  console.log("✓ role catalog ok");
  console.log("✓ permission catalog ok");
  console.log("✓ permission resolver ok");

  const ownerPermissions = resolvePermissions(buildOwnerContext());
  assert(ownerHasRequiredPermissions(), "enterprise_owner permissions");
  assert(ownerPermissions.includes("quote:create"), "owner quote:create");
  assert(ownerPermissions.includes("delivery:execute"), "owner delivery:execute");
  assert(ownerPermissions.includes("tenant:admin"), "owner tenant:admin");
  console.log("✓ enterprise_owner permissions ok");

  const supplierPermissions = resolvePermissions(buildSupplierRepContext());
  assert(supplierRepDeniedPermissions(), "supplier_rep denied permissions");
  assert(!supplierPermissions.includes("tenant:admin"), "supplier no tenant:admin");
  assert(!supplierPermissions.includes("billing:read"), "supplier no billing:read");
  assert(!supplierPermissions.includes("release:publish"), "supplier no release:publish");
  console.log("✓ supplier_rep restrictions ok");

  clearAccessAuditRecords();
  requirePermission(buildOwnerContext(), "quote:read");
  let denied = false;
  try {
    requirePermission(buildSupplierRepContext(), "tenant:admin");
  } catch (error) {
    denied = error instanceof SaasRbacError && error.code === RBAC_ERROR_CODES.RBAC_PERMISSION_DENIED;
  }
  assert(denied, "requirePermission deny");
  console.log("✓ requirePermission ok");

  requireAnyPermission(buildOwnerContext(), ["quote:create", "tenant:admin"]);
  console.log("✓ requireAnyPermission ok");

  requireRole(buildOwnerContext(), ["enterprise_owner", "enterprise_admin"]);
  let roleDenied = false;
  try {
    requireRole(buildSupplierRepContext(), ["enterprise_owner"]);
  } catch (error) {
    roleDenied = error instanceof SaasRbacError && error.code === RBAC_ERROR_CODES.RBAC_ROLE_DENIED;
  }
  assert(roleDenied, "requireRole deny");
  console.log("✓ requireRole ok");

  const cached = getPermissionsForRole("enterprise_owner");
  assert(getPermissionCacheSize() >= 1, "permission cache");
  assert(cached.includes("quote:create"), "cached permissions");
  console.log("✓ permission cache ok");

  const wrapped = withPermission("quote:read", async (ctx) => ctx.userId);
  const wrappedResult = await wrapped(buildOwnerContext());
  assert(wrappedResult === "rbac-owner-user", "withPermission handler");
  console.log("✓ withPermission ok");

  const executorSource = readFileSync(
    join(process.cwd(), "lib", "saas-commercial-adapter", "bridge", "commercial-executor.ts"),
    "utf8",
  );
  assert(executorSource.includes('requirePermission(ctx, "quote:create")'), "executor quote:create guard");
  assert(executorSource.includes('requirePermission(ctx, "delivery:execute")'), "executor delivery guard");
  assert(executorSource.includes("@/lib/saas-rbac/guards/require-permission"), "executor saas-rbac import");
  console.log("✓ executeCommercialQuote rbac integration ok");

  console.log(`tag=${SAAS_RBAC_P5_TAG}`);
  console.log("SAAS RBAC P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
