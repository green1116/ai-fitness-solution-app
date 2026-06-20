/**
 * V53 Workspace Runtime — P4 Runtime Capability Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeCapabilityContextContract,
  assertRuntimeCapabilityContract,
  assertRuntimeCapabilityFoundationOnlyScope,
  assertRuntimeCapabilityRegistrationFoundation,
  assertRuntimeCapabilitySurfaceFoundation,
  assertRuntimeCapabilityTypesContract,
  assertRuntimeCapabilityValidationContract,
  assertRuntimeCapabilityHasAllStatuses,
  validateRuntimeP4,
} from "../lib/workspace-runtime/validation/validate-runtime-p4";
import { createWorkspaceRuntimeCapabilityContext } from "../lib/workspace-runtime/runtime-capability-context";
import { hasCapability } from "../lib/workspace-runtime/runtime-capability";
import { WORKSPACE_RUNTIME_P4_FREEZE } from "../lib/workspace-runtime/freeze/v53-p4-meta";
import { WORKSPACE_RUNTIME_P4_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP4();
  assert(validation.valid, `P4 runtime capability validation: ${validation.summary}`);
  console.log("✓ P4 runtime capability validation ok");

  assert(assertRuntimeCapabilityContract(), "RUNTIME_CAPABILITY_EXISTS");
  console.log("✓ RUNTIME_CAPABILITY_EXISTS");

  assert(assertRuntimeCapabilityTypesContract(), "RUNTIME_CAPABILITY_TYPES_EXISTS");
  console.log("✓ RUNTIME_CAPABILITY_TYPES_EXISTS");

  assert(assertRuntimeCapabilityValidationContract(), "RUNTIME_CAPABILITY_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_CAPABILITY_VALIDATION_EXISTS");

  assert(assertRuntimeCapabilityContextContract(), "RUNTIME_CAPABILITY_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_CAPABILITY_CONTEXT_EXISTS");

  const capabilityContext = createWorkspaceRuntimeCapabilityContext({ workspaceId: "verify-p4" });
  const snapshot = capabilityContext.capability;

  assert(hasCapability(snapshot, "workspace"), "HAS_WORKSPACE_CAPABILITY");
  console.log("✓ HAS_WORKSPACE_CAPABILITY");

  assert(hasCapability(snapshot, "quote"), "HAS_QUOTE_CAPABILITY");
  console.log("✓ HAS_QUOTE_CAPABILITY");

  assert(hasCapability(snapshot, "project"), "HAS_PROJECT_CAPABILITY");
  console.log("✓ HAS_PROJECT_CAPABILITY");

  assert(hasCapability(snapshot, "report"), "HAS_REPORT_CAPABILITY");
  console.log("✓ HAS_REPORT_CAPABILITY");

  assert(assertRuntimeCapabilityHasAllStatuses(), "capability statuses");
  console.log("✓ HAS_ENABLED_STATUS");
  console.log("✓ HAS_DISABLED_STATUS");
  console.log("✓ HAS_EXPERIMENTAL_STATUS");
  console.log("✓ HAS_DEPRECATED_STATUS");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeCapabilityFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeCapabilitySurfaceFoundation(), "capability surfaces");
  assert(assertRuntimeCapabilityRegistrationFoundation(), "capability registration");
  assert(WORKSPACE_RUNTIME_P4_FREEZE.tag === WORKSPACE_RUNTIME_P4_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P4_FREEZE.status === "runtime-capability-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P4_TAG}`);
  console.log("V53 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
