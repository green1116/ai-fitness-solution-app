/**
 * V58 P7 — Quote Runtime Orchestrator Engine (single entry point)
 */

import type { QuoteHistoryStore } from "../history/quote-history.types";
import { dispatchOrchestrationFlow } from "./quote-orchestrator.dispatcher";
import { resolveLifecycleFlow } from "./quote-orchestrator.flow";
import type { QuoteOrchestrator, QuoteOrchestratorPorts } from "./quote-orchestrator.interface";
import { resolveOrchestratorPorts } from "./quote-orchestrator.resolver";
import {
  QUOTE_ORCHESTRATOR_VERSION,
  type QuoteOrchestrationInput,
  type QuoteOrchestrationResult,
} from "./quote-orchestrator.types";
import { validateOrchestrationInput } from "./quote-orchestrator.validation";

let orchestrationSequence = 0;

function nextOrchestrationId(): string {
  orchestrationSequence += 1;
  return `orch-${orchestrationSequence.toString(36).padStart(6, "0")}`;
}

export interface QuoteOrchestratorInstance extends QuoteOrchestrator {
  readonly ports: QuoteOrchestratorPorts;
  readonly historyStore: QuoteHistoryStore;
}

export function createQuoteOrchestrator(
  store?: QuoteHistoryStore,
): QuoteOrchestratorInstance {
  const resolved = resolveOrchestratorPorts(store);

  const orchestrator: QuoteOrchestratorInstance = {
    version: QUOTE_ORCHESTRATOR_VERSION,
    ports: {
      lifecycle: resolved.lifecycle,
      job: resolved.job,
      async: resolved.async,
      event: resolved.event,
      status: resolved.status,
      history: resolved.history,
    },
    historyStore: resolved.historyStore,
    run(input: QuoteOrchestrationInput): QuoteOrchestrationResult {
      return runQuoteOrchestration(input, orchestrator.ports);
    },
  };

  return orchestrator;
}

export function runQuoteOrchestration(
  input: QuoteOrchestrationInput,
  ports?: QuoteOrchestratorPorts,
): QuoteOrchestrationResult {
  const validation = validateOrchestrationInput(input);
  if (!validation.valid) {
    throw new Error(`Orchestration input invalid: ${validation.errors.join(", ")}`);
  }

  const resolvedPorts = ports ?? resolveOrchestratorPorts();

  const observedAt = input.observedAt ?? new Date().toISOString();
  const flow = resolveLifecycleFlow(input);

  if (flow.bypassAllowed) {
    throw new Error("Flow bypass is not allowed in V58 orchestrator");
  }

  const steps = dispatchOrchestrationFlow(
    {
      lifecycle: resolvedPorts.lifecycle,
      job: resolvedPorts.job,
      async: resolvedPorts.async,
      event: resolvedPorts.event,
      status: resolvedPorts.status,
      history: resolvedPorts.history,
    },
    input,
    observedAt,
  );

  const historyStep = steps.find((s) => s.step === "history");
  const statusStep = steps.find((s) => s.step === "status");

  return {
    orchestrationId: nextOrchestrationId(),
    version: QUOTE_ORCHESTRATOR_VERSION,
    context: {
      ...input.context,
      jobId:
        input.context.jobId ??
        (steps.find((s) => s.step === "job")?.metadata.jobId as string | undefined),
    },
    steps,
    aggregatedStatus: statusStep?.status ?? "unknown",
    deterministic: true,
    completedAt: observedAt,
    historyRecordCount: (historyStep?.metadata.recordCount as number) ?? 0,
  };
}

export function verifyOrchestrationDeterminism(
  input: QuoteOrchestrationInput,
): boolean {
  const { historyStore, ...ports } = resolveOrchestratorPorts();
  const fixedInput = { ...input, observedAt: input.observedAt ?? "2026-06-21T12:00:00.000Z" };
  const first = runQuoteOrchestration(fixedInput, ports);
  const second = runQuoteOrchestration(fixedInput, ports);
  void historyStore;
  return (
    first.steps.length === second.steps.length &&
    first.aggregatedStatus === second.aggregatedStatus &&
    first.steps.every(
      (s, i) => s.step === second.steps[i].step && s.status === second.steps[i].status,
    )
  );
}
