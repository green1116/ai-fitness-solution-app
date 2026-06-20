import {
  SAAS_PRODUCT_API_ROUTE_PREFIX,
  SAAS_PRODUCT_API_WORKSPACES_PATH,
  saasProductApiWorkspaceDetailPath,
} from "../shared/portal-constants";
import type {
  PortalCreateWorkspaceInput,
  PortalWorkspace,
  PortalWorkspaceDetailData,
  PortalWorkspaceListData,
} from "../shared/portal-types";
import type { SaasProductApiClient } from "./saas-product-api-client";

function assertWorkspaceApiPath(path: string): void {
  if (!path.startsWith(SAAS_PRODUCT_API_ROUTE_PREFIX)) {
    throw new Error(`Workspace API path must stay under ${SAAS_PRODUCT_API_ROUTE_PREFIX}`);
  }
}

export class WorkspaceApiClient {
  constructor(private readonly client: SaasProductApiClient) {}

  async list(): Promise<PortalWorkspace[]> {
    assertWorkspaceApiPath(SAAS_PRODUCT_API_WORKSPACES_PATH);
    const data = await this.client.get<PortalWorkspaceListData>(SAAS_PRODUCT_API_WORKSPACES_PATH);
    return data.workspaces;
  }

  async getById(workspaceId: string): Promise<PortalWorkspace> {
    const path = saasProductApiWorkspaceDetailPath(workspaceId);
    assertWorkspaceApiPath(path);
    const data = await this.client.get<PortalWorkspaceDetailData>(path);
    return data.workspace;
  }

  async create(input: PortalCreateWorkspaceInput): Promise<PortalWorkspace> {
    assertWorkspaceApiPath(SAAS_PRODUCT_API_WORKSPACES_PATH);
    const data = await this.client.post<PortalWorkspaceDetailData>(SAAS_PRODUCT_API_WORKSPACES_PATH, {
      body: { name: input.name.trim() },
    });
    return data.workspace;
  }

  async updateStatus(workspaceId: string, status: PortalWorkspace["status"]): Promise<PortalWorkspace> {
    const path = saasProductApiWorkspaceDetailPath(workspaceId);
    assertWorkspaceApiPath(path);
    const data = await this.client.patch<PortalWorkspaceDetailData>(path, {
      body: { status },
    });
    return data.workspace;
  }
}

export function createWorkspaceApiClient(client: SaasProductApiClient): WorkspaceApiClient {
  return new WorkspaceApiClient(client);
}
