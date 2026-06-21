import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import { createQuoteExecution } from "../services/quote-execution.service";
import { createQuotePortStubBundle } from "../ports/quote-port-resolver";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import {
  createMemoryQuoteRepositoryBinding,
  createQuotePersistenceAdapter,
  createQuoteRepositoryBinding,
} from "../adapters/persistence";
import { WORKSPACE_QUOTE_INTEGRATION_P3_TAG } from "../freeze/v56-p3-meta";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP3Validation {
  valid: boolean;
  summary: string;
}

function getP3AdapterFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "adapters", "persistence", "quote-persistence.adapter.ts"),
    join(INTEGRATION_ROOT, "adapters", "persistence", "quote-repository.adapter.ts"),
    join(INTEGRATION_ROOT, "adapters", "persistence", "quote-persistence-mapper.ts"),
  ];
}

function getExecutionLayerFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts"),
    join(INTEGRATION_ROOT, "services", "quote-execution.service.ts"),
    join(INTEGRATION_ROOT, "services", "quote-runtime-orchestrator.ts"),
    join(INTEGRATION_ROOT, "services", "quote-port-executor.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-executor.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-port-binding.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts"),
  ];
}

export function assertPersistenceAdapterContract(): boolean {
  const path = join(INTEGRATION_ROOT, "adapters", "persistence", "quote-persistence.adapter.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuotePersistenceAdapter") &&
    content.includes("loadQuoteSnapshot") &&
    content.includes("persistQuoteState") &&
    content.includes("exists")
  );
}

export function assertRepositoryBindingContract(): boolean {
  const path = join(INTEGRATION_ROOT, "adapters", "persistence", "quote-repository.adapter.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteRepositoryBinding") &&
    content.includes("persistQuoteState") &&
    content.includes("QuoteRepository")
  );
}

export function assertPortEnforcedPersistenceContract(): boolean {
  return getExecutionLayerFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return (
      !content.includes("persistenceRepositories") &&
      !content.includes("quoteRepository") &&
      !content.includes("adapters/persistence")
    );
  });
}

export function assertP3NoDirectDbAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getExecutionLayerFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoPrismaImportInExecution(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getExecutionLayerFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertAdapterUsesV50RepositoryNotPrisma(): boolean {
  const repositoryPath = join(INTEGRATION_ROOT, "adapters", "persistence", "quote-repository.adapter.ts");
  const content = readFileSync(repositoryPath, "utf8");
  return (
    content.includes("saas-product-persistence") &&
    content.includes("QuoteRepository") &&
    !content.includes("@/lib/prisma")
  );
}

export async function assertMountedQuotePersistenceAdapter(): Promise<boolean> {
  const tenantId = "tenant-v56-p3";
  const quoteId = "quote-v56-p3-test";
  const { binding, workspaceId } = await createMemoryQuoteRepositoryBinding({ tenantId });
  const adapter = createQuotePersistenceAdapter({ tenantId, binding });

  const persisted = adapter.persistQuoteState(workspaceId, quoteId);
  const exists = adapter.exists(workspaceId);
  const snapshot = adapter.loadQuoteSnapshot(workspaceId);
  const repositoryRecord = await binding.persistQuoteState({ workspaceId, quoteId });

  const stubBundle = createQuotePortStubBundle(snapshot);
  const ports = createQuotePortRegistry({
    persistence: adapter,
    api: stubBundle.api,
    commercial: stubBundle.commercial,
  });
  const execution = createQuoteExecution({
    workspaceId,
    snapshot,
    ports,
  });

  const manualBinding = createQuoteRepositoryBinding({
    repository: binding.repository,
    tenantId,
  });

  return (
    persisted &&
    exists &&
    snapshot.workspaceId === workspaceId &&
    repositoryRecord.quoteId.length > 0 &&
    execution.success &&
    manualBinding.repository === binding.repository &&
    loadV55QuoteRuntimeSnapshot(workspaceId).snapshot.workspaceId === workspaceId
  );
}

export async function validateQuoteIntegrationP3(): Promise<QuoteIntegrationP3Validation> {
  const mounted = await assertMountedQuotePersistenceAdapter();
  const valid =
    existsSync(join(INTEGRATION_ROOT, "adapters", "persistence", "quote-persistence.adapter.ts")) &&
    assertPersistenceAdapterContract() &&
    assertRepositoryBindingContract() &&
    assertPortEnforcedPersistenceContract() &&
    assertP3NoDirectDbAccess() &&
    assertP3NoPrismaImportInExecution() &&
    assertAdapterUsesV50RepositoryNotPrisma() &&
    getP3AdapterFiles().every((file) => existsSync(file)) &&
    mounted;

  return {
    valid,
    summary: [`p3Tag=${WORKSPACE_QUOTE_INTEGRATION_P3_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasPersistenceAdapter(): boolean {
  return assertPersistenceAdapterContract();
}
