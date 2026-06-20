/**
 * V54 Workspace Business Runtime — P1 Business Bridge Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertBridgeConsumesAssemblyOnly,
  assertBridgeContract,
  assertBridgeFoundationOnlyScope,
  assertBridgeNoKernelMutation,
  assertBridgeTypesContract,
  assertMountedBusinessBridgeReadiness,
  validateBusinessBridgeP1,
} from "../lib/workspace-business-runtime/validation/validate-business-bridge";
import { createWorkspaceBusinessBridge } from "../lib/workspace-business-runtime/bridge/workspace-runtime-bridge";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { WORKSPACE_BUSINESS_RUNTIME_META } from "../lib/workspace-business-runtime/index-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE } from "../lib/workspace-business-runtime/freeze/v54-p1-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P1_TAG } from "../lib/workspace-business-runtime/shared/business-constants";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");

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

const BUSINESS_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !walkTsFiles(BUSINESS_ROOT, BUSINESS_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !walkTsFiles(BUSINESS_ROOT, BUSINESS_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !walkTsFiles(BUSINESS_ROOT, BUSINESS_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

async function main() {
  const validation = await validateBusinessBridgeP1();
  assert(validation.valid, `P1 business bridge validation: ${validation.summary}`);
  console.log("✓ P1 business bridge validation ok");

  assert(assertBridgeContract(), "BRIDGE_EXISTS");
  console.log("✓ BRIDGE_EXISTS");

  assert(assertBridgeTypesContract(), "bridge types");
  assert(assertBridgeConsumesAssemblyOnly(), "CONSUMES_ASSEMBLY_ONLY");
  console.log("✓ CONSUMES_ASSEMBLY_ONLY");

  assert(assertBridgeNoKernelMutation(), "NO_KERNEL_MUTATION");
  console.log("✓ NO_KERNEL_MUTATION");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(assertBridgeFoundationOnlyScope(), "bridge foundation scope");
  assert(assertMountedBusinessBridgeReadiness(), "mounted readiness mapping");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p1" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  assert(bridgeView.surfaces.length === 4, "surface views");
  assert(bridgeView.entries.length === 4, "entry views");
  assert(bridgeView.readiness.readiness === "BLOCKED", "idle readiness");

  assert(WORKSPACE_BUSINESS_RUNTIME_META.tag === WORKSPACE_BUSINESS_RUNTIME_P1_TAG, "business meta tag");
  assert(WORKSPACE_BUSINESS_RUNTIME_META.phase === "v54-workspace-business-p1", "business meta phase");
  assert(WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE.status === "business-bridge-foundation", "business freeze status");
  console.log("✓ business meta ok");

  console.log(`tag=${WORKSPACE_BUSINESS_RUNTIME_P1_TAG}`);
  console.log("V54 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
