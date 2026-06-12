import { buildResponsePackContext } from "../bridge/response-bridge";
import type { ResponsePackBidderBrand } from "../shared/types";

export function buildResponsePackContextBundle(input?: {
  deploymentId?: string;
  bidderBrand?: ResponsePackBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "response-pack-context-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const context = buildResponsePackContext({ deploymentId, bidderBrand });
  return { context, contextReadiness: context.contextReadiness };
}
