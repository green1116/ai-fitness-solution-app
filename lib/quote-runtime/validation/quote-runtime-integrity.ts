import { V55_FOUNDATION_INTEGRITY_LOCKED } from "./freeze/v55-p7-meta";
import {
  assertHasAssemblyLayer,
  assertHasBridgeLayer,
  assertHasContextLayer,
  assertHasDomainLayer,
  assertHasLifecycleLayer,
  assertHasPortLayer,
  validateQuoteRuntimeFoundation,
} from "./quote-runtime-foundation-check";
import { assertQuoteRuntimeDependencyChain } from "./quote-runtime-dependency-check";
import {
  assertWorkspaceQuoteRuntimeSnapshotCheck,
  buildQuoteRuntimeFoundationSnapshot,
  type QuoteRuntimeFoundationSnapshot,
} from "./quote-runtime-snapshot-check";

export interface V55FoundationIntegritySnapshot {
  integrityLock: typeof V55_FOUNDATION_INTEGRITY_LOCKED;
  workspaceId: string;
  bridgeLayerLocked: boolean;
  contextLayerLocked: boolean;
  domainLayerLocked: boolean;
  lifecycleLayerLocked: boolean;
  assemblyLayerLocked: boolean;
  portLayerLocked: boolean;
  dependencyChainLocked: boolean;
  snapshotLocked: boolean;
}

export function buildV55FoundationIntegritySnapshot(
  workspaceId: string,
): V55FoundationIntegritySnapshot {
  const foundationSnapshot = buildQuoteRuntimeFoundationSnapshot(workspaceId);
  return {
    integrityLock: V55_FOUNDATION_INTEGRITY_LOCKED,
    workspaceId,
    bridgeLayerLocked: assertHasBridgeLayer() && foundationSnapshot.bridgeShapeValid,
    contextLayerLocked: assertHasContextLayer() && foundationSnapshot.contextValid,
    domainLayerLocked: assertHasDomainLayer() && foundationSnapshot.domainValid,
    lifecycleLayerLocked: assertHasLifecycleLayer() && foundationSnapshot.lifecycleValid,
    assemblyLayerLocked: assertHasAssemblyLayer() && foundationSnapshot.assemblyValid,
    portLayerLocked: assertHasPortLayer(),
    dependencyChainLocked: assertQuoteRuntimeDependencyChain(),
    snapshotLocked: assertWorkspaceQuoteRuntimeSnapshotCheck(foundationSnapshot),
  };
}

export function assertV55FoundationIntegritySnapshotLocked(
  snapshot: V55FoundationIntegritySnapshot,
): boolean {
  return (
    snapshot.integrityLock === V55_FOUNDATION_INTEGRITY_LOCKED &&
    snapshot.bridgeLayerLocked &&
    snapshot.contextLayerLocked &&
    snapshot.domainLayerLocked &&
    snapshot.lifecycleLayerLocked &&
    snapshot.assemblyLayerLocked &&
    snapshot.portLayerLocked &&
    snapshot.dependencyChainLocked &&
    snapshot.snapshotLocked
  );
}

export function assertV55FoundationIntegrityLocked(
  workspaceId = "v55-foundation-integrity-lock",
): boolean {
  const snapshot = buildV55FoundationIntegritySnapshot(workspaceId);
  const foundation = validateQuoteRuntimeFoundation(workspaceId);
  return assertV55FoundationIntegritySnapshotLocked(snapshot) && foundation.valid;
}

export type { QuoteRuntimeFoundationSnapshot };
