import {
  SAAS_PRODUCT_API_P2_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import { apiTenantRequired } from "../shared/api-errors";
import type { ApiContext, ApiSuccessBody, MeApiData } from "../shared/api-types";

export async function handleMe(ctx: ApiContext): Promise<ApiSuccessBody<MeApiData>> {
  if (!ctx.tenantId?.trim() || !ctx.userId?.trim()) {
    throw apiTenantRequired("tenantId and userId are required");
  }

  return {
    ok: true,
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    },
    meta: {
      tag: SAAS_PRODUCT_API_P2_TAG,
      version: SAAS_PRODUCT_API_VERSION,
    },
  };
}
