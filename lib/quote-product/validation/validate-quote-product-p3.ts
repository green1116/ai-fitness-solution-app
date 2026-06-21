import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP2 } from "./validate-quote-product-p2";
import { WORKSPACE_QUOTE_PRODUCT_P3_TAG } from "../freeze/v57-p3-meta";
import {
  buildQuoteProductSurface,
  createQuoteProductContext,
  mapProductResultToEntryState,
  resolveQuoteWorkspaceContext,
  submitQuoteToProductService,
} from "../service/quote-product.service";
import {
  orchestrateQuoteExecution,
} from "../service/quote-product.orchestrator";
import { resolveQuoteWorkspace } from "../workspace/quote-workspace.resolver";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP3Validation {
  valid: boolean;
  summary: string;
}

function getP3ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "service", "quote-product.service.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.types.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.validation.ts"),
    join(PRODUCT_ROOT, "service", "quote-product-result.mapper.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.execution.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.types.ts"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p3.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p3-meta.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p3-final.ts"),
  ];
}

function getP3ServiceFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "service", "quote-product.service.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.types.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.validation.ts"),
    join(PRODUCT_ROOT, "service", "quote-product-result.mapper.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.execution.ts"),
  ];
}

function getP3ScopedFiles(): string[] {
  return [
    ...getP3ServiceFiles(),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.types.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts"),
  ];
}

export function assertHasProductServiceP3(): boolean {
  const path = join(PRODUCT_ROOT, "service", "quote-product.service.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteProductContext") &&
    content.includes("submitQuoteToProductService") &&
    content.includes("buildQuoteProductSurface") &&
    content.includes("mapProductResultToEntryState")
  );
}

export function assertHasProductOrchestratorP3(): boolean {
  const path = join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("orchestrateQuoteExecution") && content.includes("executeQuoteFromUI");
}

export function assertHasWorkspaceResolverP3(): boolean {
  const resolverPath = join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts");
  const servicePath = join(PRODUCT_ROOT, "service", "quote-product.service.ts");
  const resolver = readFileSync(resolverPath, "utf8");
  const service = readFileSync(servicePath, "utf8");
  return resolver.includes("resolveQuoteWorkspace") && service.includes("resolveQuoteWorkspaceContext");
}

export function assertHasRuntimeClientOnlyP3(): boolean {
  const bridgePath = join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts");
  const bridge = readFileSync(bridgePath, "utf8");
  const bridgeOk =
    bridge.includes("executeQuoteViaRuntimeClient") &&
    bridge.includes('from "@/lib/quote-runtime-integration"') &&
    bridge.includes("runQuoteEndToEndFlow");

  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']/;
  const scopedOk = getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));

  const executionPath = join(PRODUCT_ROOT, "service", "quote-product.execution.ts");
  const execution = readFileSync(executionPath, "utf8");
  const executionOk =
    execution.includes("executeQuoteRuntime") &&
    !execution.includes('from "@/lib/quote-runtime-integration"') &&
    !execution.includes('from "../integration/quote-runtime.client"');

  return bridgeOk && scopedOk && executionOk;
}

export function assertP3NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoDirectExecutionImport(): boolean {
  const forbidden = [
    /from\s+["']@\/lib\/quote-runtime-integration\/e2e/,
    /from\s+["']@\/lib\/quote-runtime-integration\/services/,
    /from\s+["']@\/lib\/quote-runtime-integration\/workflow/,
    /from\s+["']@\/lib\/quote-runtime-integration\/adapters/,
    /from\s+["']@\/lib\/quote-runtime["']/,
    /from\s+["']@\/lib\/quote-runtime\//,
  ];
  return getP3ScopedFiles().every((file) => !forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

export function assertP3NoUILogicInService(): boolean {
  const uiPattern = /from\s+["']\.\.\/ui\/|from\s+["']@\/lib\/quote-product\/ui\/|mapExecutionResultToQuoteUIState|createInitialQuoteUIState|markQuoteUIStateDraft/;
  return getP3ServiceFiles().every((file) => !uiPattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoRuntimeLayerMix(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']/;
  const bridgePath = join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts");
  return getP3ScopedFiles()
    .filter((file) => file !== bridgePath)
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteProductServiceLayer(): boolean {
  const workspaceId = "v57-p3-quote-product";
  const resolved = resolveQuoteWorkspace({ workspaceId });
  const context = createQuoteProductContext(resolved);
  const surface = buildQuoteProductSurface(workspaceId);

  return (
    resolved.workspaceId === workspaceId &&
    context.workspaceId === workspaceId &&
    surface.context.workspaceId === workspaceId &&
    surface.productStatus === "IDLE" &&
    resolveQuoteWorkspaceContext({ workspaceId }).portalRoute.includes(workspaceId)
  );
}

export async function assertMountedQuoteProductOrchestration(): Promise<boolean> {
  const workspaceId = "v57-p3-quote-orchestrate";
  const context = createQuoteProductContext({ workspaceId });
  const orchestrated = await orchestrateQuoteExecution(context);
  const submitted = await submitQuoteToProductService({ context, title: "Product Service Quote" });
  const entryState = mapProductResultToEntryState(workspaceId, orchestrated);

  return (
    orchestrated.success &&
    Boolean(orchestrated.executionId) &&
    submitted.result.success &&
    submitted.result.status === "DONE" &&
    entryState.quoteStatus === "DONE"
  );
}

export async function validateQuoteProductP3(): Promise<QuoteProductP3Validation> {
  const p2 = await validateQuoteProductP2();
  const mounted = assertMountedQuoteProductServiceLayer();
  const orchestrated = await assertMountedQuoteProductOrchestration();
  const valid =
    p2.valid &&
    getP3ProductFiles().every((file) => existsSync(file)) &&
    assertHasProductServiceP3() &&
    assertHasProductOrchestratorP3() &&
    assertHasWorkspaceResolverP3() &&
    assertHasRuntimeClientOnlyP3() &&
    assertP3NoPrismaAccess() &&
    assertP3NoRepositoryAccess() &&
    assertP3NoDirectExecutionImport() &&
    assertP3NoUILogicInService() &&
    assertP3NoRuntimeLayerMix() &&
    mounted &&
    orchestrated;

  return {
    valid,
    summary: [`p3Tag=${WORKSPACE_QUOTE_PRODUCT_P3_TAG}`, `valid=${valid}`].join(" "),
  };
}
