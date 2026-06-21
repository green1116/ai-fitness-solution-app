import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP1 } from "./validate-quote-product-p1";
import { WORKSPACE_QUOTE_PRODUCT_P2_TAG } from "../freeze/v57-p2-meta";
import {
  buildQuoteEntrySurface,
  createQuoteEntry,
  loadQuoteEntryWorkspace,
  submitQuoteEntry,
} from "../entry/quote-entry.controller";
import { mapQuoteEntryToUIState } from "../entry/quote-entry.mapper";
import { mapExecutionResultToQuoteUIState } from "../ui/quote-ui.state";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP2Validation {
  valid: boolean;
  summary: string;
}

function getP2ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.mapper.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.validation.ts"),
    join(PRODUCT_ROOT, "entry", "quote-entry.types.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.actions.ts"),
    join(PRODUCT_ROOT, "portal", "quote-entry-portal-page.tsx"),
    join(PRODUCT_ROOT, "portal", "quote-entry-portal-loader.tsx"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p2.ts"),
  ];
}

function getP2ScopedFiles(): string[] {
  return [
    ...getP2ProductFiles().filter((file) => !file.endsWith("validate-quote-product-p2.ts")),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts"),
    join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.model.ts"),
    join(PRODUCT_ROOT, "ui", "quote-ui.state.ts"),
  ];
}

export function assertHasEntryController(): boolean {
  const path = join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("createQuoteEntry") &&
    content.includes("submitQuoteEntry") &&
    content.includes("buildQuoteEntrySurface") &&
    content.includes("loadQuoteEntryWorkspace")
  );
}

export function assertHasEntryMapper(): boolean {
  const path = join(PRODUCT_ROOT, "entry", "quote-entry.mapper.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("mapQuoteEntryToUIState") &&
    content.includes("mapExecutionResultToEntryUIState")
  );
}

export function assertHasEntryUIState(): boolean {
  const modelPath = join(PRODUCT_ROOT, "ui", "quote-ui.model.ts");
  const statePath = join(PRODUCT_ROOT, "ui", "quote-ui.state.ts");
  const model = readFileSync(modelPath, "utf8");
  const state = readFileSync(statePath, "utf8");
  return model.includes("lastError") && state.includes("mapExecutionResultToQuoteUIState");
}

export function assertHasEntryValidationModule(): boolean {
  const path = join(PRODUCT_ROOT, "entry", "quote-entry.validation.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("validateQuoteEntryRequest") &&
    content.includes("validateQuoteEntrySubmission") &&
    content.includes("assertQuoteEntrySubmission")
  );
}

export function assertP2NoRuntimeLayerMix(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration/;
  const bridgePath = join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts");
  return getP2ScopedFiles()
    .filter((file) => file !== bridgePath)
    .every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoDirectExecutionImport(): boolean {
  const forbidden = [
    /from\s+["']@\/lib\/quote-runtime-integration\/e2e/,
    /from\s+["']@\/lib\/quote-runtime-integration\/services/,
    /from\s+["']@\/lib\/quote-runtime-integration\/workflow/,
    /from\s+["']@\/lib\/quote-runtime-integration\/adapters/,
    /from\s+["']@\/lib\/quote-runtime["']/,
    /from\s+["']@\/lib\/quote-runtime\//,
  ];
  return getP2ScopedFiles().every((file) => !forbidden.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
}

export function assertMountedQuoteEntryLayer(): boolean {
  const workspaceId = "v57-p2-quote-entry";
  const workspace = loadQuoteEntryWorkspace(workspaceId);
  const surface = buildQuoteEntrySurface(workspaceId);
  const entry = createQuoteEntry({ workspaceId, title: "Portal Entry" });
  const uiState = mapQuoteEntryToUIState(entry);

  return (
    workspace.entry.entryId === entry.entryId &&
    surface.form.submitLabel.length > 0 &&
    uiState.quoteStatus === "DRAFT" &&
    surface.uiState.readiness === "READY"
  );
}

export async function assertMountedQuoteEntrySubmission(): Promise<boolean> {
  const workspaceId = "v57-p2-quote-submit";
  const result = await submitQuoteEntry({
    workspaceId,
    title: "Submitted Quote",
    submit: true,
  });
  const mapped = mapExecutionResultToQuoteUIState(result.execution);

  return (
    result.execution.success &&
    Boolean(result.execution.executionId) &&
    result.uiState.quoteStatus === "DONE" &&
    mapped.quoteStatus === "DONE" &&
    mapped.readiness === "READY"
  );
}

export async function validateQuoteProductP2(): Promise<QuoteProductP2Validation> {
  const p1 = await validateQuoteProductP1();
  const mounted = assertMountedQuoteEntryLayer();
  const submitted = await assertMountedQuoteEntrySubmission();
  const valid =
    p1.valid &&
    getP2ProductFiles().every((file) => existsSync(file)) &&
    assertHasEntryController() &&
    assertHasEntryMapper() &&
    assertHasEntryUIState() &&
    assertHasEntryValidationModule() &&
    assertP2NoPrismaAccess() &&
    assertP2NoRepositoryAccess() &&
    assertP2NoDirectExecutionImport() &&
    assertP2NoRuntimeLayerMix() &&
    mounted &&
    submitted;

  return {
    valid,
    summary: [`p2Tag=${WORKSPACE_QUOTE_PRODUCT_P2_TAG}`, `valid=${valid}`].join(" "),
  };
}

export function assertHasEntryLayerP2(): boolean {
  return assertHasEntryController() && assertHasEntryMapper() && assertHasEntryValidationModule();
}
