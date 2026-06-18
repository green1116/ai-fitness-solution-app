import { MILESTONE_PHASES, PDI_CANONICAL_ID } from "../shared/constants";
import type { MilestoneRecord } from "../shared/types";
import { buildProjectRegistry } from "./project-registry";
import type { MilestoneRegistry } from "./project-types";

const MILESTONE_NAMES: Record<(typeof MILESTONE_PHASES)[number], string> = {
  design: "Design",
  procurement: "Procurement",
  installation: "Installation",
  acceptance: "Acceptance",
};

const MILESTONE_OFFSET_DAYS: Record<(typeof MILESTONE_PHASES)[number], number> = {
  design: 30,
  procurement: 60,
  installation: 90,
  acceptance: 120,
};

function buildTargetDate(projectIndex: number, phaseIndex: number): string {
  const base = new Date("2025-06-01T00:00:00.000Z");
  base.setUTCDate(base.getUTCDate() + projectIndex * 14 + phaseIndex * 30);
  return base.toISOString().slice(0, 10);
}

function resolveMilestoneStatus(
  projectStatus: MilestoneRecord["status"] | ProjectRecordStatus,
  phaseIndex: number,
): MilestoneRecord["status"] {
  if (projectStatus === "completed") return "completed";
  if (projectStatus === "planned") return "planned";
  if (phaseIndex === 0) return "completed";
  if (phaseIndex === 1) return "active";
  return "planned";
}

type ProjectRecordStatus = "planned" | "active" | "completed";

let cachedRegistry: MilestoneRegistry | undefined;

export function buildMilestoneRegistry(): MilestoneRegistry {
  if (cachedRegistry) return cachedRegistry;

  const projects = buildProjectRegistry().records;
  const records: MilestoneRecord[] = [];

  projects.forEach((project, projectIndex) => {
    MILESTONE_PHASES.forEach((phase, phaseIndex) => {
      records.push({
        milestoneId: `pdi-milestone-${project.projectId}-${phase}`,
        projectId: project.projectId,
        name: MILESTONE_NAMES[phase],
        phase,
        targetDate: buildTargetDate(projectIndex, phaseIndex),
        status: resolveMilestoneStatus(project.status, phaseIndex),
      });
    });
  });

  cachedRegistry = {
    registryId: "pdi-milestone-registry-v45-p1",
    records,
    count: records.length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
