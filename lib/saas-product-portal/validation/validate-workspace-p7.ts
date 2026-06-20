import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { handleCreateWorkspace, handleGetWorkspace, withApiContext } from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_PORTAL_P7_TAG,
  saasProductApiWorkspaceDetailPath,
  saasProductPortalWorkspaceProjectsPath,
} from "../shared/portal-constants";
import { assertProjectEntryRegisteredInWorkspaceRegistry } from "../project-entry/project-entry-registry-extension";
import { assertProjectsNavExistsInWorkspaceNavigation } from "../project-entry/project-entry-navigation-extension";
import type { PortalP7Validation } from "../shared/portal-types";
import { NextRequest } from "next/server";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

export async function validatePortalP7(): Promise<PortalP7Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const createBodyPayload = { name: `p7-validate-${Date.now()}` };
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
    data?: { workspace: { id: string } };
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
  const detailBody = (await detailResponse.json()) as { ok: boolean };

  clearRuntimeSession();

  const projectRoutePath = join(APP_PORTAL_ROOT, "workspaces", "[id]", "projects", "page.tsx");
  const projectPage = existsSync(projectRoutePath) ? readFileSync(projectRoutePath, "utf8") : "";
  const projectsPath = saasProductPortalWorkspaceProjectsPath(workspaceId);

  const valid =
    createBody.ok === true &&
    detailBody.ok === true &&
    existsSync(join(PORTAL_ROOT, "pages", "project-entry-page-content.tsx")) &&
    projectPage.includes("ProjectEntryPageContent") &&
    projectsPath.endsWith("/projects") &&
    assertProjectEntryRegisteredInWorkspaceRegistry() &&
    assertProjectsNavExistsInWorkspaceNavigation();

  return {
    valid,
    summary: [
      `p7Tag=${SAAS_PRODUCT_PORTAL_P7_TAG}`,
      `projectRoute=${existsSync(projectRoutePath)}`,
      `registry=${assertProjectEntryRegisteredInWorkspaceRegistry()}`,
      `nav=${assertProjectsNavExistsInWorkspaceNavigation()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertProjectEntryUiContract(): boolean {
  const pagePath = join(PORTAL_ROOT, "pages", "project-entry-page-content.tsx");
  const page = readFileSync(pagePath, "utf8");
  return (
    existsSync(join(PORTAL_ROOT, "components", "project-entry-header.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "project-entry-card.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "project-entry-empty-state.tsx")) &&
    page.includes("ProjectEntryHeader") &&
    page.includes("ProjectEntryCard") &&
    page.includes("ProjectEntryEmptyState")
  );
}

export function assertProjectCapabilityOnlyScope(): boolean {
  const projectRoot = join(PORTAL_ROOT, "project-entry");
  const files = [
    join(projectRoot, "project-entry-registry-extension.ts"),
    join(projectRoot, "project-entry-navigation-extension.ts"),
    join(PORTAL_ROOT, "pages", "project-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "project-entry-header.tsx"),
  ];
  const forbidden = [
    /handleCreateProject/,
    /handleUpdateProject/,
    /handleTransitionWorkflow/,
    /lib\/saas-product\//,
    /saas-product-persistence/,
    /project-delivery-runtime/,
    /@prisma\/client/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
