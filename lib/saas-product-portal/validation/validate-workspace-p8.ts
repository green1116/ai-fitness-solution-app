import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { handleCreateWorkspace, handleGetWorkspace, withApiContext } from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_PORTAL_P8_TAG,
  saasProductApiWorkspaceDetailPath,
  saasProductPortalWorkspaceReportsPath,
} from "../shared/portal-constants";
import { assertReportEntryRegisteredInWorkspaceRegistry } from "../report-entry/report-entry-registry-extension";
import { assertReportsNavExistsInWorkspaceNavigation } from "../report-entry/report-entry-navigation-extension";
import type { PortalP8Validation } from "../shared/portal-types";
import { NextRequest } from "next/server";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

export async function validatePortalP8(): Promise<PortalP8Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const createBodyPayload = { name: `p8-validate-${Date.now()}` };
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

  const reportRoutePath = join(APP_PORTAL_ROOT, "workspaces", "[id]", "reports", "page.tsx");
  const reportPage = existsSync(reportRoutePath) ? readFileSync(reportRoutePath, "utf8") : "";
  const reportsPath = saasProductPortalWorkspaceReportsPath(workspaceId);

  const valid =
    createBody.ok === true &&
    detailBody.ok === true &&
    existsSync(join(PORTAL_ROOT, "pages", "report-entry-page-content.tsx")) &&
    reportPage.includes("ReportEntryPageContent") &&
    reportsPath.endsWith("/reports") &&
    assertReportEntryRegisteredInWorkspaceRegistry() &&
    assertReportsNavExistsInWorkspaceNavigation();

  return {
    valid,
    summary: [
      `p8Tag=${SAAS_PRODUCT_PORTAL_P8_TAG}`,
      `reportRoute=${existsSync(reportRoutePath)}`,
      `registry=${assertReportEntryRegisteredInWorkspaceRegistry()}`,
      `nav=${assertReportsNavExistsInWorkspaceNavigation()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertReportEntryUiContract(): boolean {
  const pagePath = join(PORTAL_ROOT, "pages", "report-entry-page-content.tsx");
  const page = readFileSync(pagePath, "utf8");
  return (
    existsSync(join(PORTAL_ROOT, "components", "report-entry-header.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "report-entry-card.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "report-entry-empty-state.tsx")) &&
    page.includes("ReportEntryHeader") &&
    page.includes("ReportEntryCard") &&
    page.includes("ReportEntryEmptyState")
  );
}

export function assertReportCapabilityOnlyScope(): boolean {
  const reportRoot = join(PORTAL_ROOT, "report-entry");
  const files = [
    join(reportRoot, "report-entry-registry-extension.ts"),
    join(reportRoot, "report-entry-navigation-extension.ts"),
    join(PORTAL_ROOT, "pages", "report-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "report-entry-header.tsx"),
  ];
  const forbidden = [
    /handleCreateReport/,
    /handleUpdateReport/,
    /handleTransitionWorkflow/,
    /lib\/saas-product\//,
    /saas-product-persistence/,
    /report-analytics-runtime/,
    /@prisma\/client/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
