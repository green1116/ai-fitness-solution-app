/**
 * V58 P7 — Quote Runtime Orchestrator Port Contracts
 */

import type {
  QuoteAsyncCoordinationResult,
  QuoteEventCoordinationResult,
  QuoteHistoryCoordinationResult,
  QuoteJobCoordinationResult,
  QuoteLifecycleCoordinationResult,
  QuoteOrchestrationContext,
  QuoteOrchestrationInput,
  QuoteOrchestrationResult,
  QuoteStatusCoordinationResult,
} from "./quote-orchestrator.types";

export interface QuoteLifecyclePort {
  readonly phase: "P1";
  coordinate(
    context: QuoteOrchestrationContext,
    input: QuoteOrchestrationInput,
  ): QuoteLifecycleCoordinationResult;
}

export interface QuoteJobPort {
  readonly phase: "P2";
  coordinate(
    context: QuoteOrchestrationContext,
    lifecycle: QuoteLifecycleCoordinationResult,
  ): QuoteJobCoordinationResult;
}

export interface QuoteAsyncPort {
  readonly phase: "P3";
  coordinate(
    context: QuoteOrchestrationContext,
    job: QuoteJobCoordinationResult,
  ): QuoteAsyncCoordinationResult;
}

export interface QuoteEventPort {
  readonly phase: "P4";
  coordinate(
    context: QuoteOrchestrationContext,
    asyncResult: QuoteAsyncCoordinationResult,
    input: QuoteOrchestrationInput,
  ): QuoteEventCoordinationResult;
}

export interface QuoteStatusPort {
  readonly phase: "P5";
  coordinate(
    context: QuoteOrchestrationContext,
    event: QuoteEventCoordinationResult,
  ): QuoteStatusCoordinationResult;
}

export interface QuoteHistoryPort {
  readonly phase: "P6";
  coordinate(
    context: QuoteOrchestrationContext,
    status: QuoteStatusCoordinationResult,
    event: QuoteEventCoordinationResult,
    observedAt: string,
  ): QuoteHistoryCoordinationResult;
}

export interface QuoteOrchestratorPorts {
  lifecycle: QuoteLifecyclePort;
  job: QuoteJobPort;
  async: QuoteAsyncPort;
  event: QuoteEventPort;
  status: QuoteStatusPort;
  history: QuoteHistoryPort;
}

export interface QuoteOrchestrator {
  readonly version: string;
  run(input: QuoteOrchestrationInput): QuoteOrchestrationResult;
}
