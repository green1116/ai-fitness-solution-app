import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";
import {
  assertPortEnforcedExecution,
  createQuoteRuntimeExecutor,
  createQuoteRuntimeIntegration,
  runQuoteRuntimeIntegration,
} from "../integration/create-quote-runtime-executor";
import {
  assertV55QuoteRuntimeReadOnlyDependency,
  loadV55QuoteRuntimeSnapshot,
  resolveQuoteFromEntry,
} from "../bridge/quote-runtime-bridge";
import { createQuoteExecution } from "../services/quote-execution.service";
import { executeQuoteRuntimeFlow } from "../services/quote-runtime-orchestrator";
import { WORKSPACE_QUOTE_INTEGRATION_P1_TAG } from "../freeze/v56-p1-meta";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP1Validation {
  valid: boolean;
  summary: string;
}

function getP1CoreFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts"),
    join(INTEGRATION_ROOT, "services", "quote-execution.service.ts"),
    join(INTEGRATION_ROOT, "services", "quote-runtime-orchestrator.ts"),
    join(INTEGRATION_ROOT, "integration", "create-quote-runtime-executor.ts"),
    join(INTEGRATION_ROOT, "shared", "integration-types.ts"),
  ];
}

function buildStubPorts(snapshot: WorkspaceQuoteRuntimeSnapshot) {
  return createQuotePortRegistry({
    persistence: {
      loadQuoteSnapshot: () => snapshot,
      exists: () => true,
    },
    api: {
      getQuoteSurface: () => ({ key: "quote" }),
      getQuoteReadiness: () => snapshot.quoteReadiness,
    },
    commercial: {
      getQuoteEligibility: () => "ELIGIBLE" as const,
      getQuoteSurfaceFlags: () => ({ eligible: true, visible: false, active: false }),
    },
  });
}

export function assertExecutionCoreContract(): boolean {
  const executionPath = join(INTEGRATION_ROOT, "services", "quote-execution.service.ts");
  const content = readFileSync(executionPath, "utf8");
  return content.includes("createQuoteExecution") && content.includes("QuoteExecutionResult");
}

export function assertV55BridgeContract(): boolean {
  const bridgePath = join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts");
  const content = readFileSync(bridgePath, "utf8");
  return (
    content.includes("loadV55QuoteRuntimeSnapshot") &&
    content.includes("resolveQuoteFromEntry") &&
    content.includes("buildQuoteRuntimeFoundationSnapshot")
  );
}

export function assertExecutorFactoryContract(): boolean {
  const path = join(INTEGRATION_ROOT, "integration", "create-quote-runtime-executor.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteRuntimeExecutor") && content.includes("createQuoteRuntimeIntegration");
}

export function assertExecutionContextContract(): boolean {
  const path = join(INTEGRATION_ROOT, "shared", "integration-types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("QuoteExecutionContext") && content.includes("QuoteRuntimePorts");
}

export function assertExecutionResultContract(): boolean {
  const path = join(INTEGRATION_ROOT, "shared", "integration-types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("QuoteExecutionResult") && content.includes("QuoteExecutionStatus");
}

export function assertPortEnforcedExecutionContract(): boolean {
  return getP1CoreFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return !content.includes("@/lib/prisma") && !content.includes("@/app/api");
  });
}

export function assertNoDirectDbAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']|persistenceRepositories\./;
  return getP1CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertNoDirectApiBypass(): boolean {
  const pattern = /from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api\/handlers/;
  return getP1CoreFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertV55ReadOnlyDependency(): boolean {
  const bridgePath = join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts");
  const content = readFileSync(bridgePath, "utf8");
  return (
    assertV55QuoteRuntimeReadOnlyDependency() &&
    content.includes("V55_FOUNDATION_FROZEN") &&
    !content.includes("createWorkspaceQuoteRuntimeSnapshot")
  );
}

export function assertMountedQuoteExecutionCore(): boolean {
  const workspaceId = "v56-p1-quote-execution";
  const bridgeSnapshot = loadV55QuoteRuntimeSnapshot(workspaceId);
  const ports = buildStubPorts(bridgeSnapshot.snapshot);
  const integration = createQuoteRuntimeIntegration({ workspaceId, ports });
  const executorResult = integration.executor.execute({
    workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports,
  });
  const serviceResult = createQuoteExecution({
    workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports,
  });
  const workflowResult = executeQuoteRuntimeFlow(workspaceId, ports);
  const runResult = runQuoteRuntimeIntegration({ workspaceId, ports });
  const entrySnapshot = resolveQuoteFromEntry(workspaceId);

  return (
    bridgeSnapshot.snapshot.runtimeState === "SHELL" &&
    entrySnapshot.snapshot.workspaceId === workspaceId &&
    executorResult.success &&
    serviceResult.success &&
    workflowResult.success &&
    runResult.success &&
    assertPortEnforcedExecution({
      workspaceId,
      snapshot: bridgeSnapshot.snapshot,
      ports,
    })
  );
}

export async function validateQuoteIntegrationP1(): Promise<QuoteIntegrationP1Validation> {
  const valid =
    existsSync(join(INTEGRATION_ROOT, "services", "quote-execution.service.ts")) &&
    assertExecutionCoreContract() &&
    assertV55BridgeContract() &&
    assertExecutorFactoryContract() &&
    assertExecutionContextContract() &&
    assertExecutionResultContract() &&
    assertPortEnforcedExecutionContract() &&
    assertNoDirectDbAccess() &&
    assertNoDirectApiBypass() &&
    assertV55ReadOnlyDependency() &&
    assertMountedQuoteExecutionCore();

  return {
    valid,
    summary: [`p1Tag=${WORKSPACE_QUOTE_INTEGRATION_P1_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasExecutionCore(): boolean {
  return assertExecutionCoreContract() && assertMountedQuoteExecutionCore();
}
