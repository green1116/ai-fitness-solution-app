"use server";

import { createAuthedPortalApiClient } from "../client/create-portal-api-client";
import { createWorkspaceApiClient } from "../client/workspace-api-client";
import type {
  PortalCreateWorkspaceInput,
  PortalUpdateWorkspaceStatusInput,
  PortalWorkspace,
} from "../shared/portal-types";

export async function listWorkspacesAction(): Promise<PortalWorkspace[]> {
  const client = createWorkspaceApiClient(await createAuthedPortalApiClient());
  return client.list();
}

export async function getWorkspaceAction(workspaceId: string): Promise<PortalWorkspace> {
  const client = createWorkspaceApiClient(await createAuthedPortalApiClient());
  return client.getById(workspaceId);
}

export async function createWorkspaceAction(input: PortalCreateWorkspaceInput): Promise<PortalWorkspace> {
  const client = createWorkspaceApiClient(await createAuthedPortalApiClient());
  return client.create(input);
}

export async function updateWorkspaceStatusAction(
  workspaceId: string,
  input: PortalUpdateWorkspaceStatusInput,
): Promise<PortalWorkspace> {
  const client = createWorkspaceApiClient(await createAuthedPortalApiClient());
  return client.updateStatus(workspaceId, input.status);
}
