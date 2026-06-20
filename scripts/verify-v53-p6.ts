/**
 * V53 Workspace Runtime — P6 Runtime Entry Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeEntryContextContract,
  assertRuntimeEntryContract,
  assertRuntimeEntryFoundationOnlyScope,
  assertRuntimeEntryRegistrationFoundation,
  assertRuntimeEntrySurfaceFoundation,
  assertRuntimeEntryTypesContract,
  assertRuntimeEntryValidationContract,
  assertRuntimeEntryHasAllStatuses,
  validateRuntimeP6,
} from "../lib/workspace-runtime/validation/validate-runtime-p6";
import { createWorkspaceRuntimeEntryContext } from "../lib/workspace-runtime/runtime-entry-context";
import { hasEntry } from "../lib/workspace-runtime/runtime-entry";
import { WORKSPACE_RUNTIME_P6_FREEZE } from "../lib/workspace-runtime/freeze/v53-p6-meta";
import { WORKSPACE_RUNTIME_P6_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP6();
  assert(validation.valid, `P6 runtime entry validation: ${validation.summary}`);
  console.log("✓ P6 runtime entry validation ok");

  assert(assertRuntimeEntryContract(), "RUNTIME_ENTRY_EXISTS");
  console.log("✓ RUNTIME_ENTRY_EXISTS");

  assert(assertRuntimeEntryTypesContract(), "RUNTIME_ENTRY_TYPES_EXISTS");
  console.log("✓ RUNTIME_ENTRY_TYPES_EXISTS");

  assert(assertRuntimeEntryValidationContract(), "RUNTIME_ENTRY_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_ENTRY_VALIDATION_EXISTS");

  assert(assertRuntimeEntryContextContract(), "RUNTIME_ENTRY_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_ENTRY_CONTEXT_EXISTS");

  const entryContext = createWorkspaceRuntimeEntryContext({ workspaceId: "verify-p6" });
  const snapshot = entryContext.entry;

  assert(hasEntry(snapshot, "workspace"), "HAS_WORKSPACE_ENTRY");
  console.log("✓ HAS_WORKSPACE_ENTRY");

  assert(hasEntry(snapshot, "quote"), "HAS_QUOTE_ENTRY");
  console.log("✓ HAS_QUOTE_ENTRY");

  assert(hasEntry(snapshot, "project"), "HAS_PROJECT_ENTRY");
  console.log("✓ HAS_PROJECT_ENTRY");

  assert(hasEntry(snapshot, "report"), "HAS_REPORT_ENTRY");
  console.log("✓ HAS_REPORT_ENTRY");

  assert(assertRuntimeEntryHasAllStatuses(), "entry statuses");
  console.log("✓ HAS_ACTIVE_STATUS");
  console.log("✓ HAS_INACTIVE_STATUS");
  console.log("✓ HAS_HIDDEN_STATUS");
  console.log("✓ HAS_RESERVED_STATUS");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeEntryFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeEntrySurfaceFoundation(), "entry surfaces");
  assert(assertRuntimeEntryRegistrationFoundation(), "entry registration");
  assert(WORKSPACE_RUNTIME_P6_FREEZE.tag === WORKSPACE_RUNTIME_P6_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P6_FREEZE.status === "runtime-entry-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P6_TAG}`);
  console.log("V53 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
