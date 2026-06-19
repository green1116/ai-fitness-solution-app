import type { PortalDefinition } from "../shared/portal-types";

export const CONTRACTOR_PORTAL: PortalDefinition = {
  portalType: "contractor",
  displayName: "Contractor Portal",
  roles: ["contractor_owner", "contractor_pm", "contractor_estimator"],
  navigationKeys: ["dashboard", "commercial", "delivery", "projects"],
};
