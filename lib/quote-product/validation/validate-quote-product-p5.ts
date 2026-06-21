import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP4 } from "./validate-quote-product-p4";
import { WORKSPACE_QUOTE_PRODUCT_P5_TAG } from "../freeze/v57-p5-meta";
import {
  createQuoteUIState,
  mapExecutionResultToUIState,
  mapProductResultToUIState,
} from "../ui/quote-ui-state.mapper";
import { buildQuoteUISurface } from "../ui/quote-ui-surface";
import { buildQuoteViewModel } from "../ui/quote-ui-view.model";
import { computeQuoteReadiness } from "../ui/quote-ui-readiness";
import { buildQuoteLoadingSurface, deriveQuoteLoadingState } from "../ui/quote-ui-loading";
import { buildQuoteErrorSurface } from "../ui/quote-ui-error";
import { mapExecutionResultToQuoteUIState } from "../ui/quote-ui.state";
import type { QuoteProductExecutionView } from "../shared/quote-product-types";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP5Validation {
  valid: boolean;
  summary: string;
}

function getP5ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "ui", "quote-ui-state.mapper.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-view.model.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-readiness.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-loading.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-error.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-surface.ts"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p5.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p5-meta.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p5-final.ts"),
  ];
}

function getP5UiMappingFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "ui", "quote-ui-state.mapper.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-view.model.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-readiness.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-loading.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-error.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui-surface.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.state.ts"),
  ];
}

export function assertHasUIStateP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-state.mapper.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteUIState");
}

export function assertHasUIMapperP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-state.mapper.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("mapProductResultToUIState") && content.includes("mapExecutionResultToUIState");
}

export function assertHasViewModelP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-view.model.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteViewModel") && content.includes("buildQuoteViewModel");
}

export function assertHasReadinessP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-readiness.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("computeQuoteReadiness");
}

export function assertHasLoadingStateP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-loading.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("QuoteLoadingState") &&
    content.includes("IDLE") &&
    content.includes("SUBMITTING") &&
    content.includes("EXECUTING")
  );
}

export function assertHasErrorSurfaceP5(): boolean {
  const path = join(PRODUCT_ROOT, "ui", "quote-ui-error.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteErrorSurface") && content.includes("buildQuoteErrorSurface");
}

export function assertP5NoRuntimeImport(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']|from\s+["']@\/lib\/quote-runtime["']|from\s+["']@\/lib\/quote-runtime\//;
  return getP5UiMappingFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoExecutionLogic(): boolean {
  const pattern =
    /executeQuoteRuntime|orchestrateQuoteExecution|dispatchQuoteProductExecution|runQuoteEndToEndFlow|executeQuoteViaRuntimeClient|submitQuoteEntry|submitQuoteToProductService/;
  return getP5UiMappingFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP5UiMappingFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP5UiMappingFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteUIStateMapping(): boolean {
  const workspaceId = "v57-p5-ui-state";
  const state = createQuoteUIState(workspaceId);
  const readiness = computeQuoteReadiness({ quoteStatus: "DRAFT" });
  const loading = deriveQuoteLoadingState({ quoteStatus: "RUNNING" });
  const error = buildQuoteErrorSurface({ message: "probe", code: "PROBE" });
  const loadingSurface = buildQuoteLoadingSurface("SUBMITTING");

  return (
    state.quoteStatus === "EMPTY" &&
    readiness === "READY" &&
    loading === "EXECUTING" &&
    Boolean(error?.visible) &&
    loadingSurface.loading === "SUBMITTING"
  );
}

export function assertMountedQuoteUIStateBridge(): boolean {
  const workspaceId = "v57-p5-ui-bridge";
  const productState = mapProductResultToUIState(workspaceId, {
    success: true,
    status: "DONE",
    executionId: "exec-p5",
  });
  const execution: QuoteProductExecutionView = {
    workspaceId,
    success: true,
    executionId: "exec-p5-view",
    quoteStatus: "DONE",
    readiness: "READY",
    logs: [],
  };
  const executionState = mapExecutionResultToUIState(execution);
  const compatState = mapExecutionResultToQuoteUIState(execution);
  const viewModel = buildQuoteViewModel(productState);
  const surface = buildQuoteUISurface(productState, { title: "Quote UI Surface" });

  return (
    productState.quoteStatus === "DONE" &&
    executionState.readiness === "READY" &&
    compatState.quoteStatus === "DONE" &&
    viewModel.loading === "IDLE" &&
    surface.viewModel.workspaceId === workspaceId &&
    surface.sections.some((section) => section.key === "audit" && section.visible)
  );
}

export async function validateQuoteProductP5(): Promise<QuoteProductP5Validation> {
  const p4 = await validateQuoteProductP4();
  const mounted = assertMountedQuoteUIStateMapping();
  const bridged = assertMountedQuoteUIStateBridge();
  const valid =
    p4.valid &&
    getP5ProductFiles().every((file) => existsSync(file)) &&
    assertHasUIStateP5() &&
    assertHasUIMapperP5() &&
    assertHasViewModelP5() &&
    assertHasReadinessP5() &&
    assertHasLoadingStateP5() &&
    assertHasErrorSurfaceP5() &&
    assertP5NoRuntimeImport() &&
    assertP5NoExecutionLogic() &&
    assertP5NoPrismaAccess() &&
    assertP5NoRepositoryAccess() &&
    mounted &&
    bridged;

  return {
    valid,
    summary: [`p5Tag=${WORKSPACE_QUOTE_PRODUCT_P5_TAG}`, `valid=${valid}`].join(" "),
  };
}
