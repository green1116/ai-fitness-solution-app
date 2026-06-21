import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteLifecycleP1 } from "./validate-quote-lifecycle-p1";
import { WORKSPACE_QUOTE_LIFECYCLE_P2_TAG } from "../freeze/v58-p2-meta";
import {
  createQuoteJobEngine,
  dispatchJobViaEngine,
  registerJob,
  scheduleJobViaEngine,
} from "../job-engine/quote-job-engine.interface";
import { transitionJobState } from "../job-engine/quote-job-engine.reducer";
import { createQuoteJobEngineEntry } from "../job-engine/quote-job-engine.state";
import {
  resolveJob,
  validateJobCommand,
  validateQuoteJobEngineEntry,
} from "../job-engine/quote-job-engine.validation";
import { createQuoteJobRegistry, registerJobInRegistry } from "../job-engine/quote-job-engine.registry";
import { dispatchJob } from "../job-engine/quote-job-engine.dispatcher";
import { scheduleJob } from "../job-engine/quote-job-engine.scheduler";
import { createNoOpQuoteAsyncClientPlaceholder } from "../job-engine/quote-job-engine.interface";
import { QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE } from "../shared/quote-lifecycle-constants";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

export interface QuoteLifecycleP2Validation {
  valid: boolean;
  summary: string;
}

function getP2JobEngineFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.types.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.state.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.interface.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.reducer.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.dispatcher.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.scheduler.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.registry.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.validation.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-command.types.ts"),
    join(LIFECYCLE_ROOT, "job-engine", "quote-job-result.types.ts"),
    join(LIFECYCLE_ROOT, "validation", "validate-quote-lifecycle-p2.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p2-meta.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p2-final.ts"),
  ];
}

function getP2ScopedFiles(): string[] {
  return getP2JobEngineFiles().filter((file) => !file.endsWith("validate-quote-lifecycle-p2.ts"));
}

export function assertHasJobEngineP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.interface.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteJobEngine") && content.includes("interface QuoteJobEngine");
}

export function assertHasJobDispatcherP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.dispatcher.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("dispatchJob") && content.includes("QuoteAsyncClientPlaceholder");
}

export function assertHasJobSchedulerP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.scheduler.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("scheduleJob") && content.includes("COMPLETED");
}

export function assertHasJobRegistryP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.registry.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteJobRegistry") && content.includes("Map<string");
}

export function assertHasJobCommandP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-command.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteJobCommand") && content.includes("EXECUTE_QUOTE");
}

export function assertHasJobResultP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-result.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteJobResult") && content.includes("executionId");
}

export function assertHasReducerP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.reducer.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("transitionJobState") && content.includes("transitionQuoteJobStatus");
}

export function assertHasValidationP2(): boolean {
  const path = join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.validation.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("validateJobCommand") && content.includes("resolveJob");
}

export function assertP2NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoWorker(): boolean {
  const pattern = /BullMQ|bullmq|Worker\(|new Worker|background worker|queue\.process|from\s+["']@\/lib\/.*worker/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoQueueSystem(): boolean {
  const pattern = /from\s+["']bull|from\s+["']ioredis|from\s+["']redis|BullMQ|bullmq|amqplib|kafka/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoEventBus(): boolean {
  const pattern = /EventEmitter|event-bus|eventBus|publishEvent|subscribeEvent|from\s+["']@\/lib\/.*event-bus/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoUILogic(): boolean {
  const pattern =
    /from\s+["']react["']|from\s+["']@\/lib\/quote-product\/ui|quote-ui\.|QuoteProductSurface|portal\//;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP2NoRuntimeImport(): boolean {
  const pattern =
    /from\s+["']@\/lib\/quote-runtime|from\s+["']@\/lib\/quote-product\/integration|from\s+["']@\/lib\/workspace-runtime|quote-runtime\.client/;
  return getP2ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteJobEngine(): boolean {
  const command = {
    jobId: "job-v58-p2",
    quoteId: "quote-v58-p2",
    workspaceId: "ws-v58-p2",
    type: QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE,
  };

  if (!validateJobCommand(command)) {
    return false;
  }

  const engine = createQuoteJobEngine();
  registerJob(engine, command);

  if (engine.getStatus(command.jobId) !== "QUEUED") {
    return false;
  }

  const dispatched = dispatchJobViaEngine(engine, command.jobId);
  if (dispatched.status !== "DISPATCHED" || !dispatched.success) {
    return false;
  }

  const scheduled = scheduleJobViaEngine(engine, command.jobId);
  if (scheduled.status !== "COMPLETED" || !scheduled.success || !scheduled.executionId) {
    return false;
  }

  const resolved = resolveJob(createQuoteJobRegistry(), command.jobId);
  if (resolved.resolved) {
    return false;
  }

  const entry = createQuoteJobEngineEntry(command);
  const illegal = transitionJobState(entry, "COMPLETED");
  if (illegal.accepted) {
    return false;
  }

  const registry = createQuoteJobRegistry();
  registerJobInRegistry(registry, command);
  const registryDispatch = dispatchJob(registry, command.jobId, createNoOpQuoteAsyncClientPlaceholder());
  const registrySchedule = scheduleJob(registry, command.jobId);
  const registryResolve = resolveJob(registry, command.jobId);

  return (
    validateQuoteJobEngineEntry(engine.getEntry(command.jobId)!) &&
    registryDispatch.status === "DISPATCHED" &&
    registrySchedule.status === "COMPLETED" &&
    registryResolve.resolved === true
  );
}

export function validateQuoteLifecycleP2(): QuoteLifecycleP2Validation {
  const p1Valid = validateQuoteLifecycleP1().valid;
  const mounted = assertMountedQuoteJobEngine();
  const valid =
    getP2JobEngineFiles().every((file) => existsSync(file)) &&
    assertHasJobEngineP2() &&
    assertHasJobDispatcherP2() &&
    assertHasJobSchedulerP2() &&
    assertHasJobRegistryP2() &&
    assertHasJobCommandP2() &&
    assertHasJobResultP2() &&
    assertHasReducerP2() &&
    assertHasValidationP2() &&
    assertP2NoPrismaAccess() &&
    assertP2NoRepositoryAccess() &&
    assertP2NoWorker() &&
    assertP2NoQueueSystem() &&
    assertP2NoEventBus() &&
    assertP2NoUILogic() &&
    assertP2NoRuntimeImport() &&
    p1Valid &&
    mounted;

  return {
    valid,
    summary: [`p2Tag=${WORKSPACE_QUOTE_LIFECYCLE_P2_TAG}`, `valid=${valid}`].join(" "),
  };
}
