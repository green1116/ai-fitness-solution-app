import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  V55_FOUNDATION_FROZEN,
  V55_QUOTE_RUNTIME_FINAL_FREEZE,
} from "../freeze/v55-final";
import { WORKSPACE_QUOTE_RUNTIME_FINAL_META } from "../freeze/v55-final-meta";
import { assertV55FoundationIntegrityLocked } from "./quote-runtime-integrity";
import { assertWorkspaceQuoteSurfaceAlignedForSnapshot } from "./quote-runtime-verify-p8";
import { validateQuoteRuntimeP1 } from "./quote-runtime-verify";
import { validateQuoteRuntimeP2 } from "./quote-runtime-verify-p2";
import { validateQuoteRuntimeP3 } from "./quote-runtime-verify-p3";
import { validateQuoteRuntimeP4 } from "./quote-runtime-verify-p4";
import { validateQuoteRuntimeP5 } from "./quote-runtime-verify-p5";
import { validateQuoteRuntimeP6 } from "./quote-runtime-verify-p6";
import { validateQuoteRuntimeP7 } from "./quote-runtime-verify-p7";
import { validateQuoteRuntimeP8 } from "./quote-runtime-verify-p8";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");

export interface QuoteRuntimeFinalValidation {
  valid: boolean;
  summary: string;
}

export function assertV55FoundationFrozen(): boolean {
  const metaPath = join(QUOTE_ROOT, "freeze", "v55-final-meta.ts");
  const finalPath = join(QUOTE_ROOT, "freeze", "v55-final.ts");
  if (!existsSync(metaPath) || !existsSync(finalPath)) {
    return false;
  }
  return (
    WORKSPACE_QUOTE_RUNTIME_FINAL_META.state === "FROZEN" &&
    WORKSPACE_QUOTE_RUNTIME_FINAL_META.frozen === true &&
    WORKSPACE_QUOTE_RUNTIME_FINAL_META.foundationFrozen === V55_FOUNDATION_FROZEN &&
    V55_QUOTE_RUNTIME_FINAL_FREEZE.state === "FROZEN" &&
    V55_QUOTE_RUNTIME_FINAL_FREEZE.frozen === true &&
    V55_QUOTE_RUNTIME_FINAL_FREEZE.foundationFrozen === V55_FOUNDATION_FROZEN &&
    V55_QUOTE_RUNTIME_FINAL_FREEZE.layers === 8 &&
    V55_QUOTE_RUNTIME_FINAL_FREEZE.phaseTags.length === 8 &&
    WORKSPACE_QUOTE_RUNTIME_FINAL_META.layers === 8 &&
    WORKSPACE_QUOTE_RUNTIME_FINAL_META.phaseTags.length === 8
  );
}

export async function validateQuoteRuntimeFinal(): Promise<QuoteRuntimeFinalValidation> {
  const p1 = await validateQuoteRuntimeP1();
  const p2 = await validateQuoteRuntimeP2();
  const p3 = await validateQuoteRuntimeP3();
  const p4 = await validateQuoteRuntimeP4();
  const p5 = await validateQuoteRuntimeP5();
  const p6 = await validateQuoteRuntimeP6();
  const p7 = await validateQuoteRuntimeP7();
  const p8 = await validateQuoteRuntimeP8();

  const valid =
    p1.valid &&
    p2.valid &&
    p3.valid &&
    p4.valid &&
    p5.valid &&
    p6.valid &&
    p7.valid &&
    p8.valid &&
    assertV55FoundationFrozen() &&
    assertV55FoundationIntegrityLocked() &&
    assertWorkspaceQuoteSurfaceAlignedForSnapshot("v55-final-quote");

  return {
    valid,
    summary: [
      `foundationFrozen=${V55_FOUNDATION_FROZEN}`,
      `p1=${p1.valid}`,
      `p2=${p2.valid}`,
      `p3=${p3.valid}`,
      `p4=${p4.valid}`,
      `p5=${p5.valid}`,
      `p6=${p6.valid}`,
      `p7=${p7.valid}`,
      `p8=${p8.valid}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function auditQuoteRuntimeCoreFiles(): string[] {
  const files: string[] = [];
  const excludeDirNames = ["validation", "freeze", "node_modules"];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (excludeDirNames.includes(entry.name)) continue;
        walk(join(dir, entry.name));
        continue;
      }
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(join(dir, entry.name));
      }
    }
  };
  walk(QUOTE_ROOT);
  return files;
}

export function auditQuoteRuntimeNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditQuoteRuntimeCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

export function auditQuoteRuntimeNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditQuoteRuntimeCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

export function auditQuoteRuntimeNoApiHandler(): boolean {
  const pattern = /\/api\/handlers\/|from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api/;
  return !auditQuoteRuntimeCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

export function auditQuoteRuntimeNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditQuoteRuntimeCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}
