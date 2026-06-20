import {
  assertV55FoundationIntegrityLocked,
  buildV55FoundationIntegritySnapshot,
} from "./quote-runtime-integrity";
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
import { WORKSPACE_QUOTE_RUNTIME_P7_TAG } from "./freeze/v55-p7-meta";

export interface QuoteRuntimeP7Validation {
  valid: boolean;
  summary: string;
}

export async function validateQuoteRuntimeP7(): Promise<QuoteRuntimeP7Validation> {
  const workspaceId = "p7-quote-foundation-validate";
  const foundation = validateQuoteRuntimeFoundation(workspaceId);
  const integritySnapshot = buildV55FoundationIntegritySnapshot(workspaceId);

  const valid =
    foundation.valid &&
    assertHasBridgeLayer() &&
    assertHasContextLayer() &&
    assertHasDomainLayer() &&
    assertHasLifecycleLayer() &&
    assertHasAssemblyLayer() &&
    assertHasPortLayer() &&
    assertQuoteRuntimeDependencyChain() &&
    assertV55FoundationIntegrityLocked(workspaceId);

  return {
    valid,
    summary: [
      `p7Tag=${WORKSPACE_QUOTE_RUNTIME_P7_TAG}`,
      foundation.summary,
      `integrityLock=${integritySnapshot.integrityLock}`,
      `dependencyChainLocked=${integritySnapshot.dependencyChainLocked}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export {
  assertHasAssemblyLayer,
  assertHasBridgeLayer,
  assertHasContextLayer,
  assertHasDomainLayer,
  assertHasLifecycleLayer,
  assertHasPortLayer,
  assertQuoteRuntimeDependencyChain,
  assertV55FoundationIntegrityLocked,
};
