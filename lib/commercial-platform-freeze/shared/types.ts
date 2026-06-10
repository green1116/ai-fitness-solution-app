export const COMMERCIAL_PLATFORM_FREEZE_VERSION = "v18.0-commercial-platform-freeze-1" as const;

export type CommercialFreezeStatus = "success" | "failed";

export type CommercialFreezeStageStatus = "completed" | "failed";

export type CommercialLayerKey =
  | "revenue"
  | "enterprise"
  | "proposal"
  | "ai"
  | "knowledge"
  | "delivery"
  | "customer-success"
  | "go-to-market";

export interface CommercialFreezeStageResult {
  stageId: string;
  label: string;
  status: CommercialFreezeStageStatus;
  durationMs: number;
  message: string;
}

export interface CommercialFreezeRuntimeResult<TPayload> {
  version: typeof COMMERCIAL_PLATFORM_FREEZE_VERSION;
  runtimeId: string;
  domain: string;
  status: CommercialFreezeStatus;
  stages: CommercialFreezeStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface CapabilityInventoryEntry {
  layer: CommercialLayerKey;
  moduleId: string;
  domainId: string;
  capability: string;
  version: string;
  tag: string;
  status: "frozen";
}

export interface DependencyInventoryEntry {
  fromModule: string;
  toModule: string;
  layer: CommercialLayerKey;
  dependencyType: "read-only-bridge" | "evidence-chain" | "runtime-prerequisite";
  description: string;
}

export interface RuntimeInventoryEntry {
  layer: CommercialLayerKey;
  moduleId: string;
  domainId: string;
  runtimeFn: string;
  version: string;
  status: "frozen";
}

export interface ApiInventoryEntry {
  layer: CommercialLayerKey;
  moduleId: string;
  domainId: string;
  method: "GET";
  path: string;
  status: "frozen";
}

export interface VerifyInventoryEntry {
  layer: CommercialLayerKey;
  moduleId: string;
  domainId: string;
  script: string;
  npmCommand: string;
  status: "registered";
}

export interface DocumentationInventoryEntry {
  layer: CommercialLayerKey;
  version: string;
  tag: string;
  docPath: string;
  status: "frozen";
}

export interface CommercialPlatformInventories {
  capability: CapabilityInventoryEntry[];
  dependency: DependencyInventoryEntry[];
  runtime: RuntimeInventoryEntry[];
  api: ApiInventoryEntry[];
  verify: VerifyInventoryEntry[];
  documentation: DocumentationInventoryEntry[];
}

export interface CommercialPlatformReport {
  version: typeof COMMERCIAL_PLATFORM_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  freezeTag: string;
  layers: CommercialLayerKey[];
  moduleCount: number;
  domainCount: number;
  inventories: CommercialPlatformInventories;
  summary: string;
  generatedAt: string;
}

export interface CommercialPlatformEvidence {
  evidenceId: string;
  version: typeof COMMERCIAL_PLATFORM_FREEZE_VERSION;
  freezeTag: string;
  layers: CommercialLayerKey[];
  moduleEvidence: Array<{
    moduleId: string;
    layer: CommercialLayerKey;
    domainCount: number;
    allSuccess: boolean;
    summary: string;
  }>;
  inventories: CommercialPlatformInventories;
  generatedAt: string;
  summary: string;
}
