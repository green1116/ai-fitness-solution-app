import { CP_ACCESS_CANONICAL_ID, CP_ACCESS_VERSION } from "../shared/constants";
import type { DeliverablePdfRequest, DeliverablePdfResult } from "./deliverable-pdf-types";

export async function runDeliverablePdfRuntime(
  request: DeliverablePdfRequest,
): Promise<DeliverablePdfResult> {
  const { routeDeliverablePdf } = await import("./deliverable-pdf-router");
  return routeDeliverablePdf(request);
}

export function getDeliverablePdfRuntimeMeta() {
  return {
    runtimeId: "cp-deliverable-pdf-runtime-v47-p2-s4",
    version: CP_ACCESS_VERSION,
    mode: CP_ACCESS_CANONICAL_ID,
  };
}
