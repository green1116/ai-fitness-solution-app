import type { DeliverablePackageRequest, DeliverablePackageResult } from "./deliverable-package-types";

export async function runDeliverablePackageRuntimeHeavy(
  request: DeliverablePackageRequest,
): Promise<DeliverablePackageResult> {
  const { runDeliverablePackageRuntime } = await import("./deliverable-package-runtime");
  return runDeliverablePackageRuntime(request);
}
