export {
  resolvePermissions,
  checkPermission,
  hasPermission,
} from "@/lib/saas-rbac/permission/permission-resolver";
export { requirePermission } from "@/lib/saas-rbac/guards/require-permission";
export { requireAnyPermission } from "@/lib/saas-rbac/guards/require-any-permission";
export { requireRole } from "@/lib/saas-rbac/guards/require-role";
export { SAAS_RBAC_P5_TAG } from "@/lib/saas-rbac/shared/rbac-types";
