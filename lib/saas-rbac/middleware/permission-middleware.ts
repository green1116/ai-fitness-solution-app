import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { requirePermission } from "../guards/require-permission";

export type PermissionHandler<T> = (ctx: TenantContext) => Promise<T> | T;

export function withPermission<T>(permission: string, handler: PermissionHandler<T>) {
  return async (ctx: TenantContext): Promise<T> => {
    requirePermission(ctx, permission);
    return handler(ctx);
  };
}
