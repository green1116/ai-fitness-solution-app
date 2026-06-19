/**
 * V48 SaaS Runtime — Phase 2 verification
 */
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_RUNTIME_P2_TAG,
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  hasPermission,
  requireSession,
  resolvePermissions,
  resolveTenantContext,
  setRuntimeSession,
} from "../lib/saas-runtime";
import { SAAS_CONTEXT_ERROR_CODES, SaasContextError } from "../lib/saas-runtime/tenant-context/context-errors";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function scanForbiddenImports(rootDir: string): string[] {
  const pattern =
    /(?:from\s+["']@\/lib\/commercial-products|from\s+["'][./].*commercial-products|import\s*\(\s*["']@\/lib\/commercial-products)/;
  const violations: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".ts")) continue;
      const content = readFileSync(fullPath, "utf8");
      if (pattern.test(content)) violations.push(fullPath);
      if (content.includes("@prisma/client") || content.includes('from "@/lib/prisma"')) {
        violations.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return violations;
}

async function main() {
  const runtimeRoot = join(process.cwd(), "lib", "saas-runtime");
  const violations = scanForbiddenImports(runtimeRoot);
  assert(violations.length === 0, `forbidden imports: ${violations.join(", ")}`);
  console.log("✓ boundary validation ok");

  clearRuntimeSession();
  let authRequired = false;
  try {
    requireSession();
  } catch (error) {
    authRequired = error instanceof SaasContextError && error.code === SAAS_CONTEXT_ERROR_CODES.AUTH_REQUIRED;
  }
  assert(authRequired, "requireSession throws AUTH_REQUIRED");
  console.log("✓ requireSession auth guard ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const session = requireSession();
  assert(session.userId === getDefaultMockMembershipUserId(), "session userId");
  console.log("✓ requireSession ok");

  const ctx = await resolveTenantContext();
  assert(Boolean(ctx.tenantId), "tenantId");
  assert(Boolean(ctx.organizationId), "organizationId");
  assert(Boolean(ctx.workspaceId), "workspaceId");
  assert(ctx.roleSystemCode === "enterprise_owner", "roleSystemCode");
  assert(ctx.portalType === "enterprise", "portalType");
  console.log("✓ resolveTenantContext ok");
  console.log(`  tenantId=${ctx.tenantId}`);

  const permissions = resolvePermissions(ctx);
  assert(permissions.includes("quote:create"), "permissions mapped");
  assert(hasPermission(ctx, "tenant:admin"), "tenant admin permission");
  console.log("✓ permission resolver ok");
  console.log(`  permissions=${permissions.length}`);

  clearRuntimeSession();
  console.log(`tag=${SAAS_RUNTIME_P2_TAG}`);
  console.log("SAAS RUNTIME P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
