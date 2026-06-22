/**
 * V59.5 — Global API error handler
 */

import { NextResponse } from "next/server";

import { mapErrorToApiError, type ApiError } from "@/lib/error/api-error.mapper";
import { logError } from "@/lib/observability/logger";
import { trackApiError } from "@/lib/observability/metrics.service";
import { recordAuditEvent } from "@/lib/observability/audit.logger";
import type { RateLimitError } from "@/lib/security/rate-limit";

export function handleApiError(
  err: unknown,
  ctx: {
    traceId: string;
    endpoint: string;
    userId?: string;
    organizationId?: string;
  },
): NextResponse {
  const apiError = mapErrorToApiError(err, ctx.traceId);

  logError("api.error", {
    traceId: ctx.traceId,
    endpoint: ctx.endpoint,
    userId: ctx.userId,
    organizationId: ctx.organizationId,
    status: apiError.status,
    message: apiError.message,
    meta: { code: apiError.code },
  });

  trackApiError({ endpoint: ctx.endpoint, code: apiError.code });

  if (ctx.userId && ctx.organizationId) {
    recordAuditEvent({
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      endpoint: ctx.endpoint,
      action: "api.error",
      resultStatus: "error",
      traceId: ctx.traceId,
      meta: { code: apiError.code },
    });
  }

  const headers: Record<string, string> = {
    "x-trace-id": ctx.traceId,
  };

  if (err instanceof Error && err.name === "RateLimitError") {
    const rl = err as RateLimitError;
    headers["retry-after"] = String(rl.retryAfterSec);
  }

  return NextResponse.json(
    { ok: false, ...apiError },
    { status: apiError.status, headers },
  );
}

export function apiSuccessResponse<T extends Record<string, unknown>>(
  data: T,
  ctx: { traceId: string; status?: number },
): NextResponse {
  return NextResponse.json(
    { ok: true, traceId: ctx.traceId, ...data },
    { status: ctx.status ?? 200, headers: { "x-trace-id": ctx.traceId } },
  );
}

export type { ApiError };
