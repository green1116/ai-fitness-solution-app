import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { recordAccessAudit } from "../audit/access-audit";
import { checkPermission } from "../permission/permission-resolver";
import { RBAC_ERROR_CODES, SaasRbacError } from "../shared/rbac-errors";

export function requirePermission(ctx: TenantContext, permission: string): void {
  const result = checkPermission(ctx, permission);
  recordAccessAudit({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    roleSystemCode: ctx.roleSystemCode,
    permission,
    allowed: result.allowed,
  });

  if (!result.allowed) {
    throw new SaasRbacError(
      RBAC_ERROR_CODES.RBAC_PERMISSION_DENIED,
      result.reason ?? `Permission denied: ${permission}`,
    );
  }
}
