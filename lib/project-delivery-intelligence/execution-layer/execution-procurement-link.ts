import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildExecutionTaskRegistry } from "./execution-task-registry";
import type { ExecutionProcurementLink } from "./execution-types";

let cachedLinks: ExecutionProcurementLink[] | undefined;

export function buildExecutionProcurementLinks(): ExecutionProcurementLink[] {
  if (cachedLinks) return cachedLinks;

  const decisionsByRequirement = new Map(
    runProcurementDecisionEngine().map((decision) => [decision.requirementId, decision]),
  );

  const links: ExecutionProcurementLink[] = [];

  for (const task of buildExecutionTaskRegistry().records) {
    if (!task.requirementId) continue;

    const decision = decisionsByRequirement.get(task.requirementId);
    if (!decision || !decision.supplierId) continue;

    links.push({
      linkId: `pdi-execution-procurement-${task.taskId}`,
      taskId: task.taskId,
      requirementId: task.requirementId,
      decisionId: decision.decisionId,
      supplierId: decision.supplierId,
      productId: decision.productId,
      procurementLevel: decision.procurementLevel,
      mode: PDI_CANONICAL_ID,
    });

    task.supplierId = decision.supplierId;
    task.productId = decision.productId;
  }

  cachedLinks = links;
  return links;
}
