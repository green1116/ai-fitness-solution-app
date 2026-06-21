import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP5 } from "./validate-quote-product-p5";
import { WORKSPACE_QUOTE_PRODUCT_P6_TAG } from "../freeze/v57-p6-meta";
import {
  bindQuoteProductActions,
} from "../surface/quote-product.actions";
import {
  refreshQuoteProductSurfaceAction,
  submitQuoteProductSurfaceAction,
} from "../surface/quote-product.actions.server";
import { createQuoteSurfaceLoader, loadQuoteProductSurface } from "../surface/quote-product.loader";
import {
  buildQuoteProductSurface,
  type QuoteProductSurfaceData,
} from "../surface/quote-product.surface";
import { buildQuoteProductState } from "../surface/quote-product.state";
import { buildQuoteProductViewModel } from "../surface/quote-product.viewmodel";
import { buildQuoteWorkspaceSurface } from "../workspace/quote-workspace.surface";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP6Validation {
  valid: boolean;
  summary: string;
}

function getP6ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "surface", "quote-product.surface.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.loader.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.viewmodel.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.state.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.actions.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.actions.server.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.surface.ts"),
    join(PRODUCT_ROOT, "portal", "quote-product-page.tsx"),
    join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p6.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p6-meta.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p6-final.ts"),
  ];
}

function getP6PortalFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "portal", "quote-product-page.tsx"),
    join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx"),
  ];
}

function getP6BoundaryFiles(): string[] {
  return [
    ...getP6PortalFiles(),
    join(PRODUCT_ROOT, "surface", "quote-product.surface.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.loader.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.viewmodel.ts"),
    join(PRODUCT_ROOT, "surface", "quote-product.state.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.surface.ts"),
  ];
}

export function assertHasProductSurfaceP6(): boolean {
  const path = join(PRODUCT_ROOT, "surface", "quote-product.surface.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("interface QuoteProductSurface") &&
    content.includes("buildQuoteProductSurface") &&
    content.includes("loadQuoteProductSurface")
  );
}

export function assertHasSurfaceLoaderP6(): boolean {
  const path = join(PRODUCT_ROOT, "surface", "quote-product.loader.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteSurfaceLoader") && content.includes("loadQuoteProductSurface");
}

export function assertHasSurfaceViewModelP6(): boolean {
  const path = join(PRODUCT_ROOT, "surface", "quote-product.viewmodel.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("buildQuoteProductViewModel");
}

export function assertHasSurfaceStateP6(): boolean {
  const path = join(PRODUCT_ROOT, "surface", "quote-product.state.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("buildQuoteProductState");
}

export function assertHasSurfaceActionsP6(): boolean {
  const actionsPath = join(PRODUCT_ROOT, "surface", "quote-product.actions.ts");
  const serverPath = join(PRODUCT_ROOT, "surface", "quote-product.actions.server.ts");
  const actions = readFileSync(actionsPath, "utf8");
  const server = readFileSync(serverPath, "utf8");
  return (
    actions.includes("bindQuoteProductActions") &&
    server.includes("submitQuoteProductSurfaceAction") &&
    server.includes("refreshQuoteProductSurfaceAction")
  );
}

export function assertHasWorkspaceSurfaceP6(): boolean {
  const path = join(PRODUCT_ROOT, "workspace", "quote-workspace.surface.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("buildQuoteWorkspaceSurface") && content.includes("interface QuoteWorkspaceSurface");
}

export function assertHasPortalSurfaceP6(): boolean {
  const pagePath = join(PRODUCT_ROOT, "portal", "quote-product-page.tsx");
  const loaderPath = join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx");
  const page = readFileSync(pagePath, "utf8");
  const loader = readFileSync(loaderPath, "utf8");
  const appPagePath = join(process.cwd(), "app", "saas-product", "workspaces", "[id]", "quotes", "page.tsx");
  const appPage = existsSync(appPagePath) ? readFileSync(appPagePath, "utf8") : "";

  return (
    page.includes("QuoteProductPage") &&
    page.includes("bindQuoteProductActions") &&
    loader.includes("QuoteProductPageLoader") &&
    loader.includes("createQuoteSurfaceLoader") &&
    appPage.includes("QuoteProductPageLoader")
  );
}

export function assertPortalDoesNotBypassSurfaceP6(): boolean {
  const pagePath = join(PRODUCT_ROOT, "portal", "quote-product-page.tsx");
  const content = readFileSync(pagePath, "utf8");
  const forbidden = [
    /from\s+["']\.\.\/entry\//,
    /from\s+["']@\/lib\/quote-product\/entry\//,
    /from\s+["']\.\.\/service\//,
    /from\s+["']@\/lib\/quote-product\/service\//,
    /from\s+["']\.\.\/execution\//,
    /from\s+["']@\/lib\/quote-product\/execution\//,
    /submitQuoteEntry\b/,
    /executeQuoteFromUI\b/,
    /executeQuoteRuntime\b/,
  ];
  return forbidden.every((pattern) => !pattern.test(content));
}

export function assertP6NoRuntimeImport(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']|from\s+["']@\/lib\/quote-runtime["']|from\s+["']@\/lib\/quote-runtime\//;
  return getP6BoundaryFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP6NoExecutionLogic(): boolean {
  const pattern =
    /executeQuoteRuntime|orchestrateQuoteExecution|dispatchQuoteProductExecution|runQuoteEndToEndFlow|executeQuoteViaRuntimeClient/;
  return getP6BoundaryFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP6NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP6BoundaryFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP6NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP6BoundaryFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteProductSurfaceAssembly(): boolean {
  const workspaceId = "v57-p6-product-surface";
  const surface: QuoteProductSurfaceData = loadQuoteProductSurface(workspaceId);
  const loader = createQuoteSurfaceLoader({ workspaceId });
  const state = buildQuoteProductState(workspaceId);
  const viewModel = buildQuoteProductViewModel(workspaceId, state);
  const workspaceSurface = buildQuoteWorkspaceSurface(workspaceId);

  return (
    surface.workspaceId === workspaceId &&
    surface.state.quoteStatus === "DRAFT" &&
    surface.viewModel.readiness === "READY" &&
    loader.workspaceId === workspaceId &&
    viewModel.workspaceId === workspaceId &&
    workspaceSurface.portalRoute.includes(workspaceId)
  );
}

export async function assertMountedQuoteProductSurfaceActions(): Promise<boolean> {
  const workspaceId = "v57-p6-product-submit";
  const refreshed = await refreshQuoteProductSurfaceAction(workspaceId);
  const submitted = await submitQuoteProductSurfaceAction({
    workspaceId,
    title: "Assembled Quote Surface",
  });
  const actions = bindQuoteProductActions(workspaceId, {
    submitAction: submitQuoteProductSurfaceAction,
    refreshAction: refreshQuoteProductSurfaceAction,
    onStateChange: () => undefined,
  });

  return (
    refreshed.state.quoteStatus === "DRAFT" &&
    submitted.state.quoteStatus === "DONE" &&
    Boolean(submitted.state.lastExecutionId) &&
    typeof actions.submit === "function" &&
    typeof actions.refresh === "function"
  );
}

export async function validateQuoteProductP6(): Promise<QuoteProductP6Validation> {
  const p5 = await validateQuoteProductP5();
  const mounted = assertMountedQuoteProductSurfaceAssembly();
  const actionsMounted = await assertMountedQuoteProductSurfaceActions();
  const valid =
    p5.valid &&
    getP6ProductFiles().every((file) => existsSync(file)) &&
    assertHasProductSurfaceP6() &&
    assertHasSurfaceLoaderP6() &&
    assertHasSurfaceViewModelP6() &&
    assertHasSurfaceStateP6() &&
    assertHasSurfaceActionsP6() &&
    assertHasWorkspaceSurfaceP6() &&
    assertHasPortalSurfaceP6() &&
    assertPortalDoesNotBypassSurfaceP6() &&
    assertP6NoRuntimeImport() &&
    assertP6NoExecutionLogic() &&
    assertP6NoPrismaAccess() &&
    assertP6NoRepositoryAccess() &&
    mounted &&
    actionsMounted;

  return {
    valid,
    summary: [`p6Tag=${WORKSPACE_QUOTE_PRODUCT_P6_TAG}`, `valid=${valid}`].join(" "),
  };
}
