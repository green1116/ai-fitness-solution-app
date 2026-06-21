import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import { createQuoteExecution } from "../services/quote-execution.service";
import { createQuotePortStubBundle } from "../ports/quote-port-resolver";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import {
  createQuoteApiAdapter,
  createQuoteApiBindingFromV51,
} from "../adapters/api";
import { WORKSPACE_QUOTE_INTEGRATION_P4_TAG } from "../freeze/v56-p4-meta";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationP4Validation {
  valid: boolean;
  summary: string;
}

function getP4AdapterFiles(): string[] {
  return [
    join(INTEGRATION_ROOT, "adapters", "api", "quote-api.adapter.ts"),
    join(INTEGRATION_ROOT, "adapters", "api", "quote-api-binding.ts"),
    join(INTEGRATION_ROOT, "adapters", "api", "quote-api-mapper.ts"),
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

export function assertApiAdapterContract(): boolean {
  const path = join(INTEGRATION_ROOT, "adapters", "api", "quote-api.adapter.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteApiAdapter") &&
    content.includes("getQuoteSurface") &&
    content.includes("getQuoteReadiness") &&
    content.includes("exposeQuoteApi")
  );
}

export function assertApiBindingContract(): boolean {
  const path = join(INTEGRATION_ROOT, "adapters", "api", "quote-api-binding.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteApiBinding") &&
    content.includes("QuoteApiExposureService") &&
    content.includes("createQuoteApiExposureServiceFromV51")
  );
}

export function assertPortEnforcedApiContract(): boolean {
  return getExecutionLayerFiles().every((file) => {
    const content = readFileSync(file, "utf8");
    return (
      !content.includes("adapters/api") &&
      !content.includes("saas-product-api/handlers") &&
      !content.includes("withApiContext")
    );
  });
}

export function assertP4NoDirectApiHandler(): boolean {
  const handlerPattern = /from\s+["']@\/lib\/saas-product-api\/handlers|handlers\/quote-handlers|handleCreateQuote|handleListQuotes/;
  return (
    getExecutionLayerFiles().every((file) => !handlerPattern.test(readFileSync(file, "utf8"))) &&
    getP4AdapterFiles().every((file) => !handlerPattern.test(readFileSync(file, "utf8")))
  );
}

export function assertP4NoDirectRouteAccess(): boolean {
  const routePattern = /from\s+["']@\/app\/api|app\/api\/saas-product/;
  return getExecutionLayerFiles().every((file) => !routePattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoWorkflowExecution(): boolean {
  const pattern = /executeWorkflow\s*\(|WorkflowEngine|workflowEngine|handleTransitionWorkflow|transitionWorkflow/;
  return getP4AdapterFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertAdapterUsesV51ExposureNotHandlers(): boolean {
  const bindingPath = join(INTEGRATION_ROOT, "adapters", "api", "quote-api-binding.ts");
  const content = readFileSync(bindingPath, "utf8");
  return (
    content.includes("saas-product-api") &&
    content.includes("V51_API_ROUTE_MAP") &&
    !content.includes("/handlers/")
  );
}

export function assertMountedQuoteApiAdapter(): boolean {
  const workspaceId = "v56-p4-api-adapter";
  const binding = createQuoteApiBindingFromV51({ tenantId: "tenant-v56-p4" });
  const adapter = createQuoteApiAdapter({ binding });
  const foundation = loadV55QuoteRuntimeSnapshot(workspaceId);

  const surface = adapter.getQuoteSurface(workspaceId) as {
    workspaceId: string;
    quoteReadiness: string;
    exposureLayer: string;
  };
  const readiness = adapter.getQuoteReadiness(workspaceId);
  const exposure = adapter.exposeQuoteApi(workspaceId);

  const stubBundle = createQuotePortStubBundle(foundation.snapshot);
  const ports = createQuotePortRegistry({
    persistence: stubBundle.persistence,
    api: adapter,
    commercial: stubBundle.commercial,
  });
  const execution = createQuoteExecution({
    workspaceId,
    snapshot: foundation.snapshot,
    ports,
  });

  return (
    surface.workspaceId === workspaceId &&
    surface.exposureLayer === "v51-api-exposure" &&
    readiness === foundation.snapshot.quoteReadiness &&
    exposure.exposed &&
    exposure.route.includes(workspaceId) &&
    exposure.route.includes("/quotes") &&
    execution.success
  );
}

export async function validateQuoteIntegrationP4(): Promise<QuoteIntegrationP4Validation> {
  const valid =
    existsSync(join(INTEGRATION_ROOT, "adapters", "api", "quote-api.adapter.ts")) &&
    assertApiAdapterContract() &&
    assertApiBindingContract() &&
    assertPortEnforcedApiContract() &&
    assertP4NoDirectApiHandler() &&
    assertP4NoDirectRouteAccess() &&
    assertP4NoWorkflowExecution() &&
    assertAdapterUsesV51ExposureNotHandlers() &&
    getP4AdapterFiles().every((file) => existsSync(file)) &&
    assertMountedQuoteApiAdapter();

  return {
    valid,
    summary: [`p4Tag=${WORKSPACE_QUOTE_INTEGRATION_P4_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasApiAdapter(): boolean {
  return assertApiAdapterContract() && assertMountedQuoteApiAdapter();
}
