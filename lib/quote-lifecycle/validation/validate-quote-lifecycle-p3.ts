import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertV57ProductFrozen } from "@/lib/quote-product/validation/validate-quote-product-p8";
import { validateQuoteLifecycleP2 } from "./validate-quote-lifecycle-p2";
import { WORKSPACE_QUOTE_LIFECYCLE_P3_TAG } from "../freeze/v58-p3-meta";
import { createQuoteAsyncAdapter } from "../async/quote-async-client.adapter";
import {
  createAsyncGateway,
} from "../async/quote-async-client.gateway";
import {
  createQuoteAsyncClient,
  createQuoteAsyncClientForJobEngine,
} from "../async/quote-async-client.interface";
import { mapJobToAsyncRequest } from "../async/quote-async-client.mapper";
import {
  stubAsyncExecution,
  stubAsyncExecutionRunning,
} from "../async/quote-async-client.stub";
import {
  createQuoteJobEngine,
  dispatchJobViaEngine,
  registerJob,
} from "../job-engine/quote-job-engine.interface";
import {
  createQuoteRuntimeBridgeRunningStub,
  createQuoteRuntimeBridgeStub,
  sendToRuntimeBridge,
} from "../integration/quote-runtime.bridge";
import { QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE } from "../shared/quote-lifecycle-constants";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

export interface QuoteLifecycleP3Validation {
  valid: boolean;
  summary: string;
}

function getP3AsyncFiles(): string[] {
  return [
    join(LIFECYCLE_ROOT, "async", "quote-async-client.types.ts"),
    join(LIFECYCLE_ROOT, "async", "quote-async-client.interface.ts"),
    join(LIFECYCLE_ROOT, "async", "quote-async-client.adapter.ts"),
    join(LIFECYCLE_ROOT, "async", "quote-async-client.gateway.ts"),
    join(LIFECYCLE_ROOT, "async", "quote-async-client.mapper.ts"),
    join(LIFECYCLE_ROOT, "async", "quote-async-client.stub.ts"),
    join(LIFECYCLE_ROOT, "integration", "quote-runtime.bridge.ts"),
    join(LIFECYCLE_ROOT, "validation", "validate-quote-lifecycle-p3.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p3-meta.ts"),
    join(LIFECYCLE_ROOT, "freeze", "v58-p3-final.ts"),
  ];
}

function getP3ScopedFiles(): string[] {
  return getP3AsyncFiles().filter((file) => !file.endsWith("validate-quote-lifecycle-p3.ts"));
}

export function assertHasAsyncClientP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "async", "quote-async-client.interface.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteAsyncClient") && content.includes("interface QuoteAsyncClient");
}

export function assertHasAsyncAdapterP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "async", "quote-async-client.adapter.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuoteAsyncAdapter") && content.includes("invoke");
}

export function assertHasAsyncGatewayP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "async", "quote-async-client.gateway.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createAsyncGateway") && content.includes("submitAsyncExecution");
}

export function assertHasAsyncMapperP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "async", "quote-async-client.mapper.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("mapJobToAsyncRequest") &&
    content.includes("mapRuntimeResponseToAsyncResponse")
  );
}

export function assertHasRuntimeBridgeP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "integration", "quote-runtime.bridge.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("sendToRuntimeBridge") &&
    content.includes("interface QuoteRuntimeBridgeClient")
  );
}

export function assertHasStubImplementationP3(): boolean {
  const path = join(LIFECYCLE_ROOT, "async", "quote-async-client.stub.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("stubAsyncExecution") && content.includes("ACCEPTED");
}

export function assertP3NoPrismaAccess(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoRepositoryAccess(): boolean {
  const pattern =
    /persistenceRepositories|quoteRepository|from\s+["']@\/lib\/saas-product-persistence|createQuoteRepositoryBinding/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoWorker(): boolean {
  const pattern = /BullMQ|bullmq|Worker\(|new Worker|background worker|queue\.process|from\s+["']@\/lib\/.*worker/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoQueue(): boolean {
  const pattern = /from\s+["']bull|from\s+["']ioredis|from\s+["']redis|BullMQ|bullmq|amqplib|kafka/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoEventBus(): boolean {
  const pattern = /EventEmitter|event-bus|eventBus|publishEvent|subscribeEvent|from\s+["']@\/lib\/.*event-bus/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoUILogic(): boolean {
  const pattern =
    /from\s+["']react["']|from\s+["']@\/lib\/quote-product\/ui|quote-ui\.|QuoteProductSurface|portal\//;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoV57Modification(): boolean {
  const pattern = /from\s+["']@\/lib\/quote-product/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertP3NoV56InternalImport(): boolean {
  const pattern =
    /from\s+["']@\/lib\/quote-runtime-integration\/(services|adapters|workflow|e2e|ports|reliability)|from\s+["']@\/lib\/quote-runtime\/|runQuoteEndToEndFlow|executeQuoteViaRuntimeClient/;
  return getP3ScopedFiles().every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertMountedQuoteAsyncClient(): boolean {
  const command = {
    jobId: "job-v58-p3",
    quoteId: "quote-v58-p3",
    workspaceId: "ws-v58-p3",
    type: QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE,
  };

  const request = mapJobToAsyncRequest(command);
  const acceptedStub = stubAsyncExecution(request);
  const runningStub = stubAsyncExecutionRunning(request);

  const bridge = createQuoteRuntimeBridgeStub();
  const bridgeResponse = sendToRuntimeBridge(
    {
      jobId: request.jobId,
      quoteId: request.quoteId,
      workspaceId: request.workspaceId,
      executionId: request.executionId,
    },
    bridge,
  );

  const runningBridge = createQuoteRuntimeBridgeRunningStub();
  const runningBridgeResponse = sendToRuntimeBridge(
    {
      jobId: request.jobId,
      quoteId: request.quoteId,
      workspaceId: request.workspaceId,
    },
    runningBridge,
  );

  const adapter = createQuoteAsyncAdapter({ bridge });
  const gateway = createAsyncGateway({ bridge });
  const gatewayResult = gateway.submit(request);
  const client = createQuoteAsyncClient({ bridge });
  const clientResult = client.submitAsyncExecution(request);
  const adapterResponse = adapter.invoke(request);

  const engine = createQuoteJobEngine({
    asyncClient: createQuoteAsyncClientForJobEngine({ bridge }),
  });
  registerJob(engine, command);
  const dispatched = dispatchJobViaEngine(engine, command.jobId);

  return (
    acceptedStub.success &&
    acceptedStub.status === "ACCEPTED" &&
    runningStub.status === "RUNNING" &&
    bridgeResponse.status === "ACCEPTED" &&
    runningBridgeResponse.status === "RUNNING" &&
    gatewayResult.accepted &&
    clientResult.accepted &&
    adapterResponse.status === "ACCEPTED" &&
    dispatched.status === "DISPATCHED" &&
    dispatched.success
  );
}

export function validateQuoteLifecycleP3(): QuoteLifecycleP3Validation {
  const p2Valid = validateQuoteLifecycleP2().valid;
  const v57Frozen = assertV57ProductFrozen();
  const mounted = assertMountedQuoteAsyncClient();
  const valid =
    getP3AsyncFiles().every((file) => existsSync(file)) &&
    assertHasAsyncClientP3() &&
    assertHasAsyncAdapterP3() &&
    assertHasAsyncGatewayP3() &&
    assertHasAsyncMapperP3() &&
    assertHasRuntimeBridgeP3() &&
    assertHasStubImplementationP3() &&
    assertP3NoPrismaAccess() &&
    assertP3NoRepositoryAccess() &&
    assertP3NoWorker() &&
    assertP3NoQueue() &&
    assertP3NoEventBus() &&
    assertP3NoUILogic() &&
    assertP3NoV57Modification() &&
    assertP3NoV56InternalImport() &&
    p2Valid &&
    v57Frozen &&
    mounted;

  return {
    valid,
    summary: [`p3Tag=${WORKSPACE_QUOTE_LIFECYCLE_P3_TAG}`, `valid=${valid}`].join(" "),
  };
}
