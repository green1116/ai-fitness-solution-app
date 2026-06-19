export const RELEASE_VERSION = "v47-commercial-products-p2-step10" as const;
export const CP_RELEASE_API_PATH = "/api/commercial-products/release" as const;
export const CP_RELEASE_PAGE_PATH = "/commercial/v47/release" as const;
export const CP_RELEASE_TAG = "v47-commercial-products-p2-step10" as const;
export const CP_RELEASE_PRODUCT_VERSION = "v47" as const;

export const RELEASE_STATUS = ["draft", "candidate", "released"] as const;
export type ReleaseStatus = (typeof RELEASE_STATUS)[number];

export const RELEASE_MODULE = [
  "quote",
  "portal",
  "summary",
  "router",
  "package",
  "orchestrator",
  "workspace",
  "approval",
  "audit",
] as const;

export type ReleaseModule = (typeof RELEASE_MODULE)[number];

export interface ReleaseVerification {
  tsc: boolean;
  build: boolean;
  verify: boolean;
}

export interface ReleaseRecord {
  releaseId: string;
  version: string;
  status: ReleaseStatus;
  tag: string;
  features: string[];
  verification: ReleaseVerification;
  createdAt: number;
  publishedAt?: number;
}

export interface ReleaseManifest {
  version: string;
  tag: string;
  modules: ReleaseModule[];
  features: string[];
  verification: ReleaseVerification;
  generatedAt: number;
}

export interface ReleaseLedgerEntry {
  ledgerId: string;
  releaseId: string;
  version: string;
  tag: string;
  status: ReleaseStatus;
  modules: ReleaseModule[];
  verification: ReleaseVerification;
  publishedAt: number;
}

export interface ReleaseCreateInput {
  version?: string;
  tag?: string;
  features?: string[];
  verification?: Partial<ReleaseVerification>;
}

export interface ReleasePublishInput {
  releaseId: string;
}

export interface ReleaseLookup {
  releaseId?: string;
  tag?: string;
  version?: string;
}

export interface ReleaseListResponse {
  ok: true;
  releases: ReleaseRecord[];
  ledger: ReleaseLedgerEntry[];
  manifest: ReleaseManifest;
}

export interface ReleaseRecordResponse {
  ok: true;
  release: ReleaseRecord;
  manifest: ReleaseManifest;
}

export interface ReleaseValidation {
  valid: boolean;
  runtimeOk: boolean;
  serviceOk: boolean;
  ledgerOk: boolean;
  manifestOk: boolean;
  apiPathRegistered: boolean;
  pagePathRegistered: boolean;
  summary: string;
}
