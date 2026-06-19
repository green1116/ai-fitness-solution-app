export const SAAS_PORTAL_P7_TAG = "v48-saas-portal-p7" as const;
export const SAAS_PORTAL_VERSION = "v48-saas-portal-p7" as const;

export type PortalType = "enterprise" | "contractor" | "supplier" | "manufacturer";

export interface PortalDefinition {
  portalType: PortalType;
  displayName: string;
  roles: string[];
  navigationKeys: string[];
}

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
}

export interface PortalContext {
  portalType: PortalType;
  portal: PortalDefinition;
  navigation: NavigationItem[];
}
