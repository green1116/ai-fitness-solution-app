export interface QuoteExecutionLog {
  executionId: string;
  workspaceId: string;
  state: string;
  timestamp: string;
  message: string;
}

export interface QuoteExecutionLogCollector {
  entries: QuoteExecutionLog[];
  append(entry: Omit<QuoteExecutionLog, "timestamp"> & { timestamp?: string }): QuoteExecutionLog;
  toMessages(): string[];
}

export function createExecutionId(workspaceId: string): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `exec-${workspaceId.trim()}-${suffix}`;
}

export function createQuoteExecutionLog(input: {
  executionId: string;
  workspaceId: string;
  state: string;
  message: string;
  timestamp?: string;
}): QuoteExecutionLog {
  return {
    executionId: input.executionId,
    workspaceId: input.workspaceId,
    state: input.state,
    timestamp: input.timestamp ?? new Date().toISOString(),
    message: input.message,
  };
}

export function createQuoteExecutionLogCollector(executionId: string, workspaceId: string): QuoteExecutionLogCollector {
  const entries: QuoteExecutionLog[] = [];

  return {
    entries,
    append(input) {
      const entry = createQuoteExecutionLog({
        executionId,
        workspaceId,
        state: input.state,
        message: input.message,
        timestamp: input.timestamp,
      });
      entries.push(entry);
      return entry;
    },
    toMessages() {
      return entries.map(
        (entry) =>
          `[${entry.timestamp}] executionId=${entry.executionId} state=${entry.state} ${entry.message}`,
      );
    },
  };
}

export function describeQuoteExecutionLog(entry: QuoteExecutionLog): string {
  return `[${entry.timestamp}] ${entry.executionId} ${entry.state}: ${entry.message}`;
}
