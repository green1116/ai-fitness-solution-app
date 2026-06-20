/**
 * V53 Workspace Runtime — P1 Runtime Contracts Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertRuntimeContractsContract,
  assertRuntimeContextContract,
  assertRuntimeFoundationOnlyScope,
  assertRuntimeTypesContract,
  assertRuntimeValidationContract,
  validateRuntimeP1,
} from "../lib/workspace-runtime/validation/validate-runtime-p1";
import { WORKSPACE_RUNTIME_P1_FREEZE } from "../lib/workspace-runtime/freeze/v53-p1-meta";
import { WORKSPACE_RUNTIME_P1_TAG } from "../lib/workspace-runtime/shared/runtime-constants";

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

const RUNTIME_AUDIT_ROOT = RUNTIME_ROOT;
const RUNTIME_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !walkTsFiles(RUNTIME_AUDIT_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !walkTsFiles(RUNTIME_AUDIT_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoBusinessLogic(): boolean {
  const pattern =
    /handleCreateQuote|calculateQuote|handleTransitionWorkflow|handleCreateProject|handleCreateReport|QuoteEngine|ApprovalFlow/;
  return !walkTsFiles(RUNTIME_AUDIT_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

async function main() {
  const validation = await validateRuntimeP1();
  assert(validation.valid, `P1 runtime contracts validation: ${validation.summary}`);
  console.log("✓ P1 runtime contracts validation ok");

  assert(assertRuntimeTypesContract(), "RUNTIME_TYPES_EXISTS");
  console.log("✓ RUNTIME_TYPES_EXISTS");

  assert(assertRuntimeContractsContract(), "RUNTIME_CONTRACTS_EXISTS");
  console.log("✓ RUNTIME_CONTRACTS_EXISTS");

  assert(assertRuntimeContextContract(), "RUNTIME_CONTEXT_EXISTS");
  console.log("✓ RUNTIME_CONTEXT_EXISTS");

  assert(assertRuntimeValidationContract(), "RUNTIME_VALIDATION_EXISTS");
  console.log("✓ RUNTIME_VALIDATION_EXISTS");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoBusinessLogic() && assertRuntimeFoundationOnlyScope(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(WORKSPACE_RUNTIME_P1_FREEZE.tag === WORKSPACE_RUNTIME_P1_TAG, "runtime freeze tag");
  assert(WORKSPACE_RUNTIME_P1_FREEZE.status === "runtime-contracts-foundation", "runtime freeze status");
  console.log("✓ runtime meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_P1_TAG}`);
  console.log("V53 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
