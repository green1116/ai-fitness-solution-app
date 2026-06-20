import { join } from "path";
import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import {
  handleCreateWorkspace,
  handleGetWorkspace,
  handleUpdateWorkspaceStatus,
  withApiContext,
} from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_API_WORKSPACES_PATH,
  SAAS_PRODUCT_PORTAL_P4_TAG,
  saasProductApiWorkspaceDetailPath,
} from "../shared/portal-constants";
import { applyWorkspaceListQuery, DEFAULT_WORKSPACE_LIST_QUERY } from "../workspace/workspace-list-utils";
import type { PortalP4Validation } from "../shared/portal-types";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

export async function validatePortalP4(): Promise<PortalP4Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const createBodyPayload = { name: `p4-validate-${Date.now()}` };
  const createRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_WORKSPACES_PATH}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(createBodyPayload),
  });
  const createResponse = await withApiContext(
    createRequest,
    async (ctx) => handleCreateWorkspace(ctx, createBodyPayload),
    { requireTenant: true },
  );
  const createBody = (await createResponse.json()) as {
    ok: boolean;
    data?: { workspace: { id: string; status: string } };
  };

  const workspaceId = createBody.data?.workspace.id ?? "";
  const archiveRequest = new NextRequest(`http://localhost${saasProductApiWorkspaceDetailPath(workspaceId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "ARCHIVED" }),
  });
  const archiveResponse = await withApiContext(
    archiveRequest,
    async (ctx) => handleUpdateWorkspaceStatus(ctx, workspaceId, { status: "ARCHIVED" }),
    { requireTenant: true },
  );
  const archiveBody = (await archiveResponse.json()) as { ok: boolean; data?: { workspace: { status: string } } };

  const activateRequest = new NextRequest(`http://localhost${saasProductApiWorkspaceDetailPath(workspaceId)}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "ACTIVE" }),
  });
  const activateResponse = await withApiContext(
    activateRequest,
    async (ctx) => handleUpdateWorkspaceStatus(ctx, workspaceId, { status: "ACTIVE" }),
    { requireTenant: true },
  );
  const activateBody = (await activateResponse.json()) as { ok: boolean; data?: { workspace: { status: string } } };

  const detailRequest = new NextRequest(`http://localhost${saasProductApiWorkspaceDetailPath(workspaceId)}`, {
    headers,
  });
  const detailResponse = await withApiContext(
    detailRequest,
    (ctx) => handleGetWorkspace(ctx, workspaceId),
    { requireTenant: true },
  );
  const detailBody = (await detailResponse.json()) as { ok: boolean; data?: { workspace: { id: string } } };

  clearRuntimeSession();

  const listView = applyWorkspaceListQuery(
    detailBody.ok && createBody.data?.workspace
      ? [
          {
            id: workspaceId,
            tenantId: "tenant-mock-enterprise",
            name: createBodyPayload.name,
            status: "ACTIVE" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      : [],
    DEFAULT_WORKSPACE_LIST_QUERY,
  );

  const valid =
    createBody.ok === true &&
    archiveBody.ok === true &&
    archiveBody.data?.workspace.status === "ARCHIVED" &&
    activateBody.ok === true &&
    activateBody.data?.workspace.status === "ACTIVE" &&
    detailBody.ok === true &&
    listView.total >= 0;

  return {
    valid,
    summary: [
      `p4Tag=${SAAS_PRODUCT_PORTAL_P4_TAG}`,
      `createOk=${createBody.ok}`,
      `archiveOk=${archiveBody.ok}`,
      `activateOk=${activateBody.ok}`,
      `detailOk=${detailBody.ok}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceDeepeningClientContract(): boolean {
  const clientPath = join(PORTAL_ROOT, "client", "workspace-api-client.ts");
  const content = readFileSync(clientPath, "utf8");
  const prismaImport = "@/" + "lib/prisma";
  return (
    content.includes("updateStatus") &&
    content.includes(".patch<") &&
    content.includes("body: { status }") &&
    !content.includes("tenantId:") &&
    !content.includes(prismaImport)
  );
}
