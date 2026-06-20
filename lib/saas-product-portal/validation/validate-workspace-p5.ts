import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { handleCreateWorkspace, handleGetWorkspace, withApiContext } from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_PORTAL_P5_TAG,
  saasProductApiWorkspaceDetailPath,
} from "../shared/portal-constants";
import { buildWorkspaceMetadataView } from "../workspace-capability/workspace-metadata-view";
import { WORKSPACE_PRODUCT_ENTRY_REGISTRY } from "../workspace-capability/workspace-entry-registry";
import { WORKSPACE_PRODUCT_NAV_ITEMS } from "../workspace-capability/workspace-product-navigation";
import type { PortalP5Validation, PortalWorkspace } from "../shared/portal-types";
import { NextRequest } from "next/server";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

export async function validatePortalP5(): Promise<PortalP5Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const createBodyPayload = { name: `p5-validate-${Date.now()}` };
  const createRequest = new NextRequest(`http://localhost/api/saas-product/workspaces`, {
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
    data?: { workspace: { id: string; name: string; status: string; tenantId: string; createdAt: string; updatedAt: string } };
  };

  const workspaceId = createBody.data?.workspace.id ?? "";
  const detailRequest = new NextRequest(`http://localhost${saasProductApiWorkspaceDetailPath(workspaceId)}`, {
    headers,
  });
  const detailResponse = await withApiContext(
    detailRequest,
    (ctx) => handleGetWorkspace(ctx, workspaceId),
    { requireTenant: true },
  );
  const detailBody = (await detailResponse.json()) as {
    ok: boolean;
    data?: { workspace: { id: string; name: string; status: string; tenantId: string; createdAt: string; updatedAt: string } };
  };

  clearRuntimeSession();

  const metadata =
    detailBody.data?.workspace
      ? buildWorkspaceMetadataView(detailBody.data.workspace as PortalWorkspace)
      : null;

  const valid =
    createBody.ok === true &&
    detailBody.ok === true &&
    Boolean(metadata?.id) &&
    WORKSPACE_PRODUCT_NAV_ITEMS.length >= 4 &&
    WORKSPACE_PRODUCT_ENTRY_REGISTRY.length >= 4 &&
    existsSync(join(PORTAL_ROOT, "workspace-capability", "workspace-context-provider.tsx"));

  return {
    valid,
    summary: [
      `p5Tag=${SAAS_PRODUCT_PORTAL_P5_TAG}`,
      `context=${Boolean(metadata)}`,
      `nav=${WORKSPACE_PRODUCT_NAV_ITEMS.length}`,
      `entries=${WORKSPACE_PRODUCT_ENTRY_REGISTRY.length}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceContextContract(): boolean {
  const providerPath = join(PORTAL_ROOT, "workspace-capability", "workspace-context-provider.tsx");
  const hookPath = join(PORTAL_ROOT, "hooks", "use-workspace-context.ts");
  const provider = readFileSync(providerPath, "utf8");
  const hook = readFileSync(hookPath, "utf8");
  return (
    provider.includes("getWorkspaceAction") &&
    provider.includes("buildWorkspaceMetadataView") &&
    hook.includes("useWorkspaceContextInternal")
  );
}

export function assertWorkspaceCapabilityOnlyScope(): boolean {
  const capabilityRoot = join(PORTAL_ROOT, "workspace-capability");
  const files = [
    join(capabilityRoot, "workspace-entry-registry.ts"),
    join(PORTAL_ROOT, "pages", "workspace-entry-placeholder-page-content.tsx"),
  ];
  const forbidden = [
    /handleCreateQuote/,
    /handleTransitionWorkflow/,
    /lib\/saas-product\//,
    /saas-product-persistence/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
