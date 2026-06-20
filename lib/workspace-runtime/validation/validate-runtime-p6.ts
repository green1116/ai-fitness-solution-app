import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  assertMountedRuntimeEntryEligibility,
  assertUnmountedRuntimeEntryIneligibility,
  assertWorkspaceRuntimeEntryContextContract,
  createWorkspaceRuntimeEntryContext,
} from "../runtime-entry-context";
import {
  createEntrySnapshot,
  hasEntry,
  registerEntry,
  resolveEntry,
  validateEntry,
} from "../runtime-entry";
import {
  assertRuntimeEntryFoundationOnly,
  assertRuntimeEntryHasAllStatuses,
  isEntryStatus,
  resolveEntryEligibility,
  resolveEntryStatus,
} from "../runtime-entry-validation";
import type { RuntimeP6Validation } from "../runtime-entry-types";
import { mountRuntimeLifecycleContext } from "../runtime-lifecycle-context";
import { attachRuntimeCapabilityToLifecycleContext } from "../runtime-capability-context";
import { attachRuntimeVerificationToCapabilityContext } from "../runtime-verification-context";
import { WORKSPACE_RUNTIME_P6_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP6(): Promise<RuntimeP6Validation> {
  const entryContext = createWorkspaceRuntimeEntryContext({ workspaceId: "p6-validate" });

  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-entry.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-entry-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-entry-validation.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-entry-context.ts")) &&
    assertWorkspaceRuntimeEntryContextContract(entryContext) &&
    assertMountedRuntimeEntryEligibility(entryContext) &&
    assertUnmountedRuntimeEntryIneligibility(entryContext) &&
    validateEntry(entryContext.entry);

  return {
    valid,
    summary: [
      `p6Tag=${WORKSPACE_RUNTIME_P6_TAG}`,
      `idleEligible=${entryContext.entry.eligible}`,
      `mountedRules=${assertMountedRuntimeEntryEligibility(entryContext)}`,
      `unmountedRules=${assertUnmountedRuntimeEntryIneligibility(entryContext)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeEntryContract(): boolean {
  const entryPath = join(RUNTIME_ROOT, "runtime-entry.ts");
  const content = readFileSync(entryPath, "utf8");
  return (
    content.includes("registerEntry") &&
    content.includes("resolveEntry") &&
    content.includes("listEntries") &&
    content.includes("hasEntry") &&
    content.includes("validateEntry") &&
    content.includes("createEntrySnapshot")
  );
}

export function assertRuntimeEntryTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-entry-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceEntry") &&
    content.includes("QuoteEntry") &&
    content.includes("ProjectEntry") &&
    content.includes("ReportEntry") &&
    content.includes("EntryKey") &&
    content.includes("EntryType") &&
    content.includes("EntryStatus") &&
    content.includes("EntrySnapshot") &&
    content.includes("EntryResult")
  );
}

export function assertRuntimeEntryValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-entry-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateEntrySnapshot") &&
    content.includes("resolveEntryEligibility") &&
    content.includes("assertRuntimeEntryLifecycleRules")
  );
}

export function assertRuntimeEntryContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-entry-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("createWorkspaceRuntimeEntryContext") &&
    content.includes("attachRuntimeEntryToVerificationContext") &&
    content.includes("assertWorkspaceRuntimeEntryContextContract")
  );
}

export function assertRuntimeEntrySurfaceFoundation(): boolean {
  const entryContext = createWorkspaceRuntimeEntryContext({ workspaceId: "entry-surfaces" });
  const snapshot = entryContext.entry;
  return (
    hasEntry(snapshot, "workspace") &&
    hasEntry(snapshot, "quote") &&
    hasEntry(snapshot, "project") &&
    hasEntry(snapshot, "report") &&
    Boolean(resolveEntry(snapshot, "workspace")) &&
    Boolean(resolveEntry(snapshot, "quote")) &&
    Boolean(resolveEntry(snapshot, "project")) &&
    Boolean(resolveEntry(snapshot, "report"))
  );
}

export function assertRuntimeEntryRegistrationFoundation(): boolean {
  const entryContext = createWorkspaceRuntimeEntryContext({ workspaceId: "entry-register" });
  const mountedLifecycle = mountRuntimeLifecycleContext(
    entryContext.verificationContext.capabilityContext.lifecycleContext,
  );
  const mountedCapability = attachRuntimeCapabilityToLifecycleContext(mountedLifecycle);
  const mountedVerification = attachRuntimeVerificationToCapabilityContext(mountedCapability);
  let snapshot = createEntrySnapshot(mountedVerification);
  const reservedEntry = registerEntry(snapshot, "quote", {
    ...snapshot.entries.quote,
    status: "reserved",
    eligible: true,
  });
  return reservedEntry.entries.quote.status === "reserved" && validateEntry(reservedEntry);
}

export function assertRuntimeEntryFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-entry.ts"),
    join(RUNTIME_ROOT, "runtime-entry-types.ts"),
    join(RUNTIME_ROOT, "runtime-entry-validation.ts"),
    join(RUNTIME_ROOT, "runtime-entry-context.ts"),
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
  assertRuntimeEntryHasAllStatuses,
  isEntryStatus,
  resolveEntryEligibility,
  resolveEntryStatus,
};
