/**
 * Launch L2 — Project lifecycle
 */

import { PROJECT_LIFECYCLE_STAGES } from "../pilot/pilot.constants";
import {
  getPilotProject,
  setPilotProject,
} from "./project.tracker";
import type {
  AdvanceProjectLifecycleInput,
  PilotProject,
  ProjectLifecycleStage,
} from "./project.types";

const ORDER: readonly ProjectLifecycleStage[] = PROJECT_LIFECYCLE_STAGES;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneProject(project: PilotProject): PilotProject {
  return { ...project, metadata: { ...project.metadata } };
}

export function advanceProjectLifecycle(
  input: AdvanceProjectLifecycleInput,
): PilotProject {
  const projectId = input.projectId.trim();
  if (!projectId) throw new Error("lifecycle.projectId is required");
  if (!(PROJECT_LIFECYCLE_STAGES as readonly string[]).includes(input.stage)) {
    throw new Error(`invalid project stage: ${input.stage}`);
  }

  const current = getPilotProject(projectId);
  if (!current) throw new Error(`pilot project not found: ${projectId}`);

  const currentIdx = ORDER.indexOf(current.stage);
  const nextIdx = ORDER.indexOf(input.stage);
  if (nextIdx < 0 || nextIdx < currentIdx) {
    throw new Error(
      `invalid lifecycle transition ${current.stage} -> ${input.stage}`,
    );
  }
  if (nextIdx > currentIdx + 1) {
    throw new Error(
      `lifecycle must advance one stage at a time (${current.stage} -> ${input.stage})`,
    );
  }

  const updated: PilotProject = {
    ...current,
    stage: input.stage,
    detail: `stage=${input.stage} progress=${current.progress}`,
    updatedAt: nowIso(),
  };
  setPilotProject(updated);
  return cloneProject(updated);
}
