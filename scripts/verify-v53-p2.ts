/**
 * V53 Workspace Runtime — P2 Runtime Registry Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRegistryHasAllFoundationRuntimes,
  assertRuntimeRegistryContextContract,
  assertRuntimeRegistryContract,
  assertRuntimeRegistryFoundationOnlyScope,
  assertRuntimeRegistryTypesContract,
  assertRuntimeRegistryValidationContract,
  validateRuntimeP2,
} from "../lib/workspace-runtime/validation/validate-runtime-p2";
import { createWorkspaceRuntimeRegistryContext } from "../lib/workspace-runtime/runtime-registry-context";
import { hasRuntimeEntry } from "../lib/workspace-runtime/runtime-registry";
import { WORKSPACE_RUNTIME_P2_FREEZE } from "../lib/workspace-runtime/freeze/v53-p2-meta";
import { WORKSPACE_RUNTIME_P2_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP2();
  assert(validation.valid, `P2 runtime registry validation: ${validation.summary}`);
  console.log("✓ P2 runtime registry validation ok");

  assert(assertRuntimeRegistryContract(), "RUNTIME_REGISTRY_EXISTS");
  console.log("✓ RUNTIME_REGISTRY_EXISTS");

  assert(assertRuntimeRegistryTypesContract(), "RUNTIME_REGISTRY_TYPES_EXISTS");
  console.log("✓ RUNTIME_REGISTRY_TYPES_EXISTS");

  assert(assertRuntimeRegistryValidationContract(), "RUNTIME_REGISTRY_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_REGISTRY_VALIDATION_EXISTS");

  assert(assertRuntimeRegistryContextContract(), "RUNTIME_REGISTRY_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_REGISTRY_CONTEXT_EXISTS");

  const registryContext = createWorkspaceRuntimeRegistryContext({ workspaceId: "verify-p2" });
  const registry = registryContext.registry;

  assert(hasRuntimeEntry(registry, "workspace"), "REGISTRY_HAS_WORKSPACE_RUNTIME");
  console.log("✓ REGISTRY_HAS_WORKSPACE_RUNTIME");

  assert(hasRuntimeEntry(registry, "quote"), "REGISTRY_HAS_QUOTE_RUNTIME");
  console.log("✓ REGISTRY_HAS_QUOTE_RUNTIME");

  assert(hasRuntimeEntry(registry, "project"), "REGISTRY_HAS_PROJECT_RUNTIME");
  console.log("✓ REGISTRY_HAS_PROJECT_RUNTIME");

  assert(hasRuntimeEntry(registry, "report"), "REGISTRY_HAS_REPORT_RUNTIME");
  console.log("✓ REGISTRY_HAS_REPORT_RUNTIME");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeRegistryFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRegistryHasAllFoundationRuntimes(), "registry foundation runtimes");
  assert(WORKSPACE_RUNTIME_P2_FREEZE.tag === WORKSPACE_RUNTIME_P2_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P2_FREEZE.status === "runtime-registry-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P2_TAG}`);
  console.log("V53 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
