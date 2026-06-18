import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildMilestoneRegistry } from "../project-foundation/milestone-registry";
import { buildProjectRequirementLinks } from "../project-foundation/project-requirement-link";
import type { ExecutionStatus } from "../shared/constants";
import type { MilestoneRecord } from "../shared/types";
import {
  EXECUTION_TASK_TEMPLATES,
  type ExecutionTaskRecord,
  type ExecutionTaskRegistry,
} from "./execution-types";

const STATUS_CYCLE: ExecutionStatus[] = [
  "completed",
  "completed",
  "completed",
  "in-progress",
  "in-progress",
  "in-progress",
  "blocked",
  "planned",
];

function resolveRequirementsByProject(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const link of buildProjectRequirementLinks()) {
    const existing = map.get(link.projectId) ?? [];
    existing.push(link.requirementId);
    map.set(link.projectId, existing);
  }
  return map;
}

function resolveTaskStatus(milestone: MilestoneRecord, recordIndex: number): ExecutionStatus {
  if (milestone.status === "completed") return "completed";
  return STATUS_CYCLE[recordIndex % STATUS_CYCLE.length]!;
}

let cachedRegistry: ExecutionTaskRegistry | undefined;

export function buildExecutionTaskRegistry(): ExecutionTaskRegistry {
  if (cachedRegistry) return cachedRegistry;

  const requirementsByProject = resolveRequirementsByProject();
  const records: ExecutionTaskRecord[] = [];

  for (const milestone of buildMilestoneRegistry().records) {
    const templates = EXECUTION_TASK_TEMPLATES[milestone.phase];
    const requirementIds = requirementsByProject.get(milestone.projectId) ?? [];
    const requirementId = requirementIds[0];

    templates.forEach((template) => {
      const slug = template.name.replace(/\s+/g, "-");
      records.push({
        taskId: `pdi-task-${milestone.milestoneId}-${slug}`,
        milestoneId: milestone.milestoneId,
        requirementId,
        name: template.name,
        status: resolveTaskStatus(milestone, records.length),
      });
    });
  }

  cachedRegistry = {
    registryId: "pdi-execution-task-registry-v45-p2",
    records,
    count: records.length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
