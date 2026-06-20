import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertMountedRuntimeVerificationEligibility,
  assertUnmountedRuntimeVerificationIneligibility,
  assertWorkspaceRuntimeVerificationContextContract,
  createWorkspaceRuntimeVerificationContext,
} from "../runtime-verification-context";
import {
  createVerificationSnapshot,
  hasVerification,
  registerVerification,
  resolveVerification,
  validateVerification,
} from "../runtime-verification";
import {
  assertRuntimeVerificationFoundationOnly,
  assertRuntimeVerificationHasAllStatuses,
  isRuntimeVerificationStatus,
  resolveVerificationEligibility,
  resolveVerificationStatus,
} from "../runtime-verification-validation";
import type { RuntimeP5Validation } from "../runtime-verification-types";
import { mountRuntimeLifecycleContext } from "../runtime-lifecycle-context";
import { attachRuntimeCapabilityToLifecycleContext } from "../runtime-capability-context";
import { WORKSPACE_RUNTIME_P5_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP5(): Promise<RuntimeP5Validation> {
  const verificationContext = createWorkspaceRuntimeVerificationContext({ workspaceId: "p5-validate" });

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-verification.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-verification-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-verification-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-verification-context.ts")) &&
    assertWorkspaceRuntimeVerificationContextContract(verificationContext) &&
    assertMountedRuntimeVerificationEligibility(verificationContext) &&
    assertUnmountedRuntimeVerificationIneligibility(verificationContext) &&
    validateVerification(verificationContext.verification);

  return {
    valid,
    summary: [
      `p5Tag=${WORKSPACE_RUNTIME_P5_TAG}`,
      `idleEligible=${verificationContext.verification.eligible}`,
      `mountedRules=${assertMountedRuntimeVerificationEligibility(verificationContext)}`,
      `unmountedRules=${assertUnmountedRuntimeVerificationIneligibility(verificationContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeVerificationContract(): boolean {
  const verificationPath = join(RUNTIME_ROOT, "runtime-verification.ts");
  const content = readFileSync(verificationPath, "utf8");
  return (
    content.includes("registerVerification") &&
    content.includes("resolveVerification") &&
    content.includes("listVerifications") &&
    content.includes("hasVerification") &&
    content.includes("validateVerification") &&
    content.includes("createVerificationSnapshot")
  );
}

export function assertRuntimeVerificationTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-verification-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("RuntimeVerification") &&
    content.includes("RuntimeVerificationStatus") &&
    content.includes("RuntimeVerificationSnapshot") &&
    content.includes("RuntimeVerificationResult")
  );
}

export function assertRuntimeVerificationValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-verification-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateRuntimeVerificationSnapshot") &&
    content.includes("resolveVerificationEligibility") &&
    content.includes("assertRuntimeVerificationLifecycleRules")
  );
}

export function assertRuntimeVerificationContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-verification-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeVerificationContext") &&
    content.includes("attachRuntimeVerificationToCapabilityContext") &&
    content.includes("assertWorkspaceRuntimeVerificationContextContract")
  );
}

export function assertRuntimeVerificationConcernFoundation(): boolean {
  const verificationContext = createWorkspaceRuntimeVerificationContext({ workspaceId: "verification-concerns" });
  const snapshot = verificationContext.verification;
  return (
    hasVerification(snapshot, "type-integrity") &&
    hasVerification(snapshot, "registry-consistency") &&
    hasVerification(snapshot, "lifecycle-consistency") &&
    hasVerification(snapshot, "capability-consistency") &&
    hasVerification(snapshot, "context-composition") &&
    Boolean(resolveVerification(snapshot, "type-integrity")) &&
    Boolean(resolveVerification(snapshot, "registry-consistency"))
  );
}

export function assertRuntimeVerificationRegistrationFoundation(): boolean {
  const verificationContext = createWorkspaceRuntimeVerificationContext({ workspaceId: "verification-register" });
  const mountedLifecycle = mountRuntimeLifecycleContext(verificationContext.capabilityContext.lifecycleContext);
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  let snapshot = createVerificationSnapshot(mountedCapability);
  const warningEntry = registerVerification(snapshot, "capability-consistency", {
    ...snapshot.entries["capability-consistency"],
    status: "warning",
    eligible: true,
  });
  return warningEntry.entries["capability-consistency"].status === "warning" && validateVerification(warningEntry);
}

export function assertRuntimeVerificationFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-verification.ts"),
    join(RUNTIME_ROOT, "runtime-verification-types.ts"),
    join(RUNTIME_ROOT, "runtime-verification-validation.ts"),
    join(RUNTIME_ROOT, "runtime-verification-context.ts"),
  ];
  const forbidden = [
    /@prisma\/client/,
    /saas-product-persistence/,
    /handleCreateQuote/,
    /calculateQuote/,
    /handleTransitionWorkflow/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

export {
  assertRuntimeVerificationHasAllStatuses,
  isRuntimeVerificationStatus,
  resolveVerificationEligibility,
  resolveVerificationStatus,
};
