import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/runtime/api-route-policy";
import {
  getPersistenceRuntime,
  getResolvedPersistenceBackend,
} from "../adapter/get-persistence-runtime";
import { resolveApiTenant } from "./resolve-api-tenant";
import { API_ERROR_CODES, isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext, ApiSuccessBody } from "../shared/api-types";

export interface WithApiContextOptions {
  requireTenant?: boolean;
}

function mapErrorToResponse(error: unknown): NextResponse {
  if (isSaasProductApiError(error)) {
    return NextResponse.json(
      { ok: false, code: error.code, message: error.message },
      { status: error.status, headers: NO_STORE_HEADERS },
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json(
    { ok: false, code: API_ERROR_CODES.API_INTERNAL_ERROR, message },
    { status: 500, headers: NO_STORE_HEADERS },
  );
}

export async function withApiContext<T>(
  req: NextRequest,
  handler: (ctx: ApiContext) => Promise<ApiSuccessBody<T>>,
  options: WithApiContextOptions = {},
): Promise<NextResponse> {
  try {
    const runtime = getPersistenceRuntime();
    const backend = getResolvedPersistenceBackend();

    let tenantId: string | null = null;
    let userId: string | undefined;
    let actor = "api-shell";

    if (options.requireTenant) {
      const resolved = await resolveApiTenant(req.headers);
      tenantId = resolved.tenantId;
      userId = resolved.userId;
      actor = resolved.userId;
    }

    const ctx: ApiContext = {
      tenantId,
      userId,
      actor,
      runtime,
      backend,
    };

    const result = await handler(ctx);
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
