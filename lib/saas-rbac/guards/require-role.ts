import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { RBAC_ERROR_CODES, SaasRbacError } from "../shared/rbac-errors";

export function requireRole(ctx: TenantContext, allowedRoles: string[]): void {
  if (!ctx.roleSystemCode) {
    throw new SaasRbacError(RBAC_ERROR_CODES.RBAC_ROLE_DENIED, "Role denied: missing roleSystemCode");
  }

  if (!allowedRoles.includes(ctx.roleSystemCode)) {
    throw new SaasRbacError(
      RBAC_ERROR_CODES.RBAC_ROLE_DENIED,
      `Role denied: ${ctx.roleSystemCode} not in [${allowedRoles.join(", ")}]`,
    );
  }
}
