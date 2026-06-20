/**
 * V53 Workspace Runtime — P5 Runtime Verification Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeVerificationConcernFoundation,
  assertRuntimeVerificationContextContract,
  assertRuntimeVerificationContract,
  assertRuntimeVerificationFoundationOnlyScope,
  assertRuntimeVerificationRegistrationFoundation,
  assertRuntimeVerificationTypesContract,
  assertRuntimeVerificationValidationContract,
  assertRuntimeVerificationHasAllStatuses,
  validateRuntimeP5,
} from "../lib/workspace-runtime/validation/validate-runtime-p5";
import { createWorkspaceRuntimeVerificationContext } from "../lib/workspace-runtime/runtime-verification-context";
import { hasVerification } from "../lib/workspace-runtime/runtime-verification";
import { WORKSPACE_RUNTIME_P5_FREEZE } from "../lib/workspace-runtime/freeze/v53-p5-meta";
import { WORKSPACE_RUNTIME_P5_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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
  const validation = await validateRuntimeP5();
  assert(validation.valid, `P5 runtime verification validation: ${validation.summary}`);
  console.log("✓ P5 runtime verification validation ok");

  assert(assertRuntimeVerificationContract(), "RUNTIME_VERIFICATION_EXISTS");
  console.log("✓ RUNTIME_VERIFICATION_EXISTS");

  assert(assertRuntimeVerificationTypesContract(), "RUNTIME_VERIFICATION_TYPES_EXISTS");
  console.log("✓ RUNTIME_VERIFICATION_TYPES_EXISTS");

  assert(assertRuntimeVerificationValidationContract(), "RUNTIME_VERIFICATION_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_VERIFICATION_VALIDATION_EXISTS");

  assert(assertRuntimeVerificationContextContract(), "RUNTIME_VERIFICATION_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_VERIFICATION_CONTEXT_EXISTS");

  assert(assertRuntimeVerificationHasAllStatuses(), "verification statuses");
  console.log("✓ HAS_PASSED_STATUS");
  console.log("✓ HAS_WARNING_STATUS");
  console.log("✓ HAS_FAILED_STATUS");
  console.log("✓ HAS_SKIPPED_STATUS");

  const verificationContext = createWorkspaceRuntimeVerificationContext({ workspaceId: "verify-p5" });
  const snapshot = verificationContext.verification;

  assert(hasVerification(snapshot, "type-integrity"), "verification concerns");
  assert(hasVerification(snapshot, "registry-consistency"), "verification concerns");
  assert(hasVerification(snapshot, "lifecycle-consistency"), "verification concerns");
  assert(hasVerification(snapshot, "capability-consistency"), "verification concerns");
  assert(hasVerification(snapshot, "context-composition"), "verification concerns");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeVerificationFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(assertRuntimeVerificationConcernFoundation(), "verification concerns foundation");
  assert(assertRuntimeVerificationRegistrationFoundation(), "verification registration");
  assert(WORKSPACE_RUNTIME_P5_FREEZE.tag === WORKSPACE_RUNTIME_P5_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P5_FREEZE.status === "runtime-verification-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P5_TAG}`);
  console.log("V53 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
