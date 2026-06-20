import type { QuoteSurface } from "@/lib/workspace-runtime";
import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";
import type { WorkspaceQuoteSurface } from "./quote-workspace-surface";
import { createWorkspaceQuoteSurface } from "./quote-workspace-surface";

export interface WorkspaceQuoteAlignment {
  workspaceId: string;
  quoteSurface: WorkspaceQuoteSurface;
  runtimeQuoteSurfaceStatus: QuoteSurface["status"];
  runtimeQuoteSurfaceEligible: boolean;
  aligned: boolean;
}

export function resolveExpectedRuntimeQuoteSurfaceStatus(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): QuoteSurface["status"] {
  switch (snapshot.runtimeState) {
    case "ACTIVE":
      return "active";
    case "READY":
      return "visible";
    case "SHELL":
    default:
      return "inactive";
  }
}

export function resolveWorkspaceQuoteAlignment(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
  runtimeQuoteSurface: QuoteSurface,
): WorkspaceQuoteAlignment {
  const quoteSurface = createWorkspaceQuoteSurface(snapshot);
  const expectedStatus = resolveExpectedRuntimeQuoteSurfaceStatus(snapshot);
  const aligned =
    quoteSurface.workspaceId === snapshot.workspaceId &&
    runtimeQuoteSurface.key === "quote" &&
    runtimeQuoteSurface.surface === "quote" &&
    runtimeQuoteSurface.type === "quote" &&
    runtimeQuoteSurface.status === expectedStatus;

  return {
    workspaceId: snapshot.workspaceId,
    quoteSurface,
    runtimeQuoteSurfaceStatus: runtimeQuoteSurface.status,
    runtimeQuoteSurfaceEligible: runtimeQuoteSurface.eligible,
    aligned,
  };
}

export function assertWorkspaceQuoteSurfaceAligned(alignment: WorkspaceQuoteAlignment): boolean {
  return alignment.aligned;
}

export function describeWorkspaceQuoteAlignment(alignment: WorkspaceQuoteAlignment): string {
  return [
    `workspaceId=${alignment.workspaceId}`,
    `runtimeQuoteSurfaceStatus=${alignment.runtimeQuoteSurfaceStatus}`,
    `quoteReadiness=${alignment.quoteSurface.quoteReadiness}`,
    `aligned=${alignment.aligned}`,
  ].join(" ");
}
