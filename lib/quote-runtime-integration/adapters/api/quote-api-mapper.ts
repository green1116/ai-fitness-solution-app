import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";

export interface QuoteApiSurfaceView {
  key: "quote";
  workspaceId: string;
  runtimeState: WorkspaceQuoteRuntimeSnapshot["runtimeState"];
  quoteReadiness: WorkspaceQuoteRuntimeSnapshot["quoteReadiness"];
  lifecycleStatus: WorkspaceQuoteRuntimeSnapshot["lifecycleStatus"];
  exposureLayer: "v51-api-exposure";
}

export interface QuoteApiExposureResult {
  exposed: boolean;
  route: string;
  methods: readonly string[];
  phase: string;
}

export function mapQuoteApiSurface(
  workspaceId: string,
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): QuoteApiSurfaceView {
  return {
    key: "quote",
    workspaceId: workspaceId.trim(),
    runtimeState: snapshot.runtimeState,
    quoteReadiness: snapshot.quoteReadiness,
    lifecycleStatus: snapshot.lifecycleStatus,
    exposureLayer: "v51-api-exposure",
  };
}

export function mapQuoteApiReadiness(snapshot: WorkspaceQuoteRuntimeSnapshot): string {
  return snapshot.quoteReadiness;
}

export function mapQuoteApiExposureResult(input: {
  workspaceId: string;
  route: string;
  methods?: readonly string[];
  phase?: string;
}): QuoteApiExposureResult {
  return {
    exposed: input.workspaceId.trim().length > 0 && input.route.trim().length > 0,
    route: input.route,
    methods: input.methods ?? ["GET", "POST"],
    phase: input.phase ?? "P4",
  };
}
