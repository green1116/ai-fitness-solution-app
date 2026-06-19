export const WORKSPACE_VERSION = "v47-commercial-products-p2-step7" as const;
export const CP_WORKSPACE_API_PATH = "/api/commercial-products/workspace" as const;
export const CP_WORKSPACE_BASE_PATH = "/commercial/v47/workspace" as const;

export const CP_WORKSPACE_QUOTE_API = "/api/commercial-products/quote" as const;
export const CP_WORKSPACE_DELIVERABLE_API = "/api/commercial-products/pdf/deliverable" as const;
export const CP_WORKSPACE_PACKAGE_API = "/api/commercial-products/package" as const;
export const CP_WORKSPACE_DELIVERY_API = "/api/commercial-products/delivery" as const;

export const WORKSPACE_PROJECT_STATUS = ["quoted", "delivery-ready", "delivered"] as const;
export type WorkspaceProjectStatus = (typeof WORKSPACE_PROJECT_STATUS)[number];

export const WORKSPACE_HISTORY_ACTION = [
  "quote",
  "delivery-plan",
  "package-download",
  "deliverable-download",
] as const;
export type WorkspaceHistoryAction = (typeof WORKSPACE_HISTORY_ACTION)[number];

export interface WorkspaceDownloadLink {
  label: string;
  type: "summary" | "plan" | "budget" | "zip" | "package" | "delivery";
  apiPath: string;
}

export interface WorkspaceProject {
  projectId: string;
  projectName: string;
  quoteId: string;
  sku: string;
  status: WorkspaceProjectStatus;
  suggestedPriceCny: number;
  sla: string;
  createdAt: number;
  downloadLinks: WorkspaceDownloadLink[];
}

export interface WorkspaceHistoryItem {
  historyId: string;
  action: WorkspaceHistoryAction;
  quoteId: string;
  projectName: string;
  createdAt: number;
  summary: string;
}

export interface CustomerWorkspace {
  workspaceId: string;
  customerId: string;
  customerName?: string;
  projects: WorkspaceProject[];
  history: WorkspaceHistoryItem[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceRegisterProjectInput {
  customerId: string;
  customerName?: string;
  quoteId: string;
  projectName: string;
  sku: string;
  suggestedPriceCny: number;
  sla: string;
}

export interface WorkspaceRuntimeRequest {
  customerId?: string;
  customerName?: string;
}

export interface WorkspaceRuntimeResult {
  ok: true;
  workspace: CustomerWorkspace;
}

export interface WorkspaceValidation {
  valid: boolean;
  workspaceReady: boolean;
  projectsReady: boolean;
  historyReady: boolean;
  downloadCenterReady: boolean;
  apiPathRegistered: boolean;
  summary: string;
}
