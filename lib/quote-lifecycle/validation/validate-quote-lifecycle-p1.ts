import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertV57ProductFrozen } from "@/lib/quote-product/validation/validate-quote-product-p8";
import { WORKSPACE_QUOTE_LIFECYCLE_P1_TAG } from "../freeze/v58-p1-meta";
import {
  createQuoteExecutionState,
  transitionQuoteExecutionStatus,
  validateQuoteExecutionState,
} from "../execution/quote-execution.state";
import {
  createQuoteJobState,
  transitionQuoteJobStatus,
} from "../job/quote-job.state";
import { validateQuoteJobState } from "../job/quote-job.validation";
import { reduceQuoteLifecycleState } from "../lifecycle/quote-lifecycle.reducer";
import { createQuoteLifecycleState } from "../lifecycle/quote-lifecycle.state";
import { canTransitionQuoteLifecycleStatus } from "../lifecycle/quote-lifecycle.transition";
import { validateQuoteLifecycleState } from "../lifecycle/quote-lifecycle.validation";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

export interface QuoteLifecycleP1Validation {
  valid: boolean;
  summary: string;
}

function getP1LifecycleFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.types.ts"),
    join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.state.ts"),
    join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.reducer.ts"),
    join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.transition.ts"),
    join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.validation.ts"),
    join(LIFECYCLE_ROOT, "job", "quote-job.types.ts"),
    join(LIFECYCLE_ROOT, "job", "quote-job.state.ts"),
    join(LIFECYCLE_ROOT, "job", "quote-job.validation.ts"),
    join(LIFECYCLE_ROOT, "execution", "quote-execution.types.ts"),
    join(LIFECYCLE_ROOT, "execution", "quote-execution.status.ts"),
    join(LIFECYCLE_ROOT, "execution", "quote-execution.state.ts"),
    join(LIFECYCLE_ROOT, "shared", "quote-lifecycle-constants.ts"),
    join(LIFECYCLE_ROOT, "validation", "validate-quote-lifecycle-p1.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p1-meta.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p1-final.ts"),
    join(LIFECYCLE_ROOT, "index.ts"),
  ];
}

function getP1ScopedFiles(): string[] {
  return getP1LifecycleFiles().filter((file) => !file.endsWith("validate-quote-lifecycle-p1.ts"));
}

export function assertHasLifecycleTypesP1(): boolean {
  const path = join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteLifecycleState") && content.includes("QuoteLifecycleStatus");
}

export function assertHasLifecycleStateP1(): boolean {
  const path = join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.state.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteLifecycleState");
}

export function assertHasLifecycleReducerP1(): boolean {
  const path = join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.reducer.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("reduceQuoteLifecycleState") && content.includes("transitionQuoteLifecycleStatus");
}

export function assertHasLifecycleTransitionP1(): boolean {
  const path = join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.transition.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("canTransitionQuoteLifecycleStatus") && content.includes("IDLE");
}

export function assertHasJobTypesP1(): boolean {
  const path = join(LIFECYCLE_ROOT, "job", "quote-job.types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteJobState") && content.includes("QuoteJobStatus");
}

export function assertHasExecutionTypesP1(): boolean {
  const executionTypes = readFileSync(join(LIFECYCLE_ROOT, "execution", "quote-execution.types.ts"), "utf8");
  const executionStatus = readFileSync(join(LIFECYCLE_ROOT, "execution", "quote-execution.status.ts"), "utf8");
  return (
    executionTypes.includes("interface QuoteExecutionState") &&
    executionStatus.includes("isQuoteExecutionTerminal")
  );
}

export function assertHasValidationP1(): boolean {
  const lifecycle = readFileSync(join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.validation.ts"), "utf8");
  const job = readFileSync(join(LIFECYCLE_ROOT, "job", "quote-job.validation.ts"), "utf8");
  const execution = readFileSync(join(LIFECYCLE_ROOT, "execution", "quote-execution.state.ts"), "utf8");
  return (
    lifecycle.includes("validateQuoteLifecycleState") &&
    job.includes("validateQuoteJobState") &&
    execution.includes("validateQuoteExecutionState")
  );
}

export function assertP1NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP1NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP1NoWorkerImpl(): boolean {
  const pattern = /BullMQ|bullmq|Worker\(|new Worker|background worker|queue\.process|from\s+["']@\/lib\/.*worker/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP1NoEventBusImpl(): boolean {
  const pattern = /EventEmitter|event-bus|eventBus|publishEvent|subscribeEvent|from\s+["']@\/lib\/.*event-bus/;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP1NoUILogic(): boolean {
  const pattern =
    /from\s+["']react["']|from\s+["']@\/lib\/quote-product\/ui|quote-ui\.|QuoteProductSurface|portal\//;
  return getP1ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteLifecycleModel(): boolean {
  const quoteId = "v58-p1-quote-lifecycle";
  let lifecycle = createQuoteLifecycleState({ quoteId });
  const path: Array<typeof lifecycle.status> = [
    "QUEUED",
    "SCHEDULED",
    "RUNNING",
    "PROCESSING",
    "SUCCEEDED",
  ];

  for (const nextStatus of path) {
    if (!canTransitionQuoteLifecycleStatus(lifecycle.status, nextStatus)) {
      return false;
    }
    const result = reduceQuoteLifecycleState(lifecycle, {
      type: "TRANSITION",
      nextStatus,
    });
    if (!result.accepted) {
      return false;
    }
    lifecycle = result.state;
  }

  const illegal = reduceQuoteLifecycleState(lifecycle, {
    type: "TRANSITION",
    nextStatus: "QUEUED",
  });

  const job = createQuoteJobState({ jobId: "job-v58-p1", quoteId });
  const dispatched = transitionQuoteJobStatus(job, "DISPATCHED");
  const execution = createQuoteExecutionState({ executionId: "exec-v58-p1", quoteId });
  const started = transitionQuoteExecutionStatus(execution, "STARTED");

  return (
    lifecycle.status === "SUCCEEDED" &&
    !illegal.accepted &&
    validateQuoteLifecycleState(lifecycle) &&
    validateQuoteJobState(dispatched.state) &&
    dispatched.accepted &&
    validateQuoteExecutionState(started.state) &&
    started.accepted
  );
}

export function validateQuoteLifecycleP1(): QuoteLifecycleP1Validation {
  const mounted = assertMountedQuoteLifecycleModel();
  const v57Frozen = assertV57ProductFrozen();
  const valid =
    getP1LifecycleFiles().every((file) => existsSync(file)) &&
    assertHasLifecycleTypesP1() &&
    assertHasLifecycleStateP1() &&
    assertHasLifecycleReducerP1() &&
    assertHasLifecycleTransitionP1() &&
    assertHasJobTypesP1() &&
    assertHasExecutionTypesP1() &&
    assertHasValidationP1() &&
    assertP1NoPrismaAccess() &&
    assertP1NoRepositoryAccess() &&
    assertP1NoWorkerImpl() &&
    assertP1NoEventBusImpl() &&
    assertP1NoUILogic() &&
    v57Frozen &&
    mounted;

  return {
    valid,
    summary: [`p1Tag=${WORKSPACE_QUOTE_LIFECYCLE_P1_TAG}`, `valid=${valid}`].join(" "),
  };
}
