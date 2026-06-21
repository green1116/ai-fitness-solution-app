import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import {
  assertQuotePortBindingContext,
  createQuotePortBindingContext,
} from "../ports/quote-port-binding";
import {
  createQuoteRuntimePortRegistry,
  mapExecutionToPortBinding,
} from "../ports/quote-port-registry";
import {
  createQuotePortResolver,
  createQuotePortStubBundle,
} from "../ports/quote-port-resolver";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import { createQuoteRuntimePortBinding } from "../integration/create-quote-runtime-port-binding";
import { createQuotePortExecutor, executeWithPortBinding } from "../services/quote-port-executor";
import { WORKSPACE_QUOTE_INTEGRATION_P2_TAG } from "../freeze/v56-p2-meta";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP2Validation {
  valid: boolean;
  summary: string;
}

function getP2CoreFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts"),
    join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-port-binding.ts"),
    join(INTEGRATION_ROOT, "services", "quote-port-executor.ts"),
  ];
}

function buildMountedPortBinding(workspaceId: string) {
  const bridgeSnapshot = loadV55QuoteRuntimeSnapshot(workspaceId);
  const stubPorts = createQuotePortStubBundle(bridgeSnapshot.snapshot);
  const portRegistry = createQuoteRuntimePortRegistry(stubPorts);
  const execution = {
    workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports: portRegistry.resolve(workspaceId),
  };
  const binding = mapExecutionToPortBinding(execution, portRegistry);
  const executor = createQuotePortExecutor(portRegistry);
  return { bridgeSnapshot, portRegistry, execution, binding, executor };
}

export function assertPortResolverContract(): boolean {
  const path = join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuotePortResolver") &&
    content.includes("resolvePersistence") &&
    content.includes("resolveApi") &&
    content.includes("resolveCommercial")
  );
}

export function assertPortRegistryWiringContract(): boolean {
  const path = join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteRuntimePortRegistry") && content.includes("mapExecutionToPortBinding");
}

export function assertPortBindingContextContract(): boolean {
  const path = join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("QuotePortBindingContext") && content.includes("createQuotePortBindingContext");
}

export function assertExecutionPortMappingContract(): boolean {
  const path = join(INTEGRATION_ROOT, "services", "quote-port-executor.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("executeWithPortBinding") && content.includes("createQuotePortExecutor");
}

export function assertP2NoDirectDbAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']|persistenceRepositories\.|saas-product-persistence/;
  return getP2CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoDirectApiAccess(): boolean {
  const pattern = /from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api\/handlers|\/api\/handlers\//;
  return getP2CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoWorkflowExecution(): boolean {
  const pattern = /executeWorkflow\s*\(|WorkflowEngine|workflowEngine|transitionWorkflow/;
  return getP2CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP2CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuotePortBinding(): boolean {
  const workspaceId = "v56-p2-port-binding";
  const mounted = buildMountedPortBinding(workspaceId);
  const integrationBinding = createQuoteRuntimePortBinding({ workspaceId });
  const resolver = createQuotePortResolver(createQuotePortStubBundle(mounted.bridgeSnapshot.snapshot));
  const resolved = resolver.resolve(workspaceId);
  const registry = createQuotePortRegistry(resolved);
  const manualBinding = createQuotePortBindingContext({
    workspaceId,
    snapshot: mounted.bridgeSnapshot.snapshot,
    ports: registry,
  });
  const executorResult = mounted.executor.execute(mounted.execution);
  const bindingResult = executeWithPortBinding(mounted.binding);
  const integrationResult = integrationBinding.executor.execute(integrationBinding.execution);

  return (
    assertQuotePortBindingContext(mounted.binding) &&
    assertQuotePortBindingContext(integrationBinding.binding) &&
    assertQuotePortBindingContext(manualBinding) &&
    mounted.binding.resolved.persistence &&
    mounted.binding.resolved.api &&
    mounted.binding.resolved.commercial &&
    executorResult.success &&
    bindingResult.success &&
    integrationResult.success
  );
}

export async function validateQuoteIntegrationP2(): Promise<QuoteIntegrationP2Validation> {
  const valid =
    existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts")) &&
    assertPortResolverContract() &&
    assertPortRegistryWiringContract() &&
    assertPortBindingContextContract() &&
    assertExecutionPortMappingContract() &&
    assertP2NoDirectDbAccess() &&
    assertP2NoDirectApiAccess() &&
    assertP2NoWorkflowExecution() &&
    assertP2NoPrismaImport() &&
    assertMountedQuotePortBinding();

  return {
    valid,
    summary: [`p2Tag=${WORKSPACE_QUOTE_INTEGRATION_P2_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasPortResolver(): boolean {
  return assertPortResolverContract() && assertMountedQuotePortBinding();
}
