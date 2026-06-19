import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { recordAccessAudit } from "../audit/access-audit";
import { checkPermission } from "../permission/permission-resolver";
import { RBAC_ERROR_CODES, SaasRbacError } from "../shared/rbac-errors";

export function requireAnyPermission(ctx: TenantContext, permissions: string[]): void {
  if (permissions.length === 0) {
    throw new SaasRbacError(RBAC_ERROR_CODES.RBAC_CONTEXT_INVALID, "requireAnyPermission needs permissions");
  }

  for (const permission of permissions) {
    const result = checkPermission(ctx, permission);
    recordAccessAudit({
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      roleSystemCode: ctx.roleSystemCode,
      permission,
      allowed: result.allowed,
    });
    if (result.allowed) return;
  }

  throw new SaasRbacError(
    RBAC_ERROR_CODES.RBAC_PERMISSION_DENIED,
    `Permission denied: requires any of ${permissions.join(", ")}`,
  );
}
