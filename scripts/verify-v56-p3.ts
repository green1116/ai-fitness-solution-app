/**
 * V56 Quote Runtime Integration — P3 Quote Persistence Adapter verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P3_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P3_META,
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p3-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P3_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p3-final";
import {
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
} from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertAdapterUsesV50RepositoryNotPrisma,
  assertHasPersistenceAdapter,
  assertMountedQuotePersistenceAdapter,
  assertPersistenceAdapterContract,
  assertP3NoDirectDbAccess,
  assertP3NoPrismaImportInExecution,
  assertPortEnforcedPersistenceContract,
  assertRepositoryBindingContract,
  validateQuoteIntegrationP3,
} from "@/lib/quote-runtime-integration/validation/quote-persistence.verify";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP3();
  assert(validation.valid, `P3 quote persistence adapter validation: ${validation.summary}`);
  console.log("✓ P3 quote persistence adapter validation ok");

  assert(
    existsSync(join(INTEGRATION_ROOT, "adapters", "persistence", "quote-persistence.adapter.ts")),
    "persistence adapter module",
  );
  assert(assertPersistenceAdapterContract(), "HAS_PERSISTENCE_ADAPTER");
  assert(assertHasPersistenceAdapter(), "persistence adapter contract");
  console.log("✓ HAS_PERSISTENCE_ADAPTER");

  assert(
    existsSync(join(INTEGRATION_ROOT, "adapters", "persistence", "quote-repository.adapter.ts")),
    "repository binding module",
  );
  assert(assertRepositoryBindingContract(), "HAS_REPOSITORY_BINDING");
  assert(assertAdapterUsesV50RepositoryNotPrisma(), "v50 repository binding");
  console.log("✓ HAS_REPOSITORY_BINDING");

  assert(assertPortEnforcedPersistenceContract(), "PORT_ENFORCED_PERSISTENCE");
  assert(await assertMountedQuotePersistenceAdapter(), "port enforced persistence mounted");
  console.log("✓ PORT_ENFORCED_PERSISTENCE");

  assert(assertP3NoDirectDbAccess(), "NO_DIRECT_DB_ACCESS");
  console.log("✓ NO_DIRECT_DB_ACCESS");

  assert(assertP3NoPrismaImportInExecution(), "NO_PRISMA_IMPORT_IN_EXECUTION");
  console.log("✓ NO_PRISMA_IMPORT_IN_EXECUTION");

  assert(WORKSPACE_QUOTE_INTEGRATION_P3_META.tag === WORKSPACE_QUOTE_INTEGRATION_P3_TAG, "p3 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P3_META.phase === "v56-quote-runtime-p3", "p3 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P3_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P2_TAG, "p3 dependency tag");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_P3_META.upstreamDependencyTag === SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
    "p3 upstream dependency",
  );
  assert(WORKSPACE_QUOTE_INTEGRATION_P3_FREEZE.status === "quote-persistence-adapter", "p3 freeze status");
  assert(V56_QUOTE_P3_VERIFY_CHECKS.includes("HAS_PERSISTENCE_ADAPTER"), "p3 verify checks");
  console.log("✓ quote p3 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P3_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P2_TAG}`);
  console.log(`upstream=${SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG}`);
  console.log("V56 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
