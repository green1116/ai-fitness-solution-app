import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertV57ProductFrozen } from "@/lib/quote-product/validation/validate-quote-product-p8";
import { validateQuoteLifecycleP3 } from "./validate-quote-lifecycle-p3";
import { WORKSPACE_QUOTE_LIFECYCLE_P4_TAG } from "../freeze/v58-p4-meta";
import {
  buildQuoteEventContract,
  createExecutionAcceptedEvent,
  createJobDispatchedEvent,
  createJobRegisteredEvent,
  createLifecycleChangedEvent,
} from "../events/quote-event.contract";
import { createQuoteEventEnvelope } from "../events/quote-event.envelope";
import {
  mapExecutionStateToEventType,
  mapJobStateToEventType,
  mapLifecycleStatusToEventType,
} from "../events/quote-event.mapper";
import {
  normalizeQuoteEvent,
  validateQuoteEventEnvelope,
} from "../events/quote-event.validation";
import {
  QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  QUOTE_EVENT_TYPE_JOB_REGISTERED,
} from "../events/quote-event.constants";
import {
  QUOTE_EXECUTION_STATUS_NOT_STARTED,
  QUOTE_JOB_STATUS_DISPATCHED,
  QUOTE_JOB_STATUS_PENDING,
} from "../shared/quote-lifecycle-constants";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

export interface QuoteLifecycleP4Validation {
  valid: boolean;
  summary: string;
}

function getP4EventFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "events", "quote-event.types.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-event.envelope.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-event.contract.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-event.mapper.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-event.validation.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-lifecycle-event.types.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-job-event.types.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-execution-event.types.ts"),
    join(LIFECYCLE_ROOT, "events", "quote-event.constants.ts"),
    join(LIFECYCLE_ROOT, "validation", "validate-quote-lifecycle-p4.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p4-meta.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p4-final.ts"),
  ];
}

function getP4ScopedFiles(): string[] {
  return getP4EventFiles().filter((file) => !file.endsWith("validate-quote-lifecycle-p4.ts"));
}

export function assertHasEventContractP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-event.contract.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("buildQuoteEventContract") && content.includes("createLifecycleChangedEvent");
}

export function assertHasEventEnvelopeP4(): boolean {
  const envelopePath = join(LIFECYCLE_ROOT, "events", "quote-event.envelope.ts");
  const typesPath = join(LIFECYCLE_ROOT, "events", "quote-event.types.ts");
  const envelopeContent = readFileSync(envelopePath, "utf8");
  const typesContent = readFileSync(typesPath, "utf8");
  return (
    envelopeContent.includes("createQuoteEventEnvelope") &&
    typesContent.includes("interface QuoteEventEnvelope")
  );
}

export function assertHasEventTypesP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-event.constants.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("LIFECYCLE_CHANGED") && content.includes("QUOTE_EVENT_TYPES");
}

export function assertHasEventMapperP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-event.mapper.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("mapJobStateToEventType") &&
    content.includes("mapExecutionStateToEventType")
  );
}

export function assertHasEventValidationP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-event.validation.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("validateQuoteEventEnvelope") && content.includes("normalizeQuoteEvent");
}

export function assertHasLifecycleEventP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-lifecycle-event.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteLifecycleEvent") && content.includes("LIFECYCLE_CHANGED");
}

export function assertHasJobEventP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-job-event.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteJobEvent") && content.includes("JOB_REGISTERED");
}

export function assertHasExecutionEventP4(): boolean {
  const path = join(LIFECYCLE_ROOT, "events", "quote-execution-event.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteExecutionEvent") && content.includes("EXECUTION_ACCEPTED");
}

export function assertP4NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoWorker(): boolean {
  const pattern = /BullMQ|bullmq|Worker\(|new Worker|background worker|queue\.process|from\s+["']@\/lib\/.*worker/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoQueue(): boolean {
  const pattern = /from\s+["']bull|from\s+["']ioredis|from\s+["']redis|BullMQ|bullmq|amqplib|kafka/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoEventBusImpl(): boolean {
  const pattern =
    /EventEmitter|event-bus|eventBus|publishEvent|subscribeEvent|from\s+["']@\/lib\/.*event-bus|createEventBus|dispatchEvent\(/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoUILogic(): boolean {
  const pattern =
    /from\s+["']react["']|from\s+["']@\/lib\/quote-product\/ui|quote-ui\.|QuoteProductSurface|portal\//;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoV57Modification(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-product/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP4NoV56InternalImport(): boolean {
  const pattern =
    /from\s+["']@\/lib\/quote-runtime-integration\/(services|adapters|workflow|e2e|ports|reliability)|from\s+["']@\/lib\/quote-runtime\/|runQuoteEndToEndFlow|executeQuoteViaRuntimeClient/;
  return getP4ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteEventContract(): boolean {
  const contract = buildQuoteEventContract();
  const quoteId = "quote-v58-p4";
  const workspaceId = "ws-v58-p4";
  const jobId = "job-v58-p4";
  const executionId = "exec-v58-p4";

  const lifecycleEvent = createLifecycleChangedEvent({
    quoteId,
    workspaceId,
    previousStatus: "IDLE",
    nextStatus: "QUEUED",
    jobId,
    correlationId: "corr-v58-p4",
  });

  const registeredEvent = createJobRegisteredEvent({
    quoteId,
    workspaceId,
    jobId,
    jobStatus: QUOTE_JOB_STATUS_PENDING,
    causationId: lifecycleEvent.eventId,
  });

  const dispatchedEvent = createJobDispatchedEvent({
    quoteId,
    workspaceId,
    jobId,
    jobStatus: QUOTE_JOB_STATUS_DISPATCHED,
    causationId: registeredEvent.eventId,
  });

  const executionEvent = createExecutionAcceptedEvent({
    quoteId,
    workspaceId,
    executionId,
    jobId,
    executionStatus: QUOTE_EXECUTION_STATUS_NOT_STARTED,
    causationId: dispatchedEvent.eventId,
  });

  const normalized = normalizeQuoteEvent(executionEvent);

  const invalidEnvelope = createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_JOB_REGISTERED,
    quoteId: "",
    workspaceId,
    payload: { invalid: true },
  });

  return (
    contract.version.length > 0 &&
    contract.eventTypes.includes(QUOTE_EVENT_TYPE_JOB_DISPATCHED) &&
    mapJobStateToEventType("PENDING") === QUOTE_EVENT_TYPE_JOB_REGISTERED &&
    mapJobStateToEventType("DISPATCHED") === QUOTE_EVENT_TYPE_JOB_DISPATCHED &&
    mapExecutionStateToEventType("DONE") === "EXECUTION_DONE" &&
    mapLifecycleStatusToEventType("RUNNING") === "LIFECYCLE_CHANGED" &&
    validateQuoteEventEnvelope(lifecycleEvent) &&
    validateQuoteEventEnvelope(registeredEvent) &&
    validateQuoteEventEnvelope(dispatchedEvent) &&
    validateQuoteEventEnvelope(executionEvent) &&
    !validateQuoteEventEnvelope(invalidEnvelope) &&
    normalized.quoteId === quoteId &&
    normalized.payload.schemaVersion === contract.version
  );
}

export function validateQuoteLifecycleP4(): QuoteLifecycleP4Validation {
  const p3Valid = validateQuoteLifecycleP3().valid;
  const v57Frozen = assertV57ProductFrozen();
  const mounted = assertMountedQuoteEventContract();
  const valid =
    getP4EventFiles().every((file) => existsSync(file)) &&
    assertHasEventContractP4() &&
    assertHasEventEnvelopeP4() &&
    assertHasEventTypesP4() &&
    assertHasEventMapperP4() &&
    assertHasEventValidationP4() &&
    assertHasLifecycleEventP4() &&
    assertHasJobEventP4() &&
    assertHasExecutionEventP4() &&
    assertP4NoPrismaAccess() &&
    assertP4NoRepositoryAccess() &&
    assertP4NoWorker() &&
    assertP4NoQueue() &&
    assertP4NoEventBusImpl() &&
    assertP4NoUILogic() &&
    assertP4NoV57Modification() &&
    assertP4NoV56InternalImport() &&
    p3Valid &&
    v57Frozen &&
    mounted;

  return {
    valid,
    summary: [`p4Tag=${WORKSPACE_QUOTE_LIFECYCLE_P4_TAG}`, `valid=${valid}`].join(" "),
  };
}
