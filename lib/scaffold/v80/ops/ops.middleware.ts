/** V80 CODE P4 — Production handler middleware (observe + govern + monetize) */
import { normalizeV80Error, enforceV80RateLimit, v80ErrorResponse } from "../api/stability";
import { V80RuntimeError } from "../runtime/errors";
import { newTraceId } from "../api/handler.util";
import { enforceV80CommercialGate, recordV80CommercialUsage } from "./commercial";
import { newCorrelationId, recordV80Request } from "./observability";
import { recordV80Audit } from "./governance";

function extractOrganizationId(req: Request): string | undefined {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("organizationId");
  if (fromQuery) return fromQuery;
  return req.headers.get("x-organization-id") ?? undefined;
}

async function extractOrganizationIdFromBody(req: Request): Promise<string | undefined> {
  const header = req.headers.get("x-organization-id");
  if (header) return header;
  try {
    const clone = req.clone();
    const body = (await clone.json()) as Record<string, unknown>;
    const id = body?.organizationId;
    return typeof id === "string" ? id : undefined;
  } catch {
    return undefined;
  }
}

export async function withProductionHandler(
  endpoint: string,
  fn: (ctx: { traceId: string; correlationId: string; req: Request }) => Promise<Response>,
  req: Request,
) {
  const traceId = newTraceId();
  const correlationId = newCorrelationId(traceId);
  const started = Date.now();
  let organizationId = extractOrganizationId(req);

  try {
    enforceV80RateLimit(req, endpoint);

    if (!organizationId && req.method !== "GET") {
      organizationId = await extractOrganizationIdFromBody(req);
    }

    await enforceV80CommercialGate({ endpoint, organizationId, traceId, correlationId });

    if (organizationId) {
      recordV80Audit({
        traceId,
        correlationId,
        organizationId,
        endpoint,
        action: "api.request",
        resultStatus: "success",
      });
    }

    const res = await fn({ traceId, correlationId, req });
    const status = res.status;

    if (organizationId && status >= 200 && status < 300) {
      const charge = await recordV80CommercialUsage({ endpoint, organizationId, traceId });
      recordV80Audit({
        traceId,
        correlationId,
        organizationId,
        endpoint,
        action: "api.success",
        resultStatus: "success",
        meta: charge ? { charge } : undefined,
      });
    }

    recordV80Request({
      endpoint,
      traceId,
      correlationId,
      durationMs: Date.now() - started,
      status,
      organizationId,
    });

    const headers = new Headers(res.headers);
    headers.set("x-trace-id", traceId);
    headers.set("x-correlation-id", correlationId);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  } catch (err) {
    const normalized = normalizeV80Error(err, traceId);
    recordV80Request({
      endpoint,
      traceId,
      correlationId,
      durationMs: Date.now() - started,
      status: normalized.status,
      organizationId,
    });

    if (organizationId) {
      recordV80Audit({
        traceId,
        correlationId,
        organizationId,
        endpoint,
        action: err instanceof V80RuntimeError && err.code === "FEATURE_GATE" ? "api.denied" : "api.error",
        resultStatus: err instanceof V80RuntimeError && err.code === "FEATURE_GATE" ? "denied" : "error",
        meta: { code: normalized.code },
      });
    }

    console.error(`[v80-ops] ${endpoint}`, err);
    return v80ErrorResponse(normalized);
  }
}
