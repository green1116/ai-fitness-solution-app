import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertV56IntegrationFrozen } from "@/lib/quote-runtime-integration";
import { WORKSPACE_QUOTE_PRODUCT_P1_TAG } from "../freeze/v57-p1-meta";
import { createQuoteEntry } from "../entry/quote-entry.controller";
import { executeQuoteViaRuntimeClient } from "../integration/quote-runtime.client";
import { loadQuoteWorkspace } from "../workspace/quote-workspace.service";
import { renderQuoteSurface } from "../service/quote-product.service";
import { getQuoteStatusForUI } from "../service/quote-product.orchestrator";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP1Validation {
  valid: boolean;
  summary: string;
}

function getP1ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.mapper.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.model.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.state.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.service.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts"),
    join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p1.ts"),
  ];
}

function getP1ScopedFiles(): string[] {
  return getP1ProductFiles().filter((file) => !file.endsWith("validate-quote-product-p1.ts"));
}

export function assertHasProductLayer(): boolean {
  return existsSync(join(PRODUCT_ROOT, "index.ts")) && existsSync(join(PRODUCT_ROOT, "shared", "quote-product-constants.ts"));
}

export function assertHasWorkspaceUI(): boolean {
  const servicePath = join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts");
  const uiPath = join(PRODUCT_ROOT, "ui", "quote-ui.state.ts");
  const service = readFileSync(servicePath, "utf8");
  const ui = readFileSync(uiPath, "utf8");
  return service.includes("loadQuoteWorkspace") && ui.includes("createInitialQuoteUIState");
}

export function assertHasEntryLayer(): boolean {
  const path = join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteEntry") && content.includes("quote-entry.mapper");
}

export function assertHasProductService(): boolean {
  const path = join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("executeQuoteFromUI") && content.includes("getQuoteStatusForUI");
}

export function assertHasExecutionBridge(): boolean {
  const path = join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("executeQuoteViaRuntimeClient") &&
    content.includes('from "@/lib/quote-runtime-integration"') &&
    content.includes("runQuoteEndToEndFlow")
  );
}

export function assertNoDirectExecutionImport(): boolean {
  const forbidden = [
    /from\s+["']@\/lib\/quote-runtime-integration\/e2e/,
    /from\s+["']@\/lib\/quote-runtime-integration\/services/,
    /from\s+["']@\/lib\/quote-runtime-integration\/workflow/,
    /from\s+["']@\/lib\/quote-runtime-integration\/adapters/,
    /from\s+["']@\/lib\/quote-runtime["']/,
    /from\s+["']@\/lib\/quote-runtime\//,
  ];
  return getP1ScopedFiles().every((file) => !forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

export function assertNoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertNoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteWorkspaceBootstrap(): boolean {
  const workspaceId = "v57-p1-quote-workspace";
  const workspace = loadQuoteWorkspace(workspaceId);
  const entry = createQuoteEntry({ workspaceId, title: "Bootstrap Quote" });
  const surface = renderQuoteSurface(workspaceId);
  const status = getQuoteStatusForUI(workspaceId);

  return (
    workspace.workspaceId === workspaceId &&
    workspace.uiState.quoteStatus === "EMPTY" &&
    workspace.uiState.readiness === "READY" &&
    entry.quoteStatus === "DRAFT" &&
    surface.workspaceId === workspaceId &&
    status.quoteStatus === "EMPTY"
  );
}

export async function assertMountedQuoteRuntimeClientBridge(): Promise<boolean> {
  const result = await executeQuoteViaRuntimeClient("v57-p1-runtime-bridge");
  return result.success && Boolean(result.executionId) && Boolean(result.quoteId);
}

export async function validateQuoteProductP1(): Promise<QuoteProductP1Validation> {
  const mounted = assertMountedQuoteWorkspaceBootstrap();
  const bridge = await assertMountedQuoteRuntimeClientBridge();
  const v56Frozen = assertV56IntegrationFrozen();
  const valid =
    getP1ProductFiles().every((file) => existsSync(file)) &&
    assertHasProductLayer() &&
    assertHasWorkspaceUI() &&
    assertHasEntryLayer() &&
    assertHasProductService() &&
    assertHasExecutionBridge() &&
    assertNoDirectExecutionImport() &&
    assertNoPrismaAccess() &&
    assertNoRepositoryAccess() &&
    mounted &&
    bridge &&
    v56Frozen;

  return {
    valid,
    summary: [`p1Tag=${WORKSPACE_QUOTE_PRODUCT_P1_TAG}`, `valid=${valid}`].join(" "),
  };
}
