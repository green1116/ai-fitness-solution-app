import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import type { QuoteApiAdapterPort } from "../ports/quote-api.adapter.port";
import { executeQuoteRuntimeFlow } from "../services/quote-runtime-orchestrator";
import { createQuoteWorkflowContext } from "../workflow/quote-workflow-context";
import { executeQuoteWorkflow } from "../workflow/quote-workflow-orchestrator";
import { QUOTE_WORKFLOW_STATE_EXPOSED } from "../workflow/quote-workflow-state";
import { createQuoteEndToEndContext } from "./quote-e2e-context";
import type {
  QuoteE2eApiResult,
  QuoteE2ePersistenceResult,
  QuoteEndToEndResult,
} from "./quote-e2e-result";

function buildPersistenceResult(input: {
  workspaceId: string;
  quoteId?: string;
  ports: QuotePortRegistry;
}): QuoteE2ePersistenceResult {
  const snapshot = input.ports.persistence.loadQuoteSnapshot(input.workspaceId);
  const exists = input.ports.persistence.exists(input.workspaceId);
  return {
    persisted: exists,
    quoteId: input.quoteId,
    exists,
    runtimeState: snapshot.runtimeState,
  };
}

function buildApiResult(input: {
  workspaceId: string;
  ports: QuotePortRegistry;
  workflowExposed: boolean;
}): QuoteE2eApiResult {
  const apiPort = input.ports.api as QuoteApiAdapterPort;
  const exposure = apiPort.exposeQuoteApi(input.workspaceId);
  return {
    exposed: input.workflowExposed && exposure.exposed,
    route: exposure.route,
    readiness: input.ports.api.getQuoteReadiness(input.workspaceId),
  };
}

export async function runQuoteEndToEndFlow(workspaceId: string): Promise<QuoteEndToEndResult> {
  const context = await createQuoteEndToEndContext(workspaceId);
  const logs: string[] = [
    `e2e.workspaceId=${context.workspaceId}`,
    `e2e.v55=${context.chainTags.v55}`,
    `e2e.p1=${context.chainTags.p1}`,
    `e2e.p2=${context.chainTags.p2}`,
    `e2e.p3=${context.chainTags.p3}`,
    `e2e.p4=${context.chainTags.p4}`,
    `e2e.p5=${context.chainTags.p5}`,
    `e2e.p6=${context.chainTags.p6}`,
    `e2e.v50=${context.chainTags.v50}`,
    `e2e.v51=${context.chainTags.v51}`,
    `e2e.runtimeState=${context.bridgeSnapshot.snapshot.runtimeState}`,
  ];

  const executionResult = executeQuoteRuntimeFlow(context.workspaceId, context.ports);
  logs.push(...executionResult.logs.map((entry) => `p1.${entry}`));

  const workflowResult = executeQuoteWorkflow(
    createQuoteWorkflowContext({
      workspaceId: context.workspaceId,
      ports: context.ports,
    }),
  );
  logs.push(...workflowResult.logs.map((entry) => `p5.${entry}`));

  const persistenceResult = buildPersistenceResult({
    workspaceId: context.workspaceId,
    quoteId: workflowResult.quoteId,
    ports: context.ports,
  });
  logs.push(
    `p3.persisted=${persistenceResult.persisted}`,
    `p3.exists=${persistenceResult.exists}`,
    `p3.runtimeState=${persistenceResult.runtimeState}`,
  );

  const apiResult = buildApiResult({
    workspaceId: context.workspaceId,
    ports: context.ports,
    workflowExposed: workflowResult.workflowState === QUOTE_WORKFLOW_STATE_EXPOSED,
  });
  logs.push(
    `p4.exposed=${apiResult.exposed}`,
    `p4.route=${apiResult.route}`,
    `p4.readiness=${apiResult.readiness}`,
  );

  return {
    executionResult,
    workflowResult,
    persistenceResult,
    apiResult,
    logs,
    auditTrail: workflowResult.auditTrail,
  };
}
