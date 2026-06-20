import {
  assertMountedRuntimeCapabilityAvailability,
  assertWorkspaceRuntimeCapabilityContextContract,
  attachRuntimeCapabilityToLifecycleContext,
  createWorkspaceRuntimeCapabilityContext,
} from "./runtime-capability-context";
import type { WorkspaceRuntimeCapabilityContext } from "./runtime-capability-types";
import {
  mountRuntimeLifecycleContext,
  unmountRuntimeLifecycleContext,
} from "./runtime-lifecycle-context";
import {
  createVerificationSnapshot,
  describeRuntimeVerification,
  syncVerificationWithCapabilityContext,
  validateVerification,
} from "./runtime-verification";
import type { WorkspaceRuntimeVerificationContext } from "./runtime-verification-types";
import { assertRuntimeVerificationFoundationOnly } from "./runtime-verification-validation";
import {
  RUNTIME_VERIFICATION_VERSION,
  WORKSPACE_RUNTIME_P5_TAG,
} from "./shared/runtime-constants";

export interface CreateWorkspaceRuntimeVerificationContextInput {
  workspaceId: string;
}

export function attachRuntimeVerificationToCapabilityContext(
  capabilityContext: WorkspaceRuntimeCapabilityContext,
): WorkspaceRuntimeVerificationContext {
  const verification = createVerificationSnapshot(capabilityContext);
  return {
    workspaceId: capabilityContext.workspaceId,
    version: RUNTIME_VERIFICATION_VERSION,
    capabilityContext,
    verification,
  };
}

export function createWorkspaceRuntimeVerificationContext(
  input: CreateWorkspaceRuntimeVerificationContextInput,
): WorkspaceRuntimeVerificationContext {
  const capabilityContext = createWorkspaceRuntimeCapabilityContext({ workspaceId: input.workspaceId });
  return attachRuntimeVerificationToCapabilityContext(capabilityContext);
}

export function refreshRuntimeVerificationFromCapability(
  verificationContext: WorkspaceRuntimeVerificationContext,
): WorkspaceRuntimeVerificationContext {
  return {
    ...verificationContext,
    verification: syncVerificationWithCapabilityContext(
      verificationContext.capabilityContext,
      verificationContext.verification,
    ),
  };
}

export function resolveCapabilityContextFromVerificationContext(
  verificationContext: WorkspaceRuntimeVerificationContext,
): WorkspaceRuntimeCapabilityContext {
  return verificationContext.capabilityContext;
}

export function assertWorkspaceRuntimeVerificationContextContract(
  verificationContext: WorkspaceRuntimeVerificationContext,
): boolean {
  const { capabilityContext, verification } = verificationContext;

  return (
    verificationContext.version === RUNTIME_VERIFICATION_VERSION &&
    verificationContext.workspaceId.trim().length > 0 &&
    validateVerification(verification) &&
    assertRuntimeVerificationFoundationOnly() &&
    assertWorkspaceRuntimeCapabilityContextContract(capabilityContext) &&
    verification.lifecycleStatus === capabilityContext.lifecycleContext.lifecycle.status &&
    verification.eligible === false &&
    verification.aggregateStatus === "skipped" &&
    verification.entries["type-integrity"].status === "skipped"
  );
}

export function assertMountedRuntimeVerificationEligibility(
  verificationContext: WorkspaceRuntimeVerificationContext,
): boolean {
  const mountedLifecycle = mountRuntimeLifecycleContext(verificationContext.capabilityContext.lifecycleContext);
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);

  return (
    mountedVerification.verification.lifecycleStatus === "mounted" &&
    mountedVerification.verification.eligible === true &&
    mountedVerification.verification.aggregateStatus === "passed" &&
    mountedVerification.verification.entries["registry-consistency"].status === "passed" &&
    assertMountedRuntimeCapabilityAvailability(verificationContext.capabilityContext)
  );
}

export function assertUnmountedRuntimeVerificationIneligibility(
  verificationContext: WorkspaceRuntimeVerificationContext,
): boolean {
  const unmountedLifecycle = unmountRuntimeLifecycleContext(
    mountRuntimeLifecycleContext(verificationContext.capabilityContext.lifecycleContext),
  );
  const unmountedCapability = attachRuntimeCapabilityToLifecycleContext(unmountedLifecycle);
  const unmountedVerification = attachRuntimeVerificationToCapabilityContext(unmountedCapability);

  return (
    unmountedVerification.verification.lifecycleStatus === "unmounted" &&
    unmountedVerification.verification.eligible === false &&
    unmountedVerification.verification.aggregateStatus === "skipped" &&
    unmountedVerification.verification.entries["lifecycle-consistency"].status === "skipped"
  );
}

export function describeWorkspaceRuntimeVerificationContext(
  verificationContext: WorkspaceRuntimeVerificationContext,
): string {
  return [
    `tag=${WORKSPACE_RUNTIME_P5_TAG}`,
    describeRuntimeVerification(verificationContext.verification),
    `capabilityVersion=${verificationContext.capabilityContext.version}`,
  ].join(" ");
}
