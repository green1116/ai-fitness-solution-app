import { WORKSPACE_VERSION } from "./workspace-types";
import type {
  CustomerWorkspace,
  WorkspaceRegisterProjectInput,
  WorkspaceRuntimeRequest,
} from "./workspace-types";
import { buildDownloadCenterLinks, listWorkspaceProjects, registerWorkspaceProject } from "./workspace-projects";
import { appendWorkspaceHistory, listWorkspaceHistory } from "./workspace-history";

const workspaceMeta = new Map<
  string,
  { workspaceId: string; customerName?: string; createdAt: number; updatedAt: number }
>();

function resolveCustomerId(request: WorkspaceRuntimeRequest): string {
  return request.customerId?.trim() || "default-customer";
}

export function buildCustomerWorkspace(request: WorkspaceRuntimeRequest): CustomerWorkspace {
  const customerId = resolveCustomerId(request);
  const now = Date.now();
  const meta = workspaceMeta.get(customerId);

  const workspace: CustomerWorkspace = {
    workspaceId: meta?.workspaceId ?? `ws-${customerId}`,
    customerId,
    customerName: request.customerName ?? meta?.customerName ?? "Commercial Customer",
    projects: listWorkspaceProjects(customerId),
    history: listWorkspaceHistory(customerId),
    createdAt: meta?.createdAt ?? now,
    updatedAt: now,
  };

  workspaceMeta.set(customerId, {
    workspaceId: workspace.workspaceId,
    customerName: workspace.customerName,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  });

  return workspace;
}

export function syncWorkspaceFromQuote(input: WorkspaceRegisterProjectInput): CustomerWorkspace {
  registerWorkspaceProject(input);
  appendWorkspaceHistory({
    customerId: input.customerId,
    action: "quote",
    quoteId: input.quoteId,
    projectName: input.projectName,
    summary: `quote registered sku=${input.sku} price=${input.suggestedPriceCny}`,
  });
  appendWorkspaceHistory({
    customerId: input.customerId,
    action: "delivery-plan",
    quoteId: input.quoteId,
    projectName: input.projectName,
    summary: `delivery plan ready quoteId=${input.quoteId}`,
  });

  return buildCustomerWorkspace({
    customerId: input.customerId,
    customerName: input.customerName,
  });
}

export function getWorkspaceDownloadCenter(request: WorkspaceRuntimeRequest) {
  const workspace = buildCustomerWorkspace(request);
  return buildDownloadCenterLinks(workspace.projects);
}

export function getWorkspaceRuntimeMeta() {
  return {
    runtimeId: "cp-workspace-runtime-v47-p2-s7",
    version: WORKSPACE_VERSION,
    mode: "commercial-products-workspace" as const,
  };
}
