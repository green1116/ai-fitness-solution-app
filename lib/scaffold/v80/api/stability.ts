/** V80 CODE P3 — API stability (rate limit + error normalization) */
import { Prisma } from "@prisma/client";

import { rateLimit } from "@/lib/rate-limit";

import { V80RuntimeError } from "../runtime/errors";

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 120;

export function clientRateLimitKey(req: Request, endpoint: string) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "anonymous";
  return `v80:${endpoint}:${ip}`;
}

export function enforceV80RateLimit(req: Request, endpoint: string, limit = DEFAULT_LIMIT) {
  const key = clientRateLimitKey(req, endpoint);
  const result = rateLimit(key, limit, WINDOW_MS);
  if (!result.ok) {
    throw new V80RuntimeError("Rate limit exceeded", "RATE_LIMIT", 429);
  }
  return result;
}

export type V80ApiErrorBody = {
  ok: false;
  code: string;
  message: string;
  traceId: string;
  status: number;
};

export function normalizeV80Error(err: unknown, traceId: string): V80ApiErrorBody {
  if (err instanceof V80RuntimeError) {
    return {
      ok: false,
      code: err.code,
      message: err.message,
      traceId,
      status: err.status,
    };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        ok: false,
        code: "SLUG_CONFLICT",
        message: "Unique constraint violation",
        traceId,
        status: 409,
      };
    }
    if (err.code === "P2021" || err.code === "P2022") {
      return {
        ok: false,
        code: "DATABASE_UNAVAILABLE",
        message: "Persistence layer unavailable",
        traceId,
        status: 503,
      };
    }
  }
  return {
    ok: false,
    code: "INTERNAL",
    message: err instanceof Error ? err.message : "Internal error",
    traceId,
    status: 500,
  };
}

export function v80ErrorResponse(body: V80ApiErrorBody) {
  const headers: Record<string, string> = {
    "x-trace-id": body.traceId,
    "x-v80-error-code": body.code,
  };
  if (body.status === 429) headers["retry-after"] = "60";
  return Response.json(
    { ok: false, code: body.code, message: body.message, traceId: body.traceId },
    { status: body.status, headers },
  );
}
