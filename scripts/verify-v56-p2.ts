/**
 * V56 Quote Runtime Integration — P2 Quote Port Binding Layer verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P2_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P2_META,
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p2-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P2_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p2-final";
import { WORKSPACE_QUOTE_INTEGRATION_P1_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertExecutionPortMappingContract,
  assertHasPortResolver,
  assertMountedQuotePortBinding,
  assertP2NoDirectApiAccess,
  assertP2NoDirectDbAccess,
  assertP2NoPrismaImport,
  assertP2NoWorkflowExecution,
  assertPortBindingContextContract,
  assertPortRegistryWiringContract,
  assertPortResolverContract,
  validateQuoteIntegrationP2,
} from "@/lib/quote-runtime-integration/validation/quote-port-binding.verify";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP2();
  assert(validation.valid, `P2 quote port binding validation: ${validation.summary}`);
  console.log("✓ P2 quote port binding validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-resolver.ts")), "port resolver module");
  assert(assertPortResolverContract(), "HAS_PORT_RESOLVER");
  assert(assertHasPortResolver(), "port resolver mounted");
  console.log("✓ HAS_PORT_RESOLVER");

  assert(existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-registry.ts")), "port registry wiring module");
  assert(assertPortRegistryWiringContract(), "HAS_PORT_REGISTRY_WIRING");
  console.log("✓ HAS_PORT_REGISTRY_WIRING");

  assert(existsSync(join(INTEGRATION_ROOT, "ports", "quote-port-binding.ts")), "port binding context module");
  assert(assertPortBindingContextContract(), "HAS_PORT_BINDING_CONTEXT");
  console.log("✓ HAS_PORT_BINDING_CONTEXT");

  assert(assertExecutionPortMappingContract(), "HAS_EXECUTION_PORT_MAPPING");
  assert(assertMountedQuotePortBinding(), "execution port mapping mounted");
  console.log("✓ HAS_EXECUTION_PORT_MAPPING");

  assert(assertP2NoDirectDbAccess(), "NO_DIRECT_DB_ACCESS");
  console.log("✓ NO_DIRECT_DB_ACCESS");

  assert(assertP2NoDirectApiAccess(), "NO_DIRECT_API_ACCESS");
  console.log("✓ NO_DIRECT_API_ACCESS");

  assert(assertP2NoWorkflowExecution(), "NO_WORKFLOW_EXECUTION");
  console.log("✓ NO_WORKFLOW_EXECUTION");

  assert(assertP2NoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(WORKSPACE_QUOTE_INTEGRATION_P2_META.tag === WORKSPACE_QUOTE_INTEGRATION_P2_TAG, "p2 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P2_META.phase === "v56-quote-runtime-p2", "p2 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P2_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P1_TAG, "p2 dependency tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P2_FREEZE.status === "quote-port-binding-layer", "p2 freeze status");
  assert(V56_QUOTE_P2_VERIFY_CHECKS.includes("HAS_PORT_RESOLVER"), "p2 verify checks");
  console.log("✓ quote p2 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P2_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P1_TAG}`);
  console.log("V56 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
