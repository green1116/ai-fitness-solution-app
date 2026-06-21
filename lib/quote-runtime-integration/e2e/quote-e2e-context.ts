import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import {
  createQuoteApiAdapter,
  createQuoteApiBindingFromV51,
} from "../adapters/api";
import {
  createMemoryQuoteRepositoryBinding,
  createQuotePersistenceAdapter,
} from "../adapters/persistence";
import type { QuoteRuntimeBridgeSnapshot } from "../bridge/quote-runtime-bridge";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import { createQuoteRuntimePortBinding } from "../integration/create-quote-runtime-port-binding";
import type { QuoteRuntimePortBinding } from "../integration/create-quote-runtime-port-binding";
import { createQuotePortStubBundle } from "../ports/quote-port-resolver";
import type { QuoteExecutionContext } from "../shared/integration-types";
import {
  SAAS_PRODUCT_API_DEPENDENCY_TAG,
  SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG,
} from "../shared/integration-constants";

export interface QuoteEndToEndContext {
  workspaceId: string;
  bridgeSnapshot: QuoteRuntimeBridgeSnapshot;
  execution: QuoteExecutionContext;
  portBinding: QuoteRuntimePortBinding;
  ports: QuotePortRegistry;
  chainTags: {
    p1: typeof WORKSPACE_QUOTE_INTEGRATION_P1_TAG;
    p2: typeof WORKSPACE_QUOTE_INTEGRATION_P2_TAG;
    p3: typeof WORKSPACE_QUOTE_INTEGRATION_P3_TAG;
    p4: typeof WORKSPACE_QUOTE_INTEGRATION_P4_TAG;
    p5: typeof WORKSPACE_QUOTE_INTEGRATION_P5_TAG;
    p6: typeof WORKSPACE_QUOTE_INTEGRATION_P6_TAG;
    v55: typeof WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG;
    v50: typeof SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG;
    v51: typeof SAAS_PRODUCT_API_DEPENDENCY_TAG;
  };
}

export async function createQuoteEndToEndContext(
  workspaceId: string,
  options?: { tenantId?: string },
): Promise<QuoteEndToEndContext> {
  const tenantId = options?.tenantId ?? "tenant-v56-p7";
  const bridgeSnapshot = loadV55QuoteRuntimeSnapshot(workspaceId);
  const { binding, workspaceId: memoryWorkspaceId } = await createMemoryQuoteRepositoryBinding({
    tenantId,
  });
  const resolvedWorkspaceId =
    workspaceId === "v56-p7-e2e-mounted" ? memoryWorkspaceId : workspaceId;

  const persistence = createQuotePersistenceAdapter({ tenantId, binding });
  const api = createQuoteApiAdapter({ binding: createQuoteApiBindingFromV51({ tenantId }) });
  const foundation = createQuotePortStubBundle(
    loadV55QuoteRuntimeSnapshot(resolvedWorkspaceId).snapshot,
  );
  const ports = {
    persistence,
    api,
    commercial: foundation.commercial,
  };

  const portBinding = createQuoteRuntimePortBinding({
    workspaceId: resolvedWorkspaceId,
    ports,
  });

  return {
    workspaceId: resolvedWorkspaceId,
    bridgeSnapshot: loadV55QuoteRuntimeSnapshot(resolvedWorkspaceId),
    execution: portBinding.execution,
    portBinding,
    ports: portBinding.portRegistry.resolve(resolvedWorkspaceId),
    chainTags: {
      p1: WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
      p2: WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
      p3: WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
      p4: WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
      p5: WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
      p6: WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
      v55: WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG,
      v50: SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
      v51: SAAS_PRODUCT_API_DEPENDENCY_TAG,
    },
  };
}

export function describeQuoteEndToEndContext(context: QuoteEndToEndContext): string {
  return [
    `workspaceId=${context.workspaceId}`,
    `runtimeState=${context.bridgeSnapshot.snapshot.runtimeState}`,
    `p1=${context.chainTags.p1}`,
    `p2=${context.chainTags.p2}`,
    `p3=${context.chainTags.p3}`,
    `p4=${context.chainTags.p4}`,
    `p5=${context.chainTags.p5}`,
    `p6=${context.chainTags.p6}`,
  ].join(" ");
}
