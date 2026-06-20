/**
 * V53 Workspace Runtime — P8 Runtime Workspace Assembly Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeWorkspaceAssemblyContextContract,
  assertRuntimeWorkspaceAssemblyContract,
  assertRuntimeWorkspaceAssemblyFoundationOnlyScope,
  assertRuntimeWorkspaceAssemblyMappingFoundation,
  assertRuntimeWorkspaceAssemblyRegistrationFoundation,
  assertRuntimeWorkspaceAssemblyTypesContract,
  assertRuntimeWorkspaceAssemblyValidationContract,
  assertRuntimeAssemblyHasAllStatuses,
  validateRuntimeP8,
} from "../lib/workspace-runtime/validation/validate-runtime-p8";
import { createWorkspaceRuntimeAssemblyContext } from "../lib/workspace-runtime/runtime-workspace-assembly-context";
import { hasAssembly } from "../lib/workspace-runtime/runtime-workspace-assembly";
import { WORKSPACE_RUNTIME_META } from "../lib/workspace-runtime/index-meta";
import { WORKSPACE_RUNTIME_P8_FREEZE } from "../lib/workspace-runtime/freeze/v53-p8-meta";
import { WORKSPACE_RUNTIME_P8_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP8();
  assert(validation.valid, `P8 runtime workspace assembly validation: ${validation.summary}`);
  console.log("✓ P8 runtime workspace assembly validation ok");

  assert(assertRuntimeWorkspaceAssemblyContract(), "RUNTIME_WORKSPACE_ASSEMBLY_EXISTS");
  console.log("✓ RUNTIME_WORKSPACE_ASSEMBLY_EXISTS");

  assert(assertRuntimeWorkspaceAssemblyTypesContract(), "RUNTIME_WORKSPACE_ASSEMBLY_TYPES_EXISTS");
  console.log("✓ RUNTIME_WORKSPACE_ASSEMBLY_TYPES_EXISTS");

  assert(assertRuntimeWorkspaceAssemblyValidationContract(), "RUNTIME_WORKSPACE_ASSEMBLY_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_WORKSPACE_ASSEMBLY_VALIDATION_EXISTS");

  assert(assertRuntimeWorkspaceAssemblyContextContract(), "RUNTIME_WORKSPACE_ASSEMBLY_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_WORKSPACE_ASSEMBLY_CONTEXT_EXISTS");

  assert(assertRuntimeAssemblyHasAllStatuses(), "assembly statuses");
  console.log("✓ HAS_ASSEMBLED_STATUS");
  console.log("✓ HAS_PARTIAL_STATUS");
  console.log("✓ HAS_DEGRADED_STATUS");
  console.log("✓ HAS_INACTIVE_STATUS");
  console.log("✓ HAS_RESERVED_STATUS");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p8" });
  const snapshot = assemblyContext.assembly;

  assert(hasAssembly(snapshot, "workspace"), "assembly mappings");
  assert(hasAssembly(snapshot, "quote"), "assembly mappings");
  assert(hasAssembly(snapshot, "project"), "assembly mappings");
  assert(hasAssembly(snapshot, "report"), "assembly mappings");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeWorkspaceAssemblyFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeWorkspaceAssemblyMappingFoundation(), "assembly mappings foundation");
  assert(assertRuntimeWorkspaceAssemblyRegistrationFoundation(), "assembly registration");
  assert(WORKSPACE_RUNTIME_META.tag === WORKSPACE_RUNTIME_P8_TAG, "runtime meta tag");
  assert(WORKSPACE_RUNTIME_META.phase === "v53-workspace-runtime-p8", "runtime meta phase");
  assert(WORKSPACE_RUNTIME_P8_FREEZE.status === "runtime-workspace-assembly-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P8_TAG}`);
  console.log("V53 P8 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
