import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  V57_PRODUCT_FROZEN,
  V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE,
} from "../freeze/v57-final-frozen";
import {
  V57_PRODUCT_LOCKED,
  WORKSPACE_QUOTE_PRODUCT_FINAL_META,
  WORKSPACE_QUOTE_PRODUCT_P8_META,
} from "../freeze/v57-p8-meta";
import { WORKSPACE_QUOTE_PRODUCT_FINAL_TAG } from "../shared/quote-product-constants";
import {
  auditQuotePortalRoutes,
  assertCanonicalQuotePortalRoute,
} from "../integration-check/v57-p7-route-audit";
import {
  assertNoLegacyPortalLoaderInAppPage,
  assertPortalUiUsesSurfaceOnly,
  checkQuotePortalBypass,
} from "../integration-check/v57-p7-bypass-check";
import {
  assertHasLoaderHydrationP7,
  assertHasRouteConsolidationP7,
  assertHasSinglePortalEntryP7,
  assertHasSurfaceOnlyRenderingP7,
  assertNoLegacyEntryRouteP7,
  assertNoRuntimeImportInUiP7,
  validateQuoteProductP7,
} from "./validate-quote-product-p7";
import { validateQuoteProductP1 } from "./validate-quote-product-p1";
import { validateQuoteProductP2 } from "./validate-quote-product-p2";
import { validateQuoteProductP3 } from "./validate-quote-product-p3";
import { validateQuoteProductP4 } from "./validate-quote-product-p4";
import { validateQuoteProductP5 } from "./validate-quote-product-p5";
import { validateQuoteProductP6 } from "./validate-quote-product-p6";
import { WORKSPACE_QUOTE_PRODUCT_P8_TAG } from "../freeze/v57-p8-meta";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

export interface QuoteProductP8Validation {
  valid: boolean;
  summary: string;
  phases: Record<string, boolean>;
}

export interface QuoteProductFinalValidation {
  valid: boolean;
  summary: string;
}

export function assertHasFinalFreezeFileP8(): boolean {
  const frozenPath = join(PRODUCT_ROOT, "freeze", "v57-final-frozen.ts");
  const metaPath = join(PRODUCT_ROOT, "freeze", "v57-p8-meta.ts");
  const frozen = readFileSync(frozenPath, "utf8");
  const meta = readFileSync(metaPath, "utf8");

  return (
    existsSync(frozenPath) &&
    existsSync(metaPath) &&
    frozen.includes("V57_QUOTE_PRODUCT_ARCHITECTURE_SNAPSHOT") &&
    frozen.includes("V57_QUOTE_PRODUCT_SURFACE_CONTRACT") &&
    frozen.includes("V57_QUOTE_PRODUCT_EXECUTION_CHAIN") &&
    frozen.includes("V57_QUOTE_PRODUCT_UI_STATE_MODEL") &&
    frozen.includes("V57_QUOTE_PRODUCT_ENTRY_FLOW") &&
    frozen.includes("V57_QUOTE_PRODUCT_RUNTIME_BOUNDARY_RULES") &&
    meta.includes("WORKSPACE_QUOTE_PRODUCT_FINAL_META")
  );
}

export function assertV57ProductFrozen(): boolean {
  return (
    assertHasFinalFreezeFileP8() &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_META.tag === WORKSPACE_QUOTE_PRODUCT_FINAL_TAG &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_META.state === "FROZEN" &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_META.frozen === true &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_META.productFrozen === V57_PRODUCT_FROZEN &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE.frozen === true &&
    WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE.phaseTags.length === 8
  );
}

export async function assertV57ProductLocked(): Promise<boolean> {
  const routeAudit = auditQuotePortalRoutes();
  const bypass = checkQuotePortalBypass();

  return (
    routeAudit.valid &&
    bypass.valid &&
    assertHasSinglePortalEntryP7() &&
    assertHasSurfaceOnlyRenderingP7() &&
    assertNoLegacyEntryRouteP7() &&
    assertHasLoaderHydrationP7() &&
    assertHasRouteConsolidationP7() &&
    assertNoRuntimeImportInUiP7() &&
    assertCanonicalQuotePortalRoute("v57-p8-canonical-route")
  );
}

export async function assertAllQuoteProductPhasesPass(): Promise<Record<string, boolean>> {
  const [p1, p2, p3, p4, p5, p6, p7] = await Promise.all([
    validateQuoteProductP1(),
    validateQuoteProductP2(),
    validateQuoteProductP3(),
    validateQuoteProductP4(),
    validateQuoteProductP5(),
    validateQuoteProductP6(),
    validateQuoteProductP7(),
  ]);

  return {
    p1: p1.valid,
    p2: p2.valid,
    p3: p3.valid,
    p4: p4.valid,
    p5: p5.valid,
    p6: p6.valid,
    p7: p7.valid,
  };
}

export async function validateQuoteProductP8(): Promise<QuoteProductP8Validation> {
  const phases = await assertAllQuoteProductPhasesPass();
  const allPhasesPass = Object.values(phases).every(Boolean);
  const locked = await assertV57ProductLocked();
  const valid =
    allPhasesPass &&
    locked &&
    assertHasFinalFreezeFileP8() &&
    assertV57ProductFrozen() &&
    assertNoLegacyPortalLoaderInAppPage() &&
    assertPortalUiUsesSurfaceOnly();

  return {
    valid,
    phases,
    summary: [
      `p8Tag=${WORKSPACE_QUOTE_PRODUCT_P8_TAG}`,
      `allPhasesPass=${allPhasesPass}`,
      `locked=${V57_PRODUCT_LOCKED}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export async function validateQuoteProductFinal(): Promise<QuoteProductFinalValidation> {
  const p8 = await validateQuoteProductP8();
  const frozen = assertV57ProductFrozen();
  const locked = await assertV57ProductLocked();
  const valid =
    p8.valid &&
    frozen &&
    locked &&
    WORKSPACE_QUOTE_PRODUCT_P8_META.productLocked === V57_PRODUCT_LOCKED &&
    V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS.includes("V57_PRODUCT_FROZEN");

  return {
    valid,
    summary: [
      `finalTag=${WORKSPACE_QUOTE_PRODUCT_FINAL_TAG}`,
      `frozen=${V57_PRODUCT_FROZEN}`,
      `locked=${V57_PRODUCT_LOCKED}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
