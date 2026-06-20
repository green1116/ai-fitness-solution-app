import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import {
  handleCreateWorkspace,
  handleGetWorkspace,
  handleListWorkspaces,
  withApiContext,
} from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_API_WORKSPACES_PATH,
  SAAS_PRODUCT_PORTAL_P3_TAG,
} from "../shared/portal-constants";
import type { PortalP3Validation } from "../shared/portal-types";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

export async function validatePortalP3(): Promise<PortalP3Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const listRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_WORKSPACES_PATH}`, { headers });
  const listResponse = await withApiContext(listRequest, (ctx) => handleListWorkspaces(ctx), {
    requireTenant: true,
  });
  const listBody = (await listResponse.json()) as { ok: boolean; data?: { workspaces: unknown[] } };

  const createBodyPayload = { name: `p3-validate-${Date.now()}` };
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
    data?: { workspace: { id: string; tenantId: string; name: string } };
  };

  const workspaceId = createBody.data?.workspace.id ?? "";
  const detailRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_WORKSPACES_PATH}/${workspaceId}`, {
    headers,
  });
  const detailResponse = await withApiContext(
    detailRequest,
    (ctx) => handleGetWorkspace(ctx, workspaceId),
    { requireTenant: true },
  );
  const detailBody = (await detailResponse.json()) as { ok: boolean; data?: { workspace: { id: string } } };

  clearRuntimeSession();

  const valid =
    listBody.ok === true &&
    Array.isArray(listBody.data?.workspaces) &&
    createBody.ok === true &&
    Boolean(createBody.data?.workspace.id) &&
    createBody.data?.workspace.tenantId === "tenant-mock-enterprise" &&
    detailBody.ok === true &&
    detailBody.data?.workspace.id === workspaceId;

  return {
    valid,
    summary: [
      `p3Tag=${SAAS_PRODUCT_PORTAL_P3_TAG}`,
      `listOk=${listBody.ok}`,
      `createOk=${createBody.ok}`,
      `detailOk=${detailBody.ok}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceApiClientContract(): boolean {
  const clientPath = join(PORTAL_ROOT, "client", "workspace-api-client.ts");
  const content = readFileSync(clientPath, "utf8");
  const prismaImport = "@/" + "lib/prisma";
  return (
    content.includes("SAAS_PRODUCT_API_WORKSPACES_PATH") &&
    content.includes("saasProductApiWorkspaceDetailPath") &&
    !content.includes("tenantId:") &&
    !content.includes(prismaImport)
  );
}

export function walkPortalTsFiles(): string[] {
  const files: string[] = [];
  for (const dir of [PORTAL_ROOT, APP_PORTAL_ROOT]) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkPortalTsFilesFrom(fullPath));
        continue;
      }
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function walkPortalTsFilesFrom(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPortalTsFilesFrom(fullPath));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}
