import {
  CP_WORKSPACE_DELIVERABLE_API,
  CP_WORKSPACE_DELIVERY_API,
  CP_WORKSPACE_PACKAGE_API,
  type WorkspaceDownloadLink,
  type WorkspaceProject,
  type WorkspaceRegisterProjectInput,
} from "./workspace-types";

const projectsByCustomer = new Map<string, WorkspaceProject[]>();

function buildDownloadLinks(quoteId: string): WorkspaceDownloadLink[] {
  const encoded = encodeURIComponent(quoteId);
  return [
    {
      label: "Summary PDF",
      type: "summary",
      apiPath: `${CP_WORKSPACE_DELIVERABLE_API}?type=summary&quoteId=${encoded}`,
    },
    {
      label: "Plan PDF",
      type: "plan",
      apiPath: `${CP_WORKSPACE_DELIVERABLE_API}?type=plan&quoteId=${encoded}`,
    },
    {
      label: "Budget PDF",
      type: "budget",
      apiPath: `${CP_WORKSPACE_DELIVERABLE_API}?type=budget&quoteId=${encoded}`,
    },
    {
      label: "Deliverable ZIP",
      type: "zip",
      apiPath: `${CP_WORKSPACE_DELIVERABLE_API}?type=zip&quoteId=${encoded}`,
    },
    {
      label: "Customer Package",
      type: "package",
      apiPath: `${CP_WORKSPACE_PACKAGE_API}?quoteId=${encoded}`,
    },
    {
      label: "Delivery Plan",
      type: "delivery",
      apiPath: `${CP_WORKSPACE_DELIVERY_API}?quoteId=${encoded}&mode=full`,
    },
  ];
}

export function listWorkspaceProjects(customerId: string): WorkspaceProject[] {
  return projectsByCustomer.get(customerId) ?? [];
}

export function registerWorkspaceProject(input: WorkspaceRegisterProjectInput): WorkspaceProject {
  const project: WorkspaceProject = {
    projectId: `ws-project-${input.quoteId}`,
    projectName: input.projectName,
    quoteId: input.quoteId,
    sku: input.sku,
    status: "delivery-ready",
    suggestedPriceCny: input.suggestedPriceCny,
    sla: input.sla,
    createdAt: Date.now(),
    downloadLinks: buildDownloadLinks(input.quoteId),
  };

  const existing = projectsByCustomer.get(input.customerId) ?? [];
  const next = [project, ...existing.filter((item) => item.quoteId !== input.quoteId)];
  projectsByCustomer.set(input.customerId, next);
  return project;
}

export function clearWorkspaceProjects(customerId?: string): void {
  if (customerId) {
    projectsByCustomer.delete(customerId);
    return;
  }
  projectsByCustomer.clear();
}

export function buildDownloadCenterLinks(projects: WorkspaceProject[]): WorkspaceDownloadLink[] {
  const links: WorkspaceDownloadLink[] = [];
  for (const project of projects) {
    links.push(...project.downloadLinks);
  }
  return links;
}
