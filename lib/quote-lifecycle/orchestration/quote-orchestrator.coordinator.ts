/**
 * V58 P7 — Quote Orchestration Coordinators (pure coordination, no execution)
 */

import type {
  QuoteAsyncPort,
  QuoteEventPort,
  QuoteHistoryPort,
  QuoteJobPort,
  QuoteLifecyclePort,
  QuoteOrchestratorPorts,
  QuoteStatusPort,
} from "./quote-orchestrator.interface";
import type {
  QuoteAsyncCoordinationResult,
  QuoteEventCoordinationResult,
  QuoteHistoryCoordinationResult,
  QuoteJobCoordinationResult,
  QuoteLifecycleCoordinationResult,
  QuoteOrchestrationContext,
  QuoteOrchestrationInput,
  QuoteStatusCoordinationResult,
} from "./quote-orchestrator.types";

export function coordinateLifecycleEngine(
  port: QuoteLifecyclePort,
  context: QuoteOrchestrationContext,
  input: QuoteOrchestrationInput,
): QuoteLifecycleCoordinationResult {
  return port.coordinate(context, input);
}

export function coordinateJobEngine(
  port: QuoteJobPort,
  context: QuoteOrchestrationContext,
  lifecycle: QuoteLifecycleCoordinationResult,
): QuoteJobCoordinationResult {
  return port.coordinate(context, lifecycle);
}

export function coordinateAsyncClient(
  port: QuoteAsyncPort,
  context: QuoteOrchestrationContext,
  job: QuoteJobCoordinationResult,
): QuoteAsyncCoordinationResult {
  return port.coordinate(context, job);
}

export function coordinateEventFlow(
  port: QuoteEventPort,
  context: QuoteOrchestrationContext,
  asyncResult: QuoteAsyncCoordinationResult,
  input: QuoteOrchestrationInput,
): QuoteEventCoordinationResult {
  return port.coordinate(context, asyncResult, input);
}

export function coordinateStatusSync(
  port: QuoteStatusPort,
  context: QuoteOrchestrationContext,
  event: QuoteEventCoordinationResult,
): QuoteStatusCoordinationResult {
  return port.coordinate(context, event);
}

export function coordinateHistory(
  port: QuoteHistoryPort,
  context: QuoteOrchestrationContext,
  status: QuoteStatusCoordinationResult,
  event: QuoteEventCoordinationResult,
  observedAt: string,
): QuoteHistoryCoordinationResult {
  return port.coordinate(context, status, event, observedAt);
}

export interface QuoteCoordinationChainResult {
  lifecycle: QuoteLifecycleCoordinationResult;
  job: QuoteJobCoordinationResult;
  async: QuoteAsyncCoordinationResult;
  event: QuoteEventCoordinationResult;
  status: QuoteStatusCoordinationResult;
  history: QuoteHistoryCoordinationResult;
}

export function runCoordinationChain(
  ports: QuoteOrchestratorPorts,
  input: QuoteOrchestrationInput,
  observedAt: string,
): QuoteCoordinationChainResult {
  const { context } = input;

  const lifecycle = coordinateLifecycleEngine(ports.lifecycle, context, input);
  const job = coordinateJobEngine(ports.job, context, lifecycle);
  const asyncResult = coordinateAsyncClient(ports.async, context, job);
  const event = coordinateEventFlow(ports.event, context, asyncResult, input);
  const status = coordinateStatusSync(ports.status, context, event);
  const history = coordinateHistory(ports.history, context, status, event, observedAt);

  return { lifecycle, job, async: asyncResult, event, status, history };
}
