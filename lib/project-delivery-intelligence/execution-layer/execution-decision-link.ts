import { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildExecutionTaskRegistry } from "./execution-task-registry";
import type { ExecutionDecisionLink } from "./execution-types";

let cachedLinks: ExecutionDecisionLink[] | undefined;

export function buildExecutionDecisionLinks(): ExecutionDecisionLink[] {
  if (cachedLinks) return cachedLinks;

  const links: ExecutionDecisionLink[] = [];

  for (const task of buildExecutionTaskRegistry().records) {
    if (!task.requirementId) continue;

    const decision = runEquivalentDecisionEngine(task.requirementId);
    if (!decision) continue;

    links.push({
      linkId: `pdi-execution-decision-${task.taskId}`,
      taskId: task.taskId,
      requirementId: task.requirementId,
      decisionId: decision.decisionId,
      productId: decision.optimalProductId,
      decisionLevel: decision.decisionLevel,
      mode: PDI_CANONICAL_ID,
    });

    if (!task.productId) {
      task.productId = decision.optimalProductId;
    }
  }

  cachedLinks = links;
  return links;
}
