import type {
  BusinessSurfaceView,
  WorkspaceBusinessBridgeView,
  WorkspaceBusinessEntry,
} from "@/lib/workspace-business-runtime";
import { QUOTE_SURFACE_KEY, WORKSPACE_QUOTE_BRIDGE_VERSION } from "../shared/quote-constants";
import { resolveQuoteReadiness } from "./quote-bridge";
import type { QuoteBridgeView } from "./quote-bridge-view";

export function resolveQuoteSurfaceView(
  bridgeView: WorkspaceBusinessBridgeView,
): BusinessSurfaceView | undefined {
  return bridgeView.surfaces.find((surface) => surface.key === QUOTE_SURFACE_KEY);
}

export function createQuoteBridge(
  entry: WorkspaceBusinessEntry,
  quoteSurface: BusinessSurfaceView,
  version: string = WORKSPACE_QUOTE_BRIDGE_VERSION,
): QuoteBridgeView {
  return {
    workspaceId: entry.scope.workspaceId,
    version,
    entryState: entry.entryState,
    quoteReadiness: resolveQuoteReadiness(entry, quoteSurface),
    surfaceEligible: quoteSurface.eligible,
    surfaceVisible: quoteSurface.visible,
    surfaceActive: quoteSurface.active,
  };
}

export function createQuoteBridgeFromBusinessViews(
  entry: WorkspaceBusinessEntry,
  bridgeView: WorkspaceBusinessBridgeView,
): QuoteBridgeView {
  const quoteSurface = resolveQuoteSurfaceView(bridgeView);
  if (!quoteSurface) {
    return {
      workspaceId: entry.scope.workspaceId,
      version: bridgeView.version,
      entryState: entry.entryState,
      quoteReadiness: "BLOCKED",
      surfaceEligible: false,
      surfaceVisible: false,
      surfaceActive: false,
    };
  }
  return createQuoteBridge(entry, quoteSurface, bridgeView.version);
}
