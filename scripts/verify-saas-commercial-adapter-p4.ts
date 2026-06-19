/**
 * V48 SaaS Commercial Adapter — Phase 4 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  clearSaasQuoteRepository,
  executeCommercialQuote,
  getSaasQuoteRepositorySize,
  hydrateQuote,
  mapTenantToV47Context,
  saveSaasQuote,
  SAAS_COMMERCIAL_ADAPTER_P4_TAG,
} from "../lib/saas-commercial-adapter";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  resolveTenantContext,
  setRuntimeSession,
} from "../lib/saas-runtime";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const adapterRoot = join(process.cwd(), "lib", "saas-commercial-adapter");
  const hydratorSource = readFileSync(join(adapterRoot, "bridge", "quote-hydrator.ts"), "utf8");
  const executorSource = readFileSync(join(adapterRoot, "bridge", "commercial-executor.ts"), "utf8");

  assert(hydratorSource.includes("commercial-products/access-layer"), "V47 hydrator import");
  assert(executorSource.includes("commercial-products/access-layer"), "V47 executor import");
  assert(!hydratorSource.includes("commercial-products/release"), "no V47 internal state import");
  console.log("✓ V47 read-only import ok");

  clearSaasQuoteRepository();
  clearRuntimeSession();

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const ctx = await resolveTenantContext();
  const v47Context = mapTenantToV47Context(ctx);
  assert(v47Context.workspaceId === ctx.workspaceId, "tenant mapper workspace");
  assert(v47Context.organizationScopeId === ctx.organizationId, "tenant mapper organization");
  console.log("✓ mapTenantToV47Context ok");

  const quote = saveSaasQuote({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId ?? "workspace-mock-enterprise",
    source: "manual",
    payload: {
      sku: "kickstart-package",
      projectName: "SaaS Bridge Demo",
      areaSqm: 500,
      headcount: 200,
      budgetCny: 800000,
    },
  });

  const hydrated = await hydrateQuote({ quoteId: quote.id, tenantId: ctx.tenantId });
  assert(hydrated.status === "hydrated", "hydrated status");
  assert(Boolean(hydrated.snapshot.quoteId), "hydrated snapshot");
  console.log("✓ hydrateQuote ok");
  console.log(`  quoteId=${hydrated.quoteId}`);

  const { getQuoteSnapshotById } = await import(
    "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry"
  );
  assert(Boolean(getQuoteSnapshotById(quote.id)), "V47 snapshot registry");
  console.log("✓ V47 snapshot registry ok");

  clearSaasQuoteRepository();
  const quoteForExecute = saveSaasQuote({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId ?? "workspace-mock-enterprise",
    payload: {
      sku: "kickstart-package",
      projectName: "SaaS Execute Demo",
      areaSqm: 420,
      headcount: 180,
      budgetCny: 650000,
    },
  });

  const executed = await executeCommercialQuote({
    quoteId: quoteForExecute.id,
    ctx,
  });
  assert(executed.status === "executed", "executed status");
  assert(Boolean(executed.result), "executed result");
  assert(executed.v47Context.tenantId === ctx.tenantId, "executed v47 context");
  console.log("✓ executeCommercialQuote ok");

  const sizes = getSaasQuoteRepositorySize();
  assert(sizes.quotes >= 1, "repository quotes");
  assert(sizes.snapshots >= 1, "repository snapshots");
  console.log("✓ repository state ok");

  clearSaasQuoteRepository();
  clearRuntimeSession();

  console.log(`tag=${SAAS_COMMERCIAL_ADAPTER_P4_TAG}`);
  console.log("SAAS COMMERCIAL ADAPTER P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
