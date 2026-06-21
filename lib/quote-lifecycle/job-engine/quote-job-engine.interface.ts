import type { QuoteJobCommand } from "./quote-job-command.types";
import type { QuoteJobResult } from "./quote-job-result.types";
import type { QuoteJobEngineEntry } from "./quote-job-engine.types";
import { dispatchJob } from "./quote-job-engine.dispatcher";
import {
  createQuoteJobRegistry,
  getRegistryJob,
  registerJobInRegistry,
  type QuoteJobRegistry,
} from "./quote-job-engine.registry";
import { scheduleJob } from "./quote-job-engine.scheduler";
import { assertJobCommand } from "./quote-job-engine.validation";

export interface QuoteAsyncClientPlaceholder {
  submit(command: QuoteJobCommand): { accepted: boolean; note: string };
}

export interface QuoteJobEngine {
  register(job: QuoteJobCommand): void;
  dispatch(jobId: string): QuoteJobResult;
  schedule(jobId: string, options?: QuoteJobScheduleOptions): QuoteJobResult;
  getJob(jobId: string): QuoteJobCommand | undefined;
  getStatus(jobId: string): string;
  getEntry(jobId: string): QuoteJobEngineEntry | undefined;
}

export interface QuoteJobScheduleOptions {
  simulateFailure?: boolean;
  error?: string;
}

export interface QuoteJobEngineOptions {
  asyncClient?: QuoteAsyncClientPlaceholder;
}

export function createNoOpQuoteAsyncClientPlaceholder(): QuoteAsyncClientPlaceholder {
  return {
    submit(_command) {
      return {
        accepted: true,
        note: "P3 async client placeholder — no real execution",
      };
    },
  };
}

export function createQuoteJobEngine(options?: QuoteJobEngineOptions): QuoteJobEngine {
  const registry: QuoteJobRegistry = createQuoteJobRegistry();
  const asyncClient: QuoteAsyncClientPlaceholder =
    options?.asyncClient ?? createNoOpQuoteAsyncClientPlaceholder();

  return {
    register(job) {
      assertJobCommand(job);
      registerJobInRegistry(registry, job);
    },
    dispatch(jobId) {
      return dispatchJob(registry, jobId, asyncClient);
    },
    schedule(jobId, scheduleOptions) {
      return scheduleJob(registry, jobId, scheduleOptions);
    },
    getJob(jobId) {
      return getRegistryJob(registry, jobId)?.command;
    },
    getStatus(jobId) {
      return getRegistryJob(registry, jobId)?.resultStatus ?? "UNKNOWN";
    },
    getEntry(jobId) {
      return getRegistryJob(registry, jobId);
    },
  };
}

export function registerJob(engine: QuoteJobEngine, job: QuoteJobCommand): void {
  engine.register(job);
}

export function dispatchJobViaEngine(engine: QuoteJobEngine, jobId: string): QuoteJobResult {
  return engine.dispatch(jobId);
}

export function scheduleJobViaEngine(
  engine: QuoteJobEngine,
  jobId: string,
  options?: QuoteJobScheduleOptions,
): QuoteJobResult {
  return engine.schedule(jobId, options);
}
