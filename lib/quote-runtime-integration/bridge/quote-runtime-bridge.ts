import {
  V55_FOUNDATION_FROZEN,
  WORKSPACE_QUOTE_RUNTIME_FINAL_TAG,
} from "@/lib/quote-runtime";
import { buildQuoteRuntimeFoundationSnapshot } from "@/lib/quote-runtime/validation/quote-runtime-snapshot-check";
import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";

export interface QuoteRuntimeBridgeSnapshot {
  workspaceId: string;
  foundationFrozen: typeof V55_FOUNDATION_FROZEN;
  dependencyTag: typeof WORKSPACE_QUOTE_RUNTIME_FINAL_TAG;
  snapshot: WorkspaceQuoteRuntimeSnapshot;
}

export function assertV55QuoteRuntimeReadOnlyDependency(): boolean {
  return (
    V55_FOUNDATION_FROZEN === "V55_FOUNDATION_FROZEN" &&
    WORKSPACE_QUOTE_RUNTIME_FINAL_TAG === "v55-quote-runtime-final"
  );
}

export function loadV55QuoteRuntimeSnapshot(workspaceId: string): QuoteRuntimeBridgeSnapshot {
  const foundationSnapshot = buildQuoteRuntimeFoundationSnapshot(workspaceId);
  return {
    workspaceId: foundationSnapshot.workspaceId,
    foundationFrozen: V55_FOUNDATION_FROZEN,
    dependencyTag: WORKSPACE_QUOTE_RUNTIME_FINAL_TAG,
    snapshot: foundationSnapshot.runtimeSnapshot,
  };
}

export function resolveQuoteFromEntry(workspaceId: string): QuoteRuntimeBridgeSnapshot {
  return loadV55QuoteRuntimeSnapshot(workspaceId);
}

export function describeQuoteRuntimeBridge(snapshot: QuoteRuntimeBridgeSnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `dependencyTag=${snapshot.dependencyTag}`,
    `runtimeState=${snapshot.snapshot.runtimeState}`,
    `quoteReadiness=${snapshot.snapshot.quoteReadiness}`,
  ].join(" ");
}
