/**
 * V53 Workspace Runtime — P7 Runtime Surface Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeSurfaceContextContract,
  assertRuntimeSurfaceContract,
  assertRuntimeSurfaceFoundationOnlyScope,
  assertRuntimeSurfaceMappingFoundation,
  assertRuntimeSurfaceRegistrationFoundation,
  assertRuntimeSurfaceTypesContract,
  assertRuntimeSurfaceValidationContract,
  assertRuntimeSurfaceHasAllStatuses,
  validateRuntimeP7,
} from "../lib/workspace-runtime/validation/validate-runtime-p7";
import { createWorkspaceRuntimeSurfaceContext } from "../lib/workspace-runtime/runtime-surface-context";
import { hasSurface } from "../lib/workspace-runtime/runtime-surface";
import { WORKSPACE_RUNTIME_P7_FREEZE } from "../lib/workspace-runtime/freeze/v53-p7-meta";
import { WORKSPACE_RUNTIME_P7_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function walkTsFiles(dir: string, options?: { excludeDirNames?: string[] }): string[] {
  const excludeDirNames = options?.excludeDirNames ?? [];
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && excludeDirNames.includes(entry.name)) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath, options));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

const RUNTIME_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoBusinessLogic(): boolean {
  const pattern =
    /handleCreateQuote|calculateQuote|handleTransitionWorkflow|handleCreateProject|handleCreateReport|QuoteEngine|ApprovalFlow/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

async function main() {
  const validation = await validateRuntimeP7();
  assert(validation.valid, `P7 runtime surface validation: ${validation.summary}`);
  console.log("✓ P7 runtime surface validation ok");

  assert(assertRuntimeSurfaceContract(), "RUNTIME_SURFACE_EXISTS");
  console.log("✓ RUNTIME_SURFACE_EXISTS");

  assert(assertRuntimeSurfaceTypesContract(), "RUNTIME_SURFACE_TYPES_EXISTS");
  console.log("✓ RUNTIME_SURFACE_TYPES_EXISTS");

  assert(assertRuntimeSurfaceValidationContract(), "RUNTIME_SURFACE_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_SURFACE_VALIDATION_EXISTS");

  assert(assertRuntimeSurfaceContextContract(), "RUNTIME_SURFACE_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_SURFACE_CONTEXT_EXISTS");

  const surfaceContext = createWorkspaceRuntimeSurfaceContext({ workspaceId: "verify-p7" });
  const snapshot = surfaceContext.surface;

  assert(hasSurface(snapshot, "workspace"), "HAS_WORKSPACE_SURFACE");
  console.log("✓ HAS_WORKSPACE_SURFACE");

  assert(hasSurface(snapshot, "quote"), "HAS_QUOTE_SURFACE");
  console.log("✓ HAS_QUOTE_SURFACE");

  assert(hasSurface(snapshot, "project"), "HAS_PROJECT_SURFACE");
  console.log("✓ HAS_PROJECT_SURFACE");

  assert(hasSurface(snapshot, "report"), "HAS_REPORT_SURFACE");
  console.log("✓ HAS_REPORT_SURFACE");

  assert(assertRuntimeSurfaceHasAllStatuses(), "surface statuses");
  console.log("✓ HAS_VISIBLE_STATUS");
  console.log("✓ HAS_HIDDEN_STATUS");
  console.log("✓ HAS_ACTIVE_STATUS");
  console.log("✓ HAS_INACTIVE_STATUS");
  console.log("✓ HAS_RESERVED_STATUS");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeSurfaceFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeSurfaceMappingFoundation(), "surface mappings");
  assert(assertRuntimeSurfaceRegistrationFoundation(), "surface registration");
  assert(WORKSPACE_RUNTIME_P7_FREEZE.tag === WORKSPACE_RUNTIME_P7_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P7_FREEZE.status === "runtime-surface-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P7_TAG}`);
  console.log("V53 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
