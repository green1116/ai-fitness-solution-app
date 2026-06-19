import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { requireRole } from "@/lib/saas-rbac/guards/require-role";
import { SaasRbacError } from "@/lib/saas-rbac/shared/rbac-errors";
import { resolveEntitlementsSync } from "@/lib/saas-subscription/entitlement/entitlement-resolver";
import { buildNavigation } from "../navigation/navigation-builder";
import { resolvePortal } from "../registry/portal-registry";
import { PORTAL_ERROR_CODES, SaasPortalError } from "../shared/portal-errors";
import type { PortalContext, PortalType } from "../shared/portal-types";

const TRIAL_ALLOWED_PORTAL: PortalType = "enterprise";

function assertPortalTypeMatch(ctx: TenantContext, portalType: PortalType): void {
  if (ctx.portalType !== portalType) {
    throw new SaasPortalError(
      PORTAL_ERROR_CODES.PORTAL_ACCESS_DENIED,
      `Portal access denied: ctx.portalType=${ctx.portalType} target=${portalType}`,
    );
  }
}

function assertPortalEnabledBySubscription(ctx: TenantContext, portalType: PortalType): void {
  const entitlements = resolveEntitlementsSync(ctx.tenantId);
  if (entitlements.planCode === "trial" && portalType !== TRIAL_ALLOWED_PORTAL) {
    throw new SaasPortalError(
      PORTAL_ERROR_CODES.PORTAL_ACCESS_DENIED,
      `Trial plan limited to ${TRIAL_ALLOWED_PORTAL} portal`,
    );
  }
}

function assertPortalRole(ctx: TenantContext, portalType: PortalType): void {
  const portal = resolvePortal(portalType);
  try {
    requireRole(ctx, portal.roles);
  } catch (error) {
    if (error instanceof SaasRbacError) {
      throw new SaasPortalError(
        PORTAL_ERROR_CODES.PORTAL_ACCESS_DENIED,
        error.message,
      );
    }
    throw error;
  }
}

export function guardPortalAccess(ctx: TenantContext, portalType: PortalType): PortalContext {
  resolvePortal(portalType);
  assertPortalTypeMatch(ctx, portalType);
  assertPortalEnabledBySubscription(ctx, portalType);
  assertPortalRole(ctx, portalType);

  const portal = resolvePortal(portalType);
  const navigation = buildNavigation(ctx);
  return { portalType, portal, navigation };
}

export function resolvePortalContext(ctx: TenantContext): PortalContext {
  return guardPortalAccess(ctx, ctx.portalType as PortalType);
}
