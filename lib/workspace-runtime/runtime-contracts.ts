import type {
  ProjectRuntime,
  QuoteRuntime,
  ReportRuntime,
  RuntimeCapability,
  RuntimeStatus,
  WorkspaceRuntime,
  WorkspaceSurfaceRuntime,
} from "./runtime-types";
import type { WorkspaceRuntimeSurface } from "./shared/runtime-constants";

export interface RuntimeContractDescription {
  surface: WorkspaceRuntimeSurface;
  version: string;
  layer: "runtime-foundation";
  capability: RuntimeCapability;
}

export interface RuntimeContract<TRuntime extends WorkspaceSurfaceRuntime> {
  readonly surface: WorkspaceRuntimeSurface;
  readonly version: string;
  describe(): RuntimeContractDescription;
  validate(runtime: unknown): runtime is TRuntime;
  assertReady(runtime: TRuntime): boolean;
}

export interface WorkspaceRuntimeContract extends RuntimeContract<WorkspaceRuntime> {
  readonly surface: "workspace";
}

export interface QuoteRuntimeContract extends RuntimeContract<QuoteRuntime> {
  readonly surface: "quote";
}

export interface ProjectRuntimeContract extends RuntimeContract<ProjectRuntime> {
  readonly surface: "project";
}

export interface ReportRuntimeContract extends RuntimeContract<ReportRuntime> {
  readonly surface: "report";
}

export type AnyRuntimeContract =
  | WorkspaceRuntimeContract
  | QuoteRuntimeContract
  | ProjectRuntimeContract
  | ReportRuntimeContract;

export interface RuntimeContractRegistry {
  workspace: WorkspaceRuntimeContract;
  quote: QuoteRuntimeContract;
  project: ProjectRuntimeContract;
  report: ReportRuntimeContract;
}

export function isRuntimeStatus(value: unknown): value is RuntimeStatus {
  return value === "idle" || value === "ready" || value === "mounted" || value === "unavailable";
}

export function isRuntimeCapability(value: unknown): value is RuntimeCapability {
  return value === "foundation-only" || value === "entry-only" || value === "runtime-shell";
}
