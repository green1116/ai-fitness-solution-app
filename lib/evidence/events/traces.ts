import type {
  RuntimeEventDispatchRecord,
  RuntimeEventOrchestrationResult,
  RuntimeEventType,
  RuntimeOrchestrationFlags,
} from "./types";
import { RUNTIME_EVENT_ORCHESTRATION_VERSION } from "./types";

export class RuntimeEventTraceStore {
  private records: RuntimeEventDispatchRecord[] = [];
  private logLines: string[] = [];

  appendRecord(record: RuntimeEventDispatchRecord) {
    this.records.push(record);
    this.logLines.push(
      `[${record.timestamp}] ${record.eventType} handlers=${record.handlerResults.length} children=${record.childEventIds.length}`,
    );
  }

  /** 先登记父事件，再执行 handler，保证回放顺序为 父 → 子 */
  beginRecord(
    partial: Pick<
      RuntimeEventDispatchRecord,
      "eventId" | "eventType" | "timestamp"
    >,
  ): number {
    this.records.push({
      ...partial,
      handlerResults: [],
      childEventIds: [],
    });
    return this.records.length - 1;
  }

  finalizeRecord(
    index: number,
    update: Pick<
      RuntimeEventDispatchRecord,
      "handlerResults" | "childEventIds"
    >,
  ) {
    const current = this.records[index];
    if (!current) return;
    this.records[index] = { ...current, ...update };
    this.logLines.push(
      `[${current.timestamp}] ${current.eventType} handlers=${update.handlerResults.length} children=${update.childEventIds.length}`,
    );
  }

  linkChild(parentEventId: string, childEventId: string) {
    for (let i = this.records.length - 1; i >= 0; i -= 1) {
      if (this.records[i]?.eventId === parentEventId) {
        const ids = this.records[i]!.childEventIds;
        if (!ids.includes(childEventId)) ids.push(childEventId);
        return;
      }
    }
  }

  appendLog(line: string) {
    this.logLines.push(line);
  }

  toResult(input: {
    traceId: string;
    correlationId: string;
    flags: RuntimeOrchestrationFlags;
  }): RuntimeEventOrchestrationResult {
    return {
      version: RUNTIME_EVENT_ORCHESTRATION_VERSION,
      traceId: input.traceId,
      correlationId: input.correlationId,
      eventCount: this.records.length,
      dispatchCount: this.records.reduce(
        (n, r) => n + r.handlerResults.length,
        0,
      ),
      flags: { ...input.flags },
      records: [...this.records],
      log: [...this.logLines],
    };
  }

  formatReplay(): string {
    return this.records
      .map((r) => {
        const handlers = r.handlerResults
          .map((h) => `${h.handlerId}:${h.ok ? "ok" : "fail"}`)
          .join(",");
        return `${r.eventType} [${handlers}]`;
      })
      .join(" → ");
  }
}

export function summarizePayloadForTrace(
  type: RuntimeEventType,
  payload: import("./types").RuntimeEventPayload,
): Record<string, unknown> {
  return {
    type,
    traceId: payload.traceId,
    correlationId: payload.correlationId,
    currentState: payload.currentState,
    reason: payload.reason,
    riskLevel: payload.riskLevel,
    releaseDecision: payload.releaseDecision,
  };
}
