/**
 * WP-PRODUCT-CTX-HANDOFF-1 — Deep-Link Context Handoff verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  buildProductContextSearch,
  isProductContextCrmHandoff,
  mergeProductContext,
  PRODUCT_CONTEXT_HANDOFF_CRM,
  PRODUCT_CONTEXT_STORAGE_KEY,
  productHref,
  readStoredProductContext,
  resolveClientProductContext,
  writeStoredProductContext,
} from "../app/(product)/commercial-context";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

type MemoryStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

function createMemoryStorage(): MemoryStorage & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function withMockSessionStorage<T>(fn: () => T): T {
  const memory = createMemoryStorage();
  const priorWindow = globalThis.window;
  globalThis.window = {
    sessionStorage: memory,
  } as Window & typeof globalThis.window;
  try {
    return fn();
  } finally {
    if (priorWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = priorWindow;
    }
  }
}

function checkHandoffWiring() {
  const ctx = read("app/(product)/commercial-context.ts");
  assert(ctx.includes("mode: \"replace\""), "replace write mode exists");
  assert(ctx.includes("isProductContextCrmHandoff"), "CRM handoff detector exists");
  assert(
    ctx.includes("writeStoredProductContext(urlCtx, { mode: \"replace\" })"),
    "handoff resolves with replace",
  );

  const panel = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  assert(panel.includes("handoff: \"crm\""), "CRM workspace emits handoff");

  const nav = read("app/(product)/ProductCommercialNav.tsx");
  assert(!nav.includes("handoff"), "ProductCommercialNav does not reference handoff");
  console.log("✓ handoff wiring");
}

function checkNavNeverEmitsHandoff() {
  const nav = read("app/(product)/ProductCommercialNav.tsx");
  const hrefCalls = nav.match(/productHref\([^)]+\)/g) ?? [];
  assert(hrefCalls.length >= 3, "nav uses productHref");
  for (const call of hrefCalls) {
    assert(!call.includes("handoff"), `nav productHref has no handoff: ${call}`);
  }

  const href = productHref("/budget", {
    organizationId: "org1",
    projectId: "p1",
    quoteId: "q1",
  });
  assert(!href.includes("handoff="), "default productHref has no handoff");
  console.log("✓ ProductCommercialNav never emits handoff");
}

function checkCrmHandoffClearsStaleContext() {
  withMockSessionStorage(() => {
    writeStoredProductContext({
      organizationId: "org-old",
      projectId: "p-old",
      quoteId: "q-old",
      budgetId: "b-old",
    });

    const search = buildProductContextSearch(
      { organizationId: "org1", quoteId: "q1" },
      { handoff: "crm" },
    );
    assert(isProductContextCrmHandoff(search), "CRM handoff flag parsed");

    const resolved = resolveClientProductContext(search);
    assert(resolved.quoteId === "q1", "handoff keeps quoteId from URL");
    assert(resolved.organizationId === "org1", "handoff keeps organizationId from URL");
    assert(resolved.budgetId === undefined, "handoff does not keep stale budgetId in return");

    const stored = readStoredProductContext();
    assert(stored.quoteId === "q1", "stored quoteId replaced from URL");
    assert(stored.budgetId === undefined, "stale budgetId cleared on CRM handoff");
    assert(stored.projectId === undefined, "stale projectId cleared on quote-only handoff");
  });
  console.log("✓ CRM quote-only handoff clears stale budgetId");
}

function checkNormalNavigationMergeUnchanged() {
  withMockSessionStorage(() => {
    writeStoredProductContext({
      organizationId: "org1",
      projectId: "p1",
      budgetId: "b-keep",
    });

    const merged = resolveClientProductContext("quoteId=q2");
    assert(merged.quoteId === "q2", "normal navigation overlays quoteId");
    assert(merged.budgetId === "b-keep", "normal navigation preserves budgetId");

    const stored = readStoredProductContext();
    assert(stored.budgetId === "b-keep", "merge keeps existing budgetId in session");
    assert(stored.projectId === "p1", "merge keeps existing projectId in session");
  });

  const base = { projectId: "keep", quoteId: "old", budgetId: "b1" };
  const overlay = { quoteId: "new" };
  const merged = mergeProductContext(base, overlay);
  assert(merged.projectId === "keep", "merge helper unchanged");
  assert(merged.budgetId === "b1", "merge helper keeps budgetId");
  assert(merged.quoteId === "new", "merge helper overlays quoteId");
  console.log("✓ normal navigation merge unchanged");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const bridge = read("lib/product/commercial-context-bridge.ts");
  assert(!eads.includes("handoff"), "EADS untouched");
  assert(!eac.includes("handoff"), "EAC untouched");
  assert(!bridge.includes("handoff"), "CRM bridge untouched");
  console.log("✓ frozen layers untouched");
}

function main() {
  checkHandoffWiring();
  checkNavNeverEmitsHandoff();
  checkCrmHandoffClearsStaleContext();
  checkNormalNavigationMergeUnchanged();
  checkFrozenLayersUntouched();
  console.log("\n✓ WP-PRODUCT-CTX-HANDOFF-1 — ALL CHECKS PASSED");
}

main();
