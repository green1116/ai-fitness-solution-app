import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { handleCreateWorkspace, handleGetWorkspace, withApiContext } from "@/lib/saas-product-api";
import {
  SAAS_PRODUCT_PORTAL_P6_TAG,
  saasProductApiWorkspaceDetailPath,
  saasProductPortalWorkspaceQuotesPath,
} from "../shared/portal-constants";
import { assertQuoteEntryRegisteredInWorkspaceRegistry } from "../quote-entry/quote-entry-registry-extension";
import { assertQuotesNavExistsInWorkspaceNavigation } from "../quote-entry/quote-entry-navigation-extension";
import type { PortalP6Validation } from "../shared/portal-types";
import { NextRequest } from "next/server";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

export async function validatePortalP6(): Promise<PortalP6Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const headers = {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };

  const createBodyPayload = { name: `p6-validate-${Date.now()}` };
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

  const quoteRoutePath = join(APP_PORTAL_ROOT, "workspaces", "[id]", "quotes", "page.tsx");
  const quotePage = existsSync(quoteRoutePath) ? readFileSync(quoteRoutePath, "utf8") : "";
  const quotesPath = saasProductPortalWorkspaceQuotesPath(workspaceId);

  const valid =
    createBody.ok === true &&
    detailBody.ok === true &&
    existsSync(join(PORTAL_ROOT, "pages", "quote-entry-page-content.tsx")) &&
    quotePage.includes("QuoteEntryPageContent") &&
    quotesPath.endsWith("/quotes") &&
    assertQuoteEntryRegisteredInWorkspaceRegistry() &&
    assertQuotesNavExistsInWorkspaceNavigation();

  return {
    valid,
    summary: [
      `p6Tag=${SAAS_PRODUCT_PORTAL_P6_TAG}`,
      `quoteRoute=${existsSync(quoteRoutePath)}`,
      `registry=${assertQuoteEntryRegisteredInWorkspaceRegistry()}`,
      `nav=${assertQuotesNavExistsInWorkspaceNavigation()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertQuoteEntryUiContract(): boolean {
  const pagePath = join(PORTAL_ROOT, "pages", "quote-entry-page-content.tsx");
  const page = readFileSync(pagePath, "utf8");
  return (
    existsSync(join(PORTAL_ROOT, "components", "quote-entry-header.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "quote-entry-card.tsx")) &&
    existsSync(join(PORTAL_ROOT, "components", "quote-entry-empty-state.tsx")) &&
    page.includes("QuoteEntryHeader") &&
    page.includes("QuoteEntryCard") &&
    page.includes("QuoteEntryEmptyState")
  );
}

export function assertQuoteCapabilityOnlyScope(): boolean {
  const quoteRoot = join(PORTAL_ROOT, "quote-entry");
  const files = [
    join(quoteRoot, "quote-entry-registry-extension.ts"),
    join(quoteRoot, "quote-entry-navigation-extension.ts"),
    join(PORTAL_ROOT, "pages", "quote-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "quote-entry-header.tsx"),
  ];
  const forbidden = [
    /handleCreateQuote/,
    /handleUpdateQuote/,
    /handleTransitionWorkflow/,
    /lib\/saas-product\//,
    /saas-product-persistence/,
    /calculateQuote/,
    /approval/i,
    /@prisma\/client/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
