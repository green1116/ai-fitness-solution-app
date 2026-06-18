import type { DeliverablePdfRequest, DeliverablePdfResult } from "../pdf/deliverable-pdf-types";

export async function runDeliverablePdfRuntimeHeavy(
  request: DeliverablePdfRequest,
): Promise<DeliverablePdfResult> {
  const { runDeliverablePdfRuntime } = await import("../pdf/deliverable-pdf-runtime");
  return runDeliverablePdfRuntime(request);
}
