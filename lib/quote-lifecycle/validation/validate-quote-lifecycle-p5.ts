import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertV57ProductFrozen } from "@/lib/quote-product/validation/validate-quote-product-p8";
import { validateQuoteLifecycleP4 } from "./validate-quote-lifecycle-p4";
import { WORKSPACE_QUOTE_LIFECYCLE_P5_TAG } from "../freeze/v58-p5-meta";
import {
  createExecutionAcceptedEvent,
  createJobDispatchedEvent,
  createJobRegisteredEvent,
  createLifecycleChangedEvent,
} from "../events/quote-event.contract";
import { createQuoteEventEnvelope, withQuoteEventPayloadBase } from "../events/quote-event.envelope";
import {
  QUOTE_EVENT_TYPE_EXECUTION_DONE,
  QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
  QUOTE_EVENT_TYPE_JOB_STARTED,
  QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED,
} from "../events/quote-event.constants";
import {
  QUOTE_EXECUTION_STATUS_IN_PROGRESS,
  QUOTE_JOB_STATUS_DISPATCHED,
  QUOTE_JOB_STATUS_PENDING,
} from "../shared/quote-lifecycle-constants";
import { buildStatusSnapshot } from "../status-sync/quote-status.builder";
import { mapEventToLifecycleState } from "../status-sync/quote-status.mapper";
import { projectEventToStatus, projectEventsToStatus } from "../status-sync/quote-status.projector";
import { reduceQuoteStatus, updateStatusFromEvent } from "../status-sync/quote-status.reducer";
import {
  createQuoteStatusStore,
  getQuoteStatus,
  projectEventIntoStore,
  selectQuoteStatus,
} from "../status-sync/quote-status.selector";
import { createQuoteStatusSnapshot } from "../status-sync/quote-status.snapshot";
import {
  validateQuoteStatusSnapshot,
} from "../status-sync/quote-status.validation";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

export interface QuoteLifecycleP5Validation {
  valid: boolean;
  summary: string;
}

function getP5StatusSyncFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.types.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.snapshot.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.reducer.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.projector.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.selector.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.mapper.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.builder.ts"),
    join(LIFECYCLE_ROOT, "status-sync", "quote-status.validation.ts"),
    join(LIFECYCLE_ROOT, "validation", "validate-quote-lifecycle-p5.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p5-meta.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p5-final.ts"),
  ];
}

function getP5ScopedFiles(): string[] {
  return getP5StatusSyncFiles().filter((file) => !file.endsWith("validate-quote-lifecycle-p5.ts"));
}

export function assertHasStatusSnapshotP5(): boolean {
  const snapshotPath = join(LIFECYCLE_ROOT, "status-sync", "quote-status.snapshot.ts");
  const typesPath = join(LIFECYCLE_ROOT, "status-sync", "quote-status.types.ts");
  const snapshotContent = readFileSync(snapshotPath, "utf8");
  const typesContent = readFileSync(typesPath, "utf8");
  return (
    snapshotContent.includes("createQuoteStatusSnapshot") &&
    typesContent.includes("interface QuoteStatusSnapshot")
  );
}

export function assertHasStatusReducerP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.reducer.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("reduceQuoteStatus") && content.includes("updateStatusFromEvent");
}

export function assertHasStatusProjectorP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.projector.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("projectEventToStatus") && content.includes("projectEventsToStatus");
}

export function assertHasStatusSelectorP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.selector.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("selectQuoteStatus") && content.includes("getQuoteStatus");
}

export function assertHasStatusMapperP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.mapper.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("mapEventToLifecycleState") && content.includes("mapEventToStatusFields");
}

export function assertHasStatusBuilderP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.builder.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("buildStatusSnapshot") && content.includes("mergeStatusSnapshot");
}

export function assertHasStatusValidationP5(): boolean {
  const path = join(LIFECYCLE_ROOT, "status-sync", "quote-status.validation.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("validateQuoteStatusSnapshot") && content.includes("describeQuoteStatusSnapshot");
}

export function assertP5NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoWorker(): boolean {
  const pattern = /BullMQ|bullmq|Worker\(|new Worker|background worker|queue\.process|from\s+["']@\/lib\/.*worker/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoQueue(): boolean {
  const pattern = /from\s+["']bull|from\s+["']ioredis|from\s+["']redis|BullMQ|bullmq|amqplib|kafka/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoEventBusImpl(): boolean {
  const pattern =
    /EventEmitter|event-bus|eventBus|publishEvent|subscribeEvent|from\s+["']@\/lib\/.*event-bus|createEventBus|dispatchEvent\(/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoUILogic(): boolean {
  const pattern =
    /from\s+["']react["']|from\s+["']@\/lib\/quote-product\/ui|quote-ui\.|QuoteProductSurface|portal\//;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoRuntimeLogic(): boolean {
  const pattern =
    /from\s+["']@\/lib\/quote-runtime-integration|from\s+["']@\/lib\/quote-runtime\/|runQuoteEndToEndFlow|executeQuoteViaRuntimeClient|quote-runtime\.client|sendToRuntimeBridge/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP5NoV57Modification(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-product/;
  return getP5ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteStatusSync(): boolean {
  const quoteId = "quote-v58-p5";
  const workspaceId = "ws-v58-p5";
  const jobId = "job-v58-p5";
  const executionId = "exec-v58-p5";

  const events = [
    createLifecycleChangedEvent({
      quoteId,
      workspaceId,
      previousStatus: "IDLE",
      nextStatus: "QUEUED",
      jobId,
    }),
    createJobRegisteredEvent({
      quoteId,
      workspaceId,
      jobId,
      jobStatus: QUOTE_JOB_STATUS_PENDING,
    }),
    createJobDispatchedEvent({
      quoteId,
      workspaceId,
      jobId,
      jobStatus: QUOTE_JOB_STATUS_DISPATCHED,
    }),
    createQuoteEventEnvelope({
      eventType: QUOTE_EVENT_TYPE_JOB_STARTED,
      quoteId,
      workspaceId,
      jobId,
      payload: withQuoteEventPayloadBase({
        jobStatus: "ACTIVE",
      }),
    }),
    createExecutionAcceptedEvent({
      quoteId,
      workspaceId,
      executionId,
      jobId,
      executionStatus: "NOT_STARTED",
    }),
    createQuoteEventEnvelope({
      eventType: QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
      quoteId,
      workspaceId,
      jobId,
      executionId,
      payload: withQuoteEventPayloadBase({
        executionStatus: QUOTE_EXECUTION_STATUS_IN_PROGRESS,
      }),
    }),
    createQuoteEventEnvelope({
      eventType: QUOTE_EVENT_TYPE_EXECUTION_DONE,
      quoteId,
      workspaceId,
      jobId,
      executionId,
      payload: withQuoteEventPayloadBase({
        executionStatus: "DONE",
      }),
    }),
  ];

  const projected = projectEventsToStatus(quoteId, workspaceId, events);
  const store = createQuoteStatusStore();

  for (const event of events) {
    projectEventIntoStore(store, event);
  }

  const selected = getQuoteStatus(store, quoteId);
  const built = buildStatusSnapshot({ quoteId, workspaceId, lifecycleStatus: "QUEUED" });
  const initial = createQuoteStatusSnapshot({ quoteId, workspaceId });
  const reduced = reduceQuoteStatus(initial, events[0]!);
  const afterRegistered = reduceQuoteStatus(reduced.snapshot, events[1]!);
  const updated = updateStatusFromEvent(initial, events[1]!);
  const projection = projectEventToStatus(afterRegistered.snapshot, events[2]!);

  const illegalLifecycle = createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED,
    quoteId,
    workspaceId,
    payload: withQuoteEventPayloadBase({
      previousStatus: "SUCCEEDED",
      nextStatus: "IDLE",
    }),
  });
  const illegal = reduceQuoteStatus(projected, illegalLifecycle);

  return (
    validateQuoteStatusSnapshot(projected) &&
    projected.lifecycleStatus === "SUCCEEDED" &&
    projected.jobStatus === "DISPATCHED" &&
    projected.executionStatus === "DONE" &&
    selected?.quoteId === quoteId &&
    selectQuoteStatus(store, quoteId)?.lastEventType === QUOTE_EVENT_TYPE_EXECUTION_DONE &&
    validateQuoteStatusSnapshot(built) &&
    reduced.accepted &&
    reduced.snapshot.lifecycleStatus === "QUEUED" &&
    afterRegistered.accepted &&
    updated.accepted &&
    projection.accepted &&
    mapEventToLifecycleState(events[0]!) === "QUEUED" &&
    !illegal.accepted
  );
}

export function validateQuoteLifecycleP5(): QuoteLifecycleP5Validation {
  const p4Valid = validateQuoteLifecycleP4().valid;
  const v57Frozen = assertV57ProductFrozen();
  const mounted = assertMountedQuoteStatusSync();
  const valid =
    getP5StatusSyncFiles().every((file) => existsSync(file)) &&
    assertHasStatusSnapshotP5() &&
    assertHasStatusReducerP5() &&
    assertHasStatusProjectorP5() &&
    assertHasStatusSelectorP5() &&
    assertHasStatusMapperP5() &&
    assertHasStatusBuilderP5() &&
    assertHasStatusValidationP5() &&
    assertP5NoPrismaAccess() &&
    assertP5NoRepositoryAccess() &&
    assertP5NoWorker() &&
    assertP5NoQueue() &&
    assertP5NoEventBusImpl() &&
    assertP5NoUILogic() &&
    assertP5NoRuntimeLogic() &&
    assertP5NoV57Modification() &&
    p4Valid &&
    v57Frozen &&
    mounted;

  return {
    valid,
    summary: [`p5Tag=${WORKSPACE_QUOTE_LIFECYCLE_P5_TAG}`, `valid=${valid}`].join(" "),
  };
}
