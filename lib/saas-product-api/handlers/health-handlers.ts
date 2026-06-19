import { V50_META } from "@/lib/saas-product-persistence";
import {
  SAAS_PRODUCT_API_P1_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import type { ApiContext, ApiSuccessBody, HealthApiData } from "../shared/api-types";

export async function handleHealth(
  ctx: ApiContext,
): Promise<ApiSuccessBody<HealthApiData>> {
  return {
    ok: true,
    data: {
      ok: true,
      tag: SAAS_PRODUCT_API_P1_TAG,
      version: SAAS_PRODUCT_API_VERSION,
      backend: ctx.backend,
      v50Tag: V50_META.tag,
    },
    meta: {
      tag: SAAS_PRODUCT_API_P1_TAG,
      version: SAAS_PRODUCT_API_VERSION,
    },
  };
}
