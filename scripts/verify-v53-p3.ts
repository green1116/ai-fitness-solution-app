/**
 * V53 Workspace Runtime — P3 Runtime Lifecycle Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeLifecycleContextContract,
  assertRuntimeLifecycleContract,
  assertRuntimeLifecycleFoundationOnlyScope,
  assertRuntimeLifecycleHasAllStatuses,
  assertRuntimeLifecycleStateMachineFoundation,
  assertRuntimeLifecycleTypesContract,
  assertRuntimeLifecycleValidationContract,
  validateRuntimeP3,
} from "../lib/workspace-runtime/validation/validate-runtime-p3";
import { WORKSPACE_RUNTIME_P3_FREEZE } from "../lib/workspace-runtime/freeze/v53-p3-meta";
import { WORKSPACE_RUNTIME_P3_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP3();
  assert(validation.valid, `P3 runtime lifecycle validation: ${validation.summary}`);
  console.log("✓ P3 runtime lifecycle validation ok");

  assert(assertRuntimeLifecycleContract(), "RUNTIME_LIFECYCLE_EXISTS");
  console.log("✓ RUNTIME_LIFECYCLE_EXISTS");

  assert(assertRuntimeLifecycleTypesContract(), "RUNTIME_LIFECYCLE_TYPES_EXISTS");
  console.log("✓ RUNTIME_LIFECYCLE_TYPES_EXISTS");

  assert(assertRuntimeLifecycleValidationContract(), "RUNTIME_LIFECYCLE_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_LIFECYCLE_VALIDATION_EXISTS");

  assert(assertRuntimeLifecycleContextContract(), "RUNTIME_LIFECYCLE_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_LIFECYCLE_CONTEXT_EXISTS");

  const statuses = assertRuntimeLifecycleHasAllStatuses();
  assert(statuses, "lifecycle statuses");
  console.log("✓ HAS_IDLE_STATUS");
  console.log("✓ HAS_READY_STATUS");
  console.log("✓ HAS_MOUNTED_STATUS");
  console.log("✓ HAS_REFRESHING_STATUS");
  console.log("✓ HAS_UNMOUNTED_STATUS");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeLifecycleFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeLifecycleStateMachineFoundation(), "lifecycle state machine");
  assert(WORKSPACE_RUNTIME_P3_FREEZE.tag === WORKSPACE_RUNTIME_P3_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P3_FREEZE.status === "runtime-lifecycle-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P3_TAG}`);
  console.log("V53 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
