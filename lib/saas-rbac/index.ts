export * from "./shared/rbac-types";
export * from "./shared/rbac-errors";
export {
  resolvePermissions,
  checkPermission,
  hasPermission,
  assertValidRbacContext,
} from "./permission/permission-resolver";
export {
  getPermissionsForRole,
  clearPermissionCache,
  getPermissionCacheSize,
} from "./permission/permission-cache";
export { requirePermission } from "./guards/require-permission";
export { requireAnyPermission } from "./guards/require-any-permission";
export { requireRole } from "./guards/require-role";
export { withPermission } from "./middleware/permission-middleware";
export { recordAccessAudit, listAccessAuditRecords, clearAccessAuditRecords } from "./audit/access-audit";
export {
  validateSaasRbacP5,
  buildOwnerContext,
  buildSupplierRepContext,
  ownerHasRequiredPermissions,
  supplierRepDeniedPermissions,
} from "./validation/validate-saas-rbac-p5";
