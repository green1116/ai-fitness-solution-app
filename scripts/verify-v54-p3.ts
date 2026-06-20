/**
 * V54 Workspace Business Runtime — P3 Business Domain Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessBridge } from "../lib/workspace-business-runtime/bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../lib/workspace-business-runtime/context/workspace-business-context-factory";
import { createWorkspaceBusinessDomain } from "../lib/workspace-business-runtime/domain/workspace-business-domain-factory";
import {
  WORKSPACE_BUSINESS_RUNTIME_P3_META,
  WORKSPACE_BUSINESS_RUNTIME_P3_TAG,
} from "../lib/workspace-business-runtime/domain/workspace-business-domain-meta";
import {
  assertBusinessDomainScope,
  assertWorkspaceBusinessDomainShape,
} from "../lib/workspace-business-runtime/domain/workspace-business-domain";
import {
  assertDomainAggregatesContext,
  assertDomainConsumesContextOnly,
  assertDomainContract,
  assertDomainFactoryContract,
  assertDomainFoundationOnlyScope,
  assertDomainRulesContract,
  assertDomainStateContract,
  assertDomainValidationContract,
  assertMountedBusinessDomainState,
  validateWorkspaceBusinessDomain,
} from "../lib/workspace-business-runtime/domain/workspace-business-domain-validation";
import { WORKSPACE_BUSINESS_RUNTIME_P3_FREEZE } from "../lib/workspace-business-runtime/freeze/v54-p3-meta";
import { WORKSPACE_BUSINESS_RUNTIME_ACTIVE_META } from "../lib/workspace-business-runtime/index-meta";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");
const DOMAIN_ROOT = join(BUSINESS_ROOT, "domain");

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

const P3_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditDomainFiles(): string[] {
  return walkTsFiles(DOMAIN_ROOT, P3_AUDIT_OPTIONS).filter(
    (file) =>
      !file.endsWith("workspace-business-domain-validation.ts") &&
      !file.endsWith("workspace-business-domain-meta.ts"),
  );
}

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPortal(): boolean {
  const pattern = /saas-product-portal|from\s+["']@\/lib\/saas-product-portal|from\s+["']@\/app\/saas-product/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoQuote(): boolean {
  const pattern = /QuoteRuntime|createQuote|calculateQuote|quote-runtime|handleCreateQuote|QuoteEngine/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoProject(): boolean {
  const pattern = /ProjectRuntime|createProject|project-runtime|handleCreateProject/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoReport(): boolean {
  const pattern = /ReportRuntime|createReport|report-runtime|handleCreateReport/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoOrchestration(): boolean {
  const pattern = /orchestrat|executeWorkflow|workflowEngine|WorkflowOrchestrat/i;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoEntry(): boolean {
  const pattern = /business-entry\/|createBusinessEntry|resolveBusinessEntryRoute|BusinessEntryRuntime/;
  return !auditDomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateWorkspaceBusinessDomain();
  assert(validation.valid, `P3 business domain validation: ${validation.summary}`);
  console.log("✓ P3 business domain validation ok");

  assert(existsSync(join(DOMAIN_ROOT, "workspace-business-domain.ts")), "domain module");
  assert(assertDomainContract(), "HAS_DOMAIN");
  console.log("✓ HAS_DOMAIN");

  assert(assertDomainStateContract(), "HAS_DOMAIN_STATE");
  console.log("✓ HAS_DOMAIN_STATE");

  assert(assertDomainFactoryContract(), "HAS_DOMAIN_FACTORY");
  console.log("✓ HAS_DOMAIN_FACTORY");

  assert(assertDomainRulesContract(), "HAS_DOMAIN_RULES");
  console.log("✓ HAS_DOMAIN_RULES");

  assert(assertDomainValidationContract(), "HAS_DOMAIN_VALIDATION");
  console.log("✓ HAS_DOMAIN_VALIDATION");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoPortal(), "NO_PORTAL");
  console.log("✓ NO_PORTAL");

  assert(auditNoQuote(), "NO_QUOTE");
  console.log("✓ NO_QUOTE");

  assert(auditNoProject(), "NO_PROJECT");
  console.log("✓ NO_PROJECT");

  assert(auditNoReport(), "NO_REPORT");
  console.log("✓ NO_REPORT");

  assert(auditNoOrchestration(), "NO_ORCHESTRATION");
  console.log("✓ NO_ORCHESTRATION");

  assert(auditNoEntry(), "NO_ENTRY");
  console.log("✓ NO_ENTRY");

  assert(assertDomainConsumesContextOnly(), "domain context-only consumption");
  assert(assertDomainFoundationOnlyScope(), "domain foundation scope");
  assert(assertMountedBusinessDomainState(), "mounted domain state");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p3" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);

  assert(assertWorkspaceBusinessDomainShape(domain), "domain shape");
  assert(assertBusinessDomainScope(domain.scope), "domain scope");
  assert(assertDomainAggregatesContext(context), "domain aggregates context");
  assert(domain.status === "BLOCKED", "idle domain status");
  assert(domain.state === "INITIALIZING", "idle domain state");

  assert(WORKSPACE_BUSINESS_RUNTIME_ACTIVE_META.tag === WORKSPACE_BUSINESS_RUNTIME_P3_TAG, "active meta tag");
  assert(WORKSPACE_BUSINESS_RUNTIME_ACTIVE_META.phase === "v54-workspace-business-p3", "active meta phase");
  assert(WORKSPACE_BUSINESS_RUNTIME_P3_FREEZE.status === "business-domain-foundation", "business p3 freeze status");
  assert(WORKSPACE_BUSINESS_RUNTIME_P3_META.status === "business-domain-foundation", "business p3 meta status");
  console.log("✓ business meta ok");

  console.log(`tag=${WORKSPACE_BUSINESS_RUNTIME_P3_TAG}`);
  console.log("V54 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
