import type { QuoteJobCommand } from "./quote-job-command.types";
import type { QuoteJobEngineEntry } from "./quote-job-engine.types";
import { createQuoteJobEngineEntry } from "./quote-job-engine.state";

export type QuoteJobRegistry = Map<string, QuoteJobEngineEntry>;

export function createQuoteJobRegistry(): QuoteJobRegistry {
  return new Map<string, QuoteJobEngineEntry>();
}

export function registerJobInRegistry(registry: QuoteJobRegistry, command: QuoteJobCommand): QuoteJobEngineEntry {
  const entry = createQuoteJobEngineEntry(command);
  registry.set(command.jobId, entry);
  return entry;
}

export function getRegistryJob(
  registry: QuoteJobRegistry,
  jobId: string,
): QuoteJobEngineEntry | undefined {
  return registry.get(jobId.trim());
}

export function setRegistryJob(registry: QuoteJobRegistry, entry: QuoteJobEngineEntry): void {
  registry.set(entry.command.jobId, entry);
}

export function hasRegistryJob(registry: QuoteJobRegistry, jobId: string): boolean {
  return registry.has(jobId.trim());
}
