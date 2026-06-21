/**
 * V59.5 — Request lifecycle tracking
 */

import { resolveTraceId } from "@/lib/observability/logger";
import type { NextRequest } from "next/server";

export type RequestTrackContext = {
  traceId: string;
  endpoint: string;
  method: string;
  startedAt: number;
};

export function startRequestTracking(req: NextRequest, endpoint: string): RequestTrackContext {
  return {
    traceId: resolveTraceId(req),
    endpoint,
    method: req.method,
    startedAt: Date.now(),
  };
}

export function finishRequestTracking(ctx: RequestTrackContext): { durationMs: number } {
  return { durationMs: Date.now() - ctx.startedAt };
}
