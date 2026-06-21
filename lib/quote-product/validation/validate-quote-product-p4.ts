import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP3 } from "./validate-quote-product-p3";
import { WORKSPACE_QUOTE_PRODUCT_P4_TAG } from "../freeze/v57-p4-meta";
import {
  buildExecutionClient,
  createExecutionRequest,
  executeQuoteRuntime,
  normalizeExecutionError,
  validateExecutionRequest,
} from "../execution/quote-execution.client";
import { createExecutionRequestFromProductContext } from "../execution/quote-execution.adapter";
import { mapRuntimeResult } from "../execution/quote-execution.mapper";
import { dispatchQuoteProductExecution } from "../service/quote-product.execution";
import { createQuoteProductContext } from "../service/quote-product.service";
import type { QuoteExecutionError, QuoteExecutionRequest, QuoteExecutionResponse } from "../execution/quote-execution.types";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP4Validation {
  valid: boolean;
  summary: string;
}

function getP4ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "execution", "quote-execution.types.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.mapper.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.error.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.client.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.adapter.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.validation.ts"),
    join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p4.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p4-meta.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p4-final.ts"),
  ];
}

function getP4ExecutionFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "execution", "quote-execution.types.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.mapper.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.error.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.client.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.adapter.ts"),
    join(PRODUCT_ROOT, "execution", "quote-execution.validation.ts"),
  ];
}

function getP4ScopedFiles(): string[] {
  return [
    ...getP4ExecutionFiles(),
    join(PRODUCT_ROOT, "service", "quote-product.execution.ts"),
    join(PRODUCT_ROOT, "service", "quote-product-result.mapper.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.service.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts"),
  ];
}

export function assertHasExecutionClientP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.client.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("executeQuoteRuntime") && content.includes("buildExecutionClient");
}

export function assertHasExecutionAdapterP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.adapter.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("adaptExecutionRequestToRuntimeClient") &&
    content.includes("createExecutionRequestFromProductContext")
  );
}

export function assertHasExecutionRequestP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteExecutionRequest");
}

export function assertHasExecutionResponseP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteExecutionResponse");
}

export function assertHasExecutionErrorP4(): boolean {
  const typesPath = join(PRODUCT_ROOT, "execution", "quote-execution.types.ts");
  const errorPath = join(PRODUCT_ROOT, "execution", "quote-execution.error.ts");
  const types = readFileSync(typesPath, "utf8");
  const error = readFileSync(errorPath, "utf8");
  return types.includes("interface QuoteExecutionError") && error.includes("normalizeExecutionError");
}

export function assertHasExecutionMapperP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.mapper.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("mapRuntimeResult") && content.includes("mapExecutionResponseToProductResult");
}

export function assertHasExecutionValidationP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.validation.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createExecutionRequest") &&
    content.includes("validateExecutionRequest") &&
    content.includes("assertExecutionRequest")
  );
}

export function assertP4NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoDirectRuntimeImport(): boolean {
  const forbidden = [
    /from\s+["']@\/lib\/quote-runtime-integration\/e2e/,
    /from\s+["']@\/lib\/quote-runtime-integration\/services/,
    /from\s+["']@\/lib\/quote-runtime-integration\/workflow/,
    /from\s+["']@\/lib\/quote-runtime-integration\/adapters/,
    /from\s+["']@\/lib\/quote-runtime["']/,
    /from\s+["']@\/lib\/quote-runtime\//,
  ];
  return getP4ScopedFiles().every((file) => !forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

export function assertP4NoUILogicInExecution(): boolean {
  const uiPattern =
    /from\s+["']\.\.\/ui\/|from\s+["']@\/lib\/quote-product\/ui\/|mapExecutionResultToQuoteUIState|createInitialQuoteUIState|markQuoteUIStateDraft|quote-ui\.model|quote-ui\.state/;
  return getP4ExecutionFiles().every((file) => !uiPattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoRuntimeLayerMix(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']/;
  const bridgePath = join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts");
  return getP4ScopedFiles()
    .filter((file) => file !== bridgePath)
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertProductExecutionRoutesThroughClientP4(): boolean {
  const path = join(PRODUCT_ROOT, "service", "quote-product.execution.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("executeQuoteRuntime") &&
    !content.includes('from "../integration/quote-runtime.client"') &&
    !content.includes('from "@/lib/quote-runtime-integration"')
  );
}

export function assertMountedQuoteExecutionClientLayer(): boolean {
  const request: QuoteExecutionRequest = createExecutionRequest({
    workspaceId: "v57-p4-execution-client",
  });
  const client = buildExecutionClient();
  const normalized = normalizeExecutionError(new Error("probe"), "QUOTE_EXECUTION_PROBE");

  return (
    validateExecutionRequest(request) &&
    request.executionMode === "SYNC" &&
    client.execute !== undefined &&
    normalized.code === "QUOTE_EXECUTION_PROBE"
  );
}

export async function assertMountedQuoteExecutionRuntimeBridge(): Promise<boolean> {
  const workspaceId = "v57-p4-execution-runtime";
  const request = createExecutionRequest({ workspaceId });
  const response: QuoteExecutionResponse = await executeQuoteRuntime(request);
  const mapped = mapRuntimeResult({
    workspaceId,
    success: response.success,
    quoteId: response.quoteId,
    executionId: response.executionId,
    logs: response.logs ?? [],
  });
  const context = createQuoteProductContext({ workspaceId });
  const productResult = await dispatchQuoteProductExecution(context);
  const adapted = createExecutionRequestFromProductContext(context);

  return (
    response.success &&
    Boolean(response.executionId) &&
    mapped.status === "DONE" &&
    productResult.success &&
    adapted.workspaceId === workspaceId
  );
}

export async function validateQuoteProductP4(): Promise<QuoteProductP4Validation> {
  const p3 = await validateQuoteProductP3();
  const mounted = assertMountedQuoteExecutionClientLayer();
  const bridged = await assertMountedQuoteExecutionRuntimeBridge();
  const valid =
    p3.valid &&
    getP4ProductFiles().every((file) => existsSync(file)) &&
    assertHasExecutionClientP4() &&
    assertHasExecutionAdapterP4() &&
    assertHasExecutionRequestP4() &&
    assertHasExecutionResponseP4() &&
    assertHasExecutionErrorP4() &&
    assertHasExecutionMapperP4() &&
    assertHasExecutionValidationP4() &&
    assertP4NoPrismaAccess() &&
    assertP4NoRepositoryAccess() &&
    assertP4NoDirectRuntimeImport() &&
    assertP4NoUILogicInExecution() &&
    assertP4NoRuntimeLayerMix() &&
    assertProductExecutionRoutesThroughClientP4() &&
    mounted &&
    bridged;

  return {
    valid,
    summary: [`p4Tag=${WORKSPACE_QUOTE_PRODUCT_P4_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasExecutionErrorTypeP4(): boolean {
  const path = join(PRODUCT_ROOT, "execution", "quote-execution.types.ts");
  const content = readFileSync(path, "utf8");
  const error: QuoteExecutionError = {
    code: "PROBE",
    message: "probe",
    retryable: false,
  };
  return content.includes("interface QuoteExecutionError") && error.code === "PROBE";
}
