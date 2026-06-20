import type {
  ProjectRuntimeContract,
  QuoteRuntimeContract,
  ReportRuntimeContract,
  RuntimeContractRegistry,
  WorkspaceRuntimeContract,
} from "./runtime-contracts";
import {
  RUNTIME_FOUNDATION_CAPABILITY,
  RUNTIME_FOUNDATION_VERSION,
} from "./shared/runtime-constants";
import { isRuntimeCapability, isRuntimeStatus } from "./runtime-contracts";
import {
  validateProjectRuntime,
  validateQuoteRuntime,
  validateReportRuntime,
  validateRuntimeIdentity,
  validateRuntimeMetadataView,
  validateWorkspaceRuntime,
} from "./runtime-validation";

export const WORKSPACE_RUNTIME_CONTRACT: WorkspaceRuntimeContract = {
  surface: "workspace",
  version: RUNTIME_FOUNDATION_VERSION,
  describe: () => ({
    surface: "workspace",
    version: RUNTIME_FOUNDATION_VERSION,
    layer: "runtime-foundation",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
  }),
  validate: validateWorkspaceRuntime,
  assertReady: (runtime) => runtime.status === "ready" || runtime.status === "mounted",
};

export const QUOTE_RUNTIME_CONTRACT: QuoteRuntimeContract = {
  surface: "quote",
  version: RUNTIME_FOUNDATION_VERSION,
  describe: () => ({
    surface: "quote",
    version: RUNTIME_FOUNDATION_VERSION,
    layer: "runtime-foundation",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
  }),
  validate: validateQuoteRuntime,
  assertReady: (runtime) => runtime.status === "ready" || runtime.status === "mounted",
};

export const PROJECT_RUNTIME_CONTRACT: ProjectRuntimeContract = {
  surface: "project",
  version: RUNTIME_FOUNDATION_VERSION,
  describe: () => ({
    surface: "project",
    version: RUNTIME_FOUNDATION_VERSION,
    layer: "runtime-foundation",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
  }),
  validate: validateProjectRuntime,
  assertReady: (runtime) => runtime.status === "ready" || runtime.status === "mounted",
};

export const REPORT_RUNTIME_CONTRACT: ReportRuntimeContract = {
  surface: "report",
  version: RUNTIME_FOUNDATION_VERSION,
  describe: () => ({
    surface: "report",
    version: RUNTIME_FOUNDATION_VERSION,
    layer: "runtime-foundation",
    capability: RUNTIME_FOUNDATION_CAPABILITY,
  }),
  validate: validateReportRuntime,
  assertReady: (runtime) => runtime.status === "ready" || runtime.status === "mounted",
};

export const WORKSPACE_RUNTIME_CONTRACT_REGISTRY: RuntimeContractRegistry = {
  workspace: WORKSPACE_RUNTIME_CONTRACT,
  quote: QUOTE_RUNTIME_CONTRACT,
  project: PROJECT_RUNTIME_CONTRACT,
  report: REPORT_RUNTIME_CONTRACT,
};

export function assertRuntimeContractRegistryFoundationOnly(): boolean {
  const samples = WORKSPACE_RUNTIME_CONTRACT_REGISTRY;
  return (
    samples.workspace.surface === "workspace" &&
    samples.quote.surface === "quote" &&
    samples.project.surface === "project" &&
    samples.report.surface === "report" &&
    isRuntimeStatus("ready") &&
    isRuntimeCapability(RUNTIME_FOUNDATION_CAPABILITY) &&
    validateRuntimeIdentity({
      runtimeId: "workspace:sample",
      workspaceId: "sample",
      surface: "workspace",
    }) &&
    validateRuntimeMetadataView({
      phase: "P1",
      layer: "runtime-foundation",
      note: "contract registry foundation check",
    })
  );
}
