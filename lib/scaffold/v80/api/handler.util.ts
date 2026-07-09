/** V80 CODE P4 — route handler utilities */
import { randomUUID } from "node:crypto";
import type { z } from "zod";

import { V80RuntimeError } from "../runtime/errors";
import { SCAFFOLD_TAG } from "../_scaffold.util";
import { withProductionHandler } from "../ops/ops.middleware";

export { enforceV80RateLimit } from "./stability";

export function newTraceId() {
  return randomUUID();
}

export async function parseJsonBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new V80RuntimeError("Invalid JSON body", "VALIDATION_ERROR", 400);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new V80RuntimeError(fields || "Validation failed", "VALIDATION_ERROR", 400);
  }
  return parsed.data;
}

export function parseQuery<T extends z.ZodType>(
  url: URL,
  schema: T,
): z.infer<T> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new V80RuntimeError(fields || "Validation failed", "VALIDATION_ERROR", 400);
  }
  return parsed.data;
}

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  init?: { status?: number; traceId?: string },
) {
  const traceId = init?.traceId;
  return Response.json(
    { ok: true, runtime: SCAFFOLD_TAG, ...(traceId ? { traceId } : {}), ...data },
    {
      status: init?.status ?? 200,
      headers: traceId ? { "x-trace-id": traceId } : undefined,
    },
  );
}

export async function withHandler(
  endpoint: string,
  fn: (ctx: { traceId: string; req: Request }) => Promise<Response>,
  req: Request,
) {
  return withProductionHandler(endpoint, fn, req);
}
