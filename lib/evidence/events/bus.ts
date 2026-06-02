import type { RuntimeOrchestrationContext } from "./context";
import type {
  RuntimeEvent,
  RuntimeEventBusOptions,
  RuntimeEventDispatchRecord,
  RuntimeEventHandler,
  RuntimeEventHandlerResult,
  RuntimeEventType,
} from "./types";
import { RuntimeEventTraceStore, summarizePayloadForTrace } from "./traces";

function newEventId() {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * V3.4-E16 — 确定性 Runtime Event Bus（同步优先，可控深度）
 */
export class RuntimeEventBus {
  private readonly handlers = new Map<RuntimeEventType, RuntimeEventHandler[]>();
  private readonly globalHandlers: RuntimeEventHandler[] = [];
  private readonly maxDepth: number;
  private readonly debug: boolean;
  readonly traceStore: RuntimeEventTraceStore;

  constructor(
    traceStore: RuntimeEventTraceStore,
    options?: RuntimeEventBusOptions,
  ) {
    this.traceStore = traceStore;
    this.maxDepth = options?.maxDispatchDepth ?? 12;
    this.debug = options?.debug ?? false;
  }

  on(type: RuntimeEventType, handler: RuntimeEventHandler, handlerId?: string) {
    const wrapped: RuntimeEventHandler = Object.assign(handler, {
      __handlerId: handlerId || handler.name || "anonymous",
    });
    const list = this.handlers.get(type) ?? [];
    list.push(wrapped);
    this.handlers.set(type, list);
    return () => {
      const current = this.handlers.get(type) ?? [];
      this.handlers.set(
        type,
        current.filter((h) => h !== wrapped),
      );
    };
  }

  onAny(handler: RuntimeEventHandler, handlerId?: string) {
    const wrapped: RuntimeEventHandler = Object.assign(handler, {
      __handlerId: handlerId || handler.name || "global",
    });
    this.globalHandlers.push(wrapped);
  }

  async publish(
    event: RuntimeEvent,
    ctx: RuntimeOrchestrationContext,
    depth = 0,
  ): Promise<RuntimeEventDispatchRecord> {
    if (depth > this.maxDepth) {
      this.traceStore.appendLog(`[bus] max depth exceeded for ${event.type}`);
      return {
        eventId: event.id,
        eventType: event.type,
        timestamp: event.payload.timestamp,
        handlerResults: [],
        childEventIds: [],
      };
    }

    const handlerResults: RuntimeEventHandlerResult[] = [];
    const childEventIds: string[] = [];
    const typedHandlers = this.handlers.get(event.type) ?? [];
    const allHandlers = [...typedHandlers, ...this.globalHandlers];
    const recordIndex = this.traceStore.beginRecord({
      eventId: event.id,
      eventType: event.type,
      timestamp: event.payload.timestamp,
    });

    if (this.debug) {
      this.traceStore.appendLog(
        `[bus] publish ${event.type} depth=${depth} handlers=${allHandlers.length}`,
      );
    }

    for (const handler of allHandlers) {
      const handlerId =
        (handler as RuntimeEventHandler & { __handlerId?: string }).__handlerId ??
        "handler";
      const started = Date.now();
      try {
        await handler(event, ctx);
        handlerResults.push({
          handlerId,
          ok: true,
          message: "completed",
          durationMs: Date.now() - started,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "handler failed";
        handlerResults.push({
          handlerId,
          ok: false,
          message,
          error: message,
          durationMs: Date.now() - started,
        });
        this.traceStore.appendLog(`[bus] handler ${handlerId} failed: ${message}`);
      }
    }

    const record: RuntimeEventDispatchRecord = {
      eventId: event.id,
      eventType: event.type,
      timestamp: event.payload.timestamp,
      handlerResults,
      childEventIds,
    };
    this.traceStore.appendRecord(record);

    return record;
  }

  createEvent(
    type: RuntimeEventType,
    payload: Omit<import("./types").RuntimeEventPayload, "timestamp"> & {
      timestamp?: string;
    },
  ): RuntimeEvent {
    return {
      id: newEventId(),
      type,
      payload: {
        ...payload,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      },
    };
  }

  /** 由 handler 发布后续事件（记录父子关联） */
  async emit(
    type: RuntimeEventType,
    ctx: RuntimeOrchestrationContext,
    partial: Partial<import("./types").RuntimeEventPayload>,
    parentEventId?: string,
    depth = 0,
  ): Promise<RuntimeEvent> {
    const event = this.createEvent(type, {
      traceId: ctx.correlation.traceId,
      correlationId: ctx.correlation.correlationId,
      jobId: ctx.correlation.jobId,
      planId: ctx.correlation.planId,
      tenderId: ctx.correlation.tenderId,
      documentId: ctx.correlation.documentId ?? ctx.runId,
      source: partial.source ?? `runtime/${type}`,
      ...partial,
    });

    await this.publish(event, ctx, depth + 1);
    if (parentEventId) {
      this.traceStore.linkChild(parentEventId, event.id);
    }

    if (this.debug) {
      this.traceStore.appendLog(
        `[bus] emit ${type} ${JSON.stringify(summarizePayloadForTrace(type, event.payload))}`,
      );
    }

    return event;
  }
}
