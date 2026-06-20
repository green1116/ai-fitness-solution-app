import { assertAssemblyConsumesLifecycleViewOnly } from "./quote-runtime-verify-p5";
import { assertContextConsumesBridgeOnly } from "./quote-runtime-verify-p2";
import { assertDomainConsumesContextSnapshotOnly } from "./quote-runtime-verify-p3";
import { assertLifecycleConsumesDomainViewOnly } from "./quote-runtime-verify-p4";
import { assertPortConsumesAssemblySnapshotOnly } from "./quote-runtime-verify-p6";

export function assertBridgeOnlyToContext(): boolean {
  return assertContextConsumesBridgeOnly();
}

export function assertContextOnlyToDomain(): boolean {
  return assertDomainConsumesContextSnapshotOnly();
}

export function assertDomainOnlyToLifecycle(): boolean {
  return assertLifecycleConsumesDomainViewOnly();
}

export function assertLifecycleOnlyToAssembly(): boolean {
  return assertAssemblyConsumesLifecycleViewOnly();
}

export function assertAssemblyOnlyToPorts(): boolean {
  return assertPortConsumesAssemblySnapshotOnly();
}

export function assertQuoteRuntimeDependencyChain(): boolean {
  return (
    assertBridgeOnlyToContext() &&
    assertContextOnlyToDomain() &&
    assertDomainOnlyToLifecycle() &&
    assertLifecycleOnlyToAssembly() &&
    assertAssemblyOnlyToPorts()
  );
}
