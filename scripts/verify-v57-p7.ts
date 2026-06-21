/**
 * V57 Quote Product — P7 Portal Wiring Final verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P7_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P7_META,
  WORKSPACE_QUOTE_PRODUCT_P7_TAG,
} from "@/lib/quote-product/freeze/v57-p7-meta";
import { WORKSPACE_QUOTE_PRODUCT_P7_FREEZE } from "@/lib/quote-product/freeze/v57-p7-final";
import { WORKSPACE_QUOTE_PRODUCT_P6_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasLoaderHydrationP7,
  assertHasRouteConsolidationP7,
  assertHasSinglePortalEntryP7,
  assertHasSurfaceOnlyRenderingP7,
  assertMountedQuotePortalWiring,
  assertNoDirectServiceAccessFromUiP7,
  assertNoExecutionClientInUiP7,
  assertNoLegacyEntryRouteP7,
  assertNoRuntimeImportInUiP7,
  validateQuoteProductP7,
} from "@/lib/quote-product/validation/validate-quote-product-p7";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP7();
  assert(validation.valid, `P7 portal wiring validation: ${validation.summary}`);
  console.log("✓ P7 portal wiring validation ok");

  assert(assertHasSinglePortalEntryP7(), "HAS_SINGLE_PORTAL_ENTRY");
  console.log("✓ HAS_SINGLE_PORTAL_ENTRY");

  assert(assertHasSurfaceOnlyRenderingP7(), "HAS_SURFACE_ONLY_RENDERING");
  console.log("✓ HAS_SURFACE_ONLY_RENDERING");

  assert(assertNoLegacyEntryRouteP7(), "NO_LEGACY_ENTRY_ROUTE");
  console.log("✓ NO_LEGACY_ENTRY_ROUTE");

  assert(assertNoDirectServiceAccessFromUiP7(), "NO_DIRECT_SERVICE_ACCESS_FROM_UI");
  console.log("✓ NO_DIRECT_SERVICE_ACCESS_FROM_UI");

  assert(assertNoExecutionClientInUiP7(), "NO_EXECUTION_CLIENT_IN_UI");
  console.log("✓ NO_EXECUTION_CLIENT_IN_UI");

  assert(assertNoRuntimeImportInUiP7(), "NO_RUNTIME_IMPORT_IN_UI");
  console.log("✓ NO_RUNTIME_IMPORT_IN_UI");

  assert(assertHasLoaderHydrationP7(), "HAS_LOADER_HYDRATION");
  console.log("✓ HAS_LOADER_HYDRATION");

  assert(assertHasRouteConsolidationP7(), "HAS_ROUTE_CONSOLIDATION");
  assert(assertMountedQuotePortalWiring(), "portal wiring mounted");
  console.log("✓ HAS_ROUTE_CONSOLIDATION");

  assert(existsSync(join(PRODUCT_ROOT, "portal", "quote-product-route.ts")), "quote product route module");
  assert(existsSync(join(PRODUCT_ROOT, "workspace", "quote-workspace.route.ts")), "quote workspace route module");
  assert(existsSync(join(PRODUCT_ROOT, "integration-check", "v57-p7-route-audit.ts")), "route audit module");
  assert(existsSync(join(PRODUCT_ROOT, "integration-check", "v57-p7-bypass-check.ts")), "bypass check module");

  assert(WORKSPACE_QUOTE_PRODUCT_P7_META.tag === WORKSPACE_QUOTE_PRODUCT_P7_TAG, "p7 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P7_META.phase === "v57-quote-product-p7", "p7 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P7_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P6_TAG, "p7 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P7_FREEZE.status === "portal-wiring-final", "p7 freeze status");
  assert(V57_QUOTE_P7_VERIFY_CHECKS.includes("HAS_SINGLE_PORTAL_ENTRY"), "p7 verify checks");
  console.log("✓ quote product p7 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P7_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P6_TAG}`);
  console.log("V57 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
