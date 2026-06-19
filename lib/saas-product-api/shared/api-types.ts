import type { SaasProductApiAuditReport } from "../audit/audit-types";
import type {
  PersistenceBackend,
  PersistenceRuntime,
  QuoteRecord,
  WorkflowEventRecord,
  WorkflowHistoryRecord,
  WorkflowRecord,
} from "@/lib/saas-product-persistence";
import type { ApiErrorCode } from "./api-errors";
import type { WorkspaceRecord } from "@/lib/saas-product-persistence";
import type {
  SAAS_PRODUCT_API_P1_TAG,
  SAAS_PRODUCT_API_P2_TAG,
  SAAS_PRODUCT_API_P3_TAG,
  SAAS_PRODUCT_API_P4_TAG,
  SAAS_PRODUCT_API_P5_TAG,
  SAAS_PRODUCT_API_P6_TAG,
  SAAS_PRODUCT_API_P7_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "./api-constants";

export interface ApiErrorBody {
  ok: false;
  code: ApiErrorCode;
  message: string;
}

export interface ApiSuccessBody<T> {
  ok: true;
  data: T;
  meta?: ApiResponseMeta;
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export interface ApiResponseMeta {
  tag:
    | typeof SAAS_PRODUCT_API_P1_TAG
    | typeof SAAS_PRODUCT_API_P2_TAG
    | typeof SAAS_PRODUCT_API_P3_TAG
    | typeof SAAS_PRODUCT_API_P4_TAG
    | typeof SAAS_PRODUCT_API_P5_TAG
    | typeof SAAS_PRODUCT_API_P6_TAG
    | typeof SAAS_PRODUCT_API_P7_TAG;
  version: typeof SAAS_PRODUCT_API_VERSION;
}

export interface ApiContext {
  tenantId: string | null;
  userId?: string;
  actor: string;
  runtime: PersistenceRuntime;
  backend: PersistenceBackend;
}

export interface HealthApiData {
  ok: true;
  tag: typeof SAAS_PRODUCT_API_P1_TAG;
  version: typeof SAAS_PRODUCT_API_VERSION;
  backend: PersistenceBackend;
  v50Tag: string;
}

export interface ApiP1Validation {
  valid: boolean;
  summary: string;
}

export interface MeApiData {
  tenantId: string;
  userId: string;
}

export interface ApiP2Validation {
  valid: boolean;
  summary: string;
}

export interface WorkspaceApiData {
  workspace: WorkspaceRecord;
}

export interface WorkspaceListApiData {
  workspaces: WorkspaceRecord[];
}

export interface ApiP3Validation {
  valid: boolean;
  summary: string;
}

export interface QuoteApiData {
  quote: QuoteRecord;
}

export interface QuoteCreateApiData {
  quote: QuoteRecord;
  workflow: WorkflowRecord;
}

export interface QuoteListApiData {
  quotes: QuoteRecord[];
}

export interface ApiP4Validation {
  valid: boolean;
  summary: string;
}

export interface WorkflowGetApiData {
  workflow: WorkflowRecord;
}

export interface WorkflowListApiData {
  workflows: WorkflowRecord[];
}

export interface WorkflowTransitionApiData {
  workflow: WorkflowRecord;
  history: WorkflowHistoryRecord;
  event: WorkflowEventRecord;
}

export interface ApiP5Validation {
  valid: boolean;
  summary: string;
}

export interface WorkflowHistoryListApiData {
  history: WorkflowHistoryRecord[];
}

export interface WorkflowEventListApiData {
  events: WorkflowEventRecord[];
}

export interface ApiP6Validation {
  valid: boolean;
  summary: string;
}

export interface ApiP7Validation {
  valid: boolean;
  summary: string;
  report?: SaasProductApiAuditReport;
}

export interface ApiP8Validation {
  valid: boolean;
  summary: string;
  metaLocked?: boolean;
  documentationReady?: boolean;
  auditStatus?: string;
  routeCount?: number;
  endpointCount?: number;
}
