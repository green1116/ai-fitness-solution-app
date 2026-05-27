/** RC1 compat entry — @/lib/commercialization/portal */
export { runCommercialPortalFoundation } from "./_rc1-foundation-compat";

import { runCommercialPortalFoundation } from "./_rc1-foundation-compat";

type CommercialPortalFoundationResult = ReturnType<
  typeof runCommercialPortalFoundation
>;

function portalReadyHook(
  prefix: string,
  result: CommercialPortalFoundationResult,
): string {
  const versionToken = result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-portal-1";
  return result.portalReady
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatAccountSurfaceReadyHook(
  result: CommercialPortalFoundationResult,
): string {
  return portalReadyHook("account-surface-ready", result);
}

export function formatBillingSurfaceReadyHook(
  result: CommercialPortalFoundationResult,
): string {
  return portalReadyHook("billing-surface-ready", result);
}

export function formatCustomerPortalReadyHook(
  result: CommercialPortalFoundationResult,
): string {
  return portalReadyHook("customer-portal-ready", result);
}

export function formatInvoiceSurfaceReadyHook(
  result: CommercialPortalFoundationResult,
): string {
  return portalReadyHook("invoice-surface-ready", result);
}

export function formatPortalSurfaceReadyHook(
  result: CommercialPortalFoundationResult,
): string {
  return portalReadyHook("portal-surface-ready", result);
}
