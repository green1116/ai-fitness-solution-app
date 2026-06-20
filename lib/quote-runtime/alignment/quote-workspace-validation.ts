import { createWorkspaceRuntimeAssemblyContext, resolveQuoteSurface } from "@/lib/workspace-runtime";
import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";
import {
  assertWorkspaceQuoteSurfaceAligned,
  describeWorkspaceQuoteAlignment,
  resolveWorkspaceQuoteAlignment,
} from "./quote-workspace-alignment";
import { createWorkspaceQuoteRegistry } from "./quote-workspace-registry";
import type { WorkspaceQuoteAlignmentValidation } from "./quote-workspace-surface";
import {
  assertWorkspaceQuoteSurfaceShape,
  createWorkspaceQuoteSurface,
  describeWorkspaceQuoteSurface,
} from "./quote-workspace-surface";

export function validateWorkspaceQuoteAlignment(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): WorkspaceQuoteAlignmentValidation {
  const quoteSurface = createWorkspaceQuoteSurface(snapshot);
  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: snapshot.workspaceId });
  const runtimeQuoteSurface = resolveQuoteSurface(assemblyContext.surfaceContext.surface);
  const registry = createWorkspaceQuoteRegistry();
  registry.register(quoteSurface);

  if (!runtimeQuoteSurface) {
    return {
      valid: false,
      summary: `workspaceId=${snapshot.workspaceId} runtimeQuoteSurface=missing valid=false`,
    };
  }

  const alignment = resolveWorkspaceQuoteAlignment(snapshot, runtimeQuoteSurface);
  const valid =
    assertWorkspaceQuoteSurfaceShape(quoteSurface) &&
    assertWorkspaceQuoteSurfaceAligned(alignment) &&
    registry.has(snapshot.workspaceId) &&
    registry.resolve(snapshot.workspaceId)?.runtimeState === snapshot.runtimeState;

  return {
    valid,
    summary: [
      describeWorkspaceQuoteSurface(quoteSurface),
      describeWorkspaceQuoteAlignment(alignment),
      `registered=${registry.has(snapshot.workspaceId)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
