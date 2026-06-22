/**
 * V58 P7 — Quote Orchestration Dispatcher (sequential flow control)
 */

import { resolveLifecycleFlow } from "./quote-orchestrator.flow";
import { runCoordinationChain } from "./quote-orchestrator.coordinator";
import type { QuoteOrchestratorPorts } from "./quote-orchestrator.interface";
import type {
  QuoteOrchestrationInput,
  QuoteOrchestrationStepResult,
} from "./quote-orchestrator.types";

export function dispatchOrchestrationFlow(
  ports: QuoteOrchestratorPorts,
  input: QuoteOrchestrationInput,
  observedAt: string,
): QuoteOrchestrationStepResult[] {
  const flow = resolveLifecycleFlow(input);
  const chain = runCoordinationChain(ports, input, observedAt);

  const steps: QuoteOrchestrationStepResult[] = [];

  for (const step of flow.steps) {
    switch (step) {
      case "lifecycle":
        steps.push({
          step,
          success: true,
          status: chain.lifecycle.status,
          metadata: {
            stepIndex: chain.lifecycle.stepIndex,
            lifecycleEventType: chain.lifecycle.lifecycleEventType,
          },
        });
        break;
      case "job":
        steps.push({
          step,
          success: true,
          status: chain.job.status,
          metadata: {
            jobId: chain.job.jobId,
            jobEventType: chain.job.jobEventType,
          },
        });
        break;
      case "async":
        steps.push({
          step,
          success: true,
          status: chain.async.status,
          metadata: {
            asyncHandle: chain.async.asyncHandle,
            clientEventType: chain.async.clientEventType,
          },
        });
        break;
      case "event":
        steps.push({
          step,
          success: true,
          status: "emitted",
          eventId: chain.event.eventId,
          metadata: {
            eventType: chain.event.eventType,
          },
        });
        break;
      case "status":
        steps.push({
          step,
          success: true,
          status: chain.status.syncedStatus,
          metadata: {
            syncEventType: chain.status.syncEventType,
          },
        });
        break;
      case "history":
        steps.push({
          step,
          success: true,
          status: "recorded",
          eventId: chain.history.lastEventId,
          metadata: {
            recordCount: chain.history.recordCount,
          },
        });
        break;
    }
  }

  return steps;
}
