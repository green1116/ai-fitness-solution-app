export const DELIVERABLE_ROUTE_TYPE = ["summary", "plan", "budget", "zip"] as const;

export type DeliverableRouteType = (typeof DELIVERABLE_ROUTE_TYPE)[number];

export type DeliverablePdfSource =
  | "summary-pdf"
  | "plan-pdf"
  | "budget-pdf"
  | "zip-package";

export const CP_DELIVERABLE_PDF_API_PATH = "/api/commercial-products/pdf/deliverable" as const;

export const CP_DEFAULT_BRIDGE_PLAN_ID = "attaguy-plan" as const;
