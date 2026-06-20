import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import {
  createWorkspaceBusinessBridge,
  createWorkspaceBusinessContext,
  createWorkspaceBusinessDomain,
  createWorkspaceBusinessEntry,
  createWorkspaceBusinessOrchestration,
} from "@/lib/workspace-business-runtime";
import { createQuoteBridgeFromBusinessViews } from "../bridge/create-quote-bridge";
import { createQuoteContextSnapshot } from "../context/quote-context-snapshot";
import { createWorkspaceQuoteRuntimeContext } from "../context/quote-context-factory";
import { createQuoteDomainView } from "../domain/quote-domain-view";
import { createQuoteLifecycleView } from "../lifecycle/quote-lifecycle-view";
import { createWorkspaceQuoteRuntimeAssembly } from "../assembly/quote-runtime-assembly-view";
import { createWorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-snapshot";
import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";
import { validateWorkspaceQuoteRuntimeAssembly } from "../assembly/quote-runtime-assembly-guards";
import { validateQuoteLifecycleView } from "../lifecycle/quote-lifecycle-guards";
import { validateQuoteDomainView } from "../domain/quote-domain-guards";
import { validateQuoteRuntimeContext } from "../context/quote-context-guards";
import { assertQuoteBridgeViewShape } from "../bridge/quote-bridge";

export interface QuoteRuntimeFoundationSnapshot {
  workspaceId: string;
  runtimeSnapshot: WorkspaceQuoteRuntimeSnapshot;
  bridgeShapeValid: boolean;
  contextValid: boolean;
  domainValid: boolean;
  lifecycleValid: boolean;
  assemblyValid: boolean;
}

export function buildQuoteRuntimeFoundationSnapshot(
  workspaceId: string,
): QuoteRuntimeFoundationSnapshot {
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const contextSnapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(contextSnapshot);
  const lifecycleView = createQuoteLifecycleView(domainView);
  const runtimeAssembly = createWorkspaceQuoteRuntimeAssembly(lifecycleView);
  const runtimeSnapshot = createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);

  return {
    workspaceId,
    runtimeSnapshot,
    bridgeShapeValid: assertQuoteBridgeViewShape(quoteBridge),
    contextValid: validateQuoteRuntimeContext(quoteContext).valid,
    domainValid: validateQuoteDomainView(domainView).valid,
    lifecycleValid: validateQuoteLifecycleView(lifecycleView).valid,
    assemblyValid: validateWorkspaceQuoteRuntimeAssembly(runtimeAssembly).valid,
  };
}

export function assertWorkspaceQuoteRuntimeSnapshotCheck(
  foundationSnapshot: QuoteRuntimeFoundationSnapshot,
): boolean {
  const snapshot = foundationSnapshot.runtimeSnapshot;
  return (
    foundationSnapshot.workspaceId.trim().length > 0 &&
    foundationSnapshot.bridgeShapeValid &&
    foundationSnapshot.contextValid &&
    foundationSnapshot.domainValid &&
    foundationSnapshot.lifecycleValid &&
    foundationSnapshot.assemblyValid &&
    snapshot.workspaceId === foundationSnapshot.workspaceId &&
    snapshot.runtimeState.trim().length > 0 &&
    snapshot.lifecycleStatus.trim().length > 0
  );
}
