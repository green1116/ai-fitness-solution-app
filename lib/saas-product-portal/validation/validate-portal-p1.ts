import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { handleMe, withApiContext } from "@/lib/saas-product-api";
import { SAAS_PRODUCT_API_ME_PATH, SAAS_PRODUCT_PORTAL_P1_TAG } from "../shared/portal-constants";
import { buildProductPortalNavigation } from "../layout/portal-navigation";
import type { PortalP1Validation } from "../shared/portal-types";

const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");
const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

const FORBIDDEN_PATTERNS = {
  prisma: /@\/lib\/prisma|from\s+["']@\/lib\/prisma["']/,
  persistenceRepositories: /persistenceRepositories/,
  v49Runtime: /lib\/saas-product\/|from\s+["']@\/lib\/saas-product["']/,
  v50Runtime: /lib\/saas-product-persistence\/|from\s+["']@\/lib\/saas-product-persistence["']/,
} as const;

function walkTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function auditPortalBoundary(checkId: string, pattern: RegExp): boolean {
  const files = [...walkTsFiles(PORTAL_ROOT), ...walkTsFiles(APP_PORTAL_ROOT)];
  return !files.some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditApiOnlyClient(): boolean {
  const clientPath = join(PORTAL_ROOT, "client", "saas-product-api-client.ts");
  const content = readFileSync(clientPath, "utf8");
  return content.includes('path.startsWith("/api/saas-product")') && content.includes('credentials: "include"');
}

export async function validatePortalP1(): Promise<PortalP1Validation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const request = new NextRequest(`http://localhost${SAAS_PRODUCT_API_ME_PATH}`, {
    headers: {
      "x-user-id": getDefaultMockMembershipUserId(),
      "x-user-email": "owner@example.com",
    },
  });
  const response = await withApiContext(request, (ctx) => handleMe(ctx), { requireTenant: true });
  const body = (await response.json()) as { ok: boolean; data?: { tenantId: string; userId: string } };
  const me = body.data;
  const navigation = me
    ? buildProductPortalNavigation({
        userId: me.userId,
        tenantId: me.tenantId,
        portalType: "enterprise",
        roleSystemCode: "enterprise_owner",
      })
    : [];

  clearRuntimeSession();

  const portalNoPrisma = auditPortalBoundary("PORTAL_NO_PRISMA", FORBIDDEN_PATTERNS.prisma);
  const portalApiOnly = auditApiOnlyClient();
  const portalNoV49V50 =
    auditPortalBoundary("PORTAL_NO_V49", FORBIDDEN_PATTERNS.v49Runtime) &&
    auditPortalBoundary("PORTAL_NO_V50", FORBIDDEN_PATTERNS.v50Runtime);

  const requiredFiles = [
    join(PORTAL_ROOT, "client", "saas-product-api-client.ts"),
    join(PORTAL_ROOT, "session", "use-portal-session.ts"),
    join(PORTAL_ROOT, "layout", "portal-shell.tsx"),
    join(APP_PORTAL_ROOT, "layout.tsx"),
    join(APP_PORTAL_ROOT, "page.tsx"),
    join(APP_PORTAL_ROOT, "settings", "page.tsx"),
  ];

  const valid =
    portalNoPrisma &&
    portalApiOnly &&
    portalNoV49V50 &&
    requiredFiles.every((file) => existsSync(file)) &&
    body.ok === true &&
    me?.tenantId === "tenant-mock-enterprise" &&
    navigation.length > 0;

  return {
    valid,
    summary: [
      `p1Tag=${SAAS_PRODUCT_PORTAL_P1_TAG}`,
      `PORTAL_NO_PRISMA=${portalNoPrisma}`,
      `PORTAL_API_ONLY=${portalApiOnly}`,
      `PORTAL_NO_V49_V50=${portalNoV49V50}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function runPortalBoundaryAudit(): Record<string, boolean> {
  return {
    PORTAL_NO_PRISMA: auditPortalBoundary("PORTAL_NO_PRISMA", FORBIDDEN_PATTERNS.prisma),
    PORTAL_API_ONLY: auditApiOnlyClient(),
    PORTAL_NO_V49_V50:
      auditPortalBoundary("PORTAL_NO_V49", FORBIDDEN_PATTERNS.v49Runtime) &&
      auditPortalBoundary("PORTAL_NO_V50", FORBIDDEN_PATTERNS.v50Runtime),
  };
}
