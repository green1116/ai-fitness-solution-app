import type { GovernanceStoreOperation, GovernanceStoreRuntimeResult } from "./store.types";

export function createStoreOperation(input: {
  operationType: GovernanceStoreOperation["operationType"];
  storeType: GovernanceStoreOperation["storeType"];
  resourceId: string;
  result: GovernanceStoreOperation["result"];
  reason: string;
}): GovernanceStoreOperation {
  return {
    operationId: `store-op-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    operationType: input.operationType,
    storeType: input.storeType,
    resourceId: input.resourceId,
    result: input.result,
    timestamp: new Date().toISOString(),
    reason: input.reason,
  };
}

export function buildStoreTrace(
  operations: GovernanceStoreOperation[],
): GovernanceStoreRuntimeResult["trace"] {
  return {
    traceId: `store-trace-${Date.now()}`,
    operations,
  };
}
