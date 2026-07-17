/**
 * E07-P1 — Digital Workforce Skill Registry
 */

import { SKILL_KINDS } from "../core/workforce.constants";
import type { SkillKind } from "../core/workforce.types";
import type {
  SkillDefinition,
  SkillRegistryManifest,
} from "./skill.types";

export const SKILL_CATALOG: SkillDefinition[] = [
  {
    id: "e07.skill.sense",
    kind: "sense",
    name: "Business Sensing",
    description: "Sense business signals from autonomous operations",
    inputHints: ["goal", "projectHint"],
    outputHints: ["signals", "context"],
    readOnly: true,
  },
  {
    id: "e07.skill.analyze",
    kind: "analyze",
    name: "Insight Analysis",
    description: "Analyze operation outputs into working conclusions",
    inputHints: ["signals", "history"],
    outputHints: ["conclusions", "confidence"],
    readOnly: true,
  },
  {
    id: "e07.skill.execute",
    kind: "execute",
    name: "Task Execution",
    description: "Execute bound autonomous operations to completion",
    inputHints: ["task", "constraints"],
    outputHints: ["outcome", "artifacts"],
    readOnly: true,
  },
  {
    id: "e07.skill.verify",
    kind: "verify",
    name: "Outcome Verification",
    description: "Verify outcomes against compliance gates",
    inputHints: ["outcome", "checklist"],
    outputHints: ["verdict", "findings"],
    readOnly: true,
  },
  {
    id: "e07.skill.report",
    kind: "report",
    name: "Status Reporting",
    description: "Report posture and escalations to stakeholders",
    inputHints: ["posture", "audience"],
    outputHints: ["report", "highlights"],
    readOnly: true,
  },
  {
    id: "e07.skill.coordinate",
    kind: "coordinate",
    name: "Workforce Coordination",
    description: "Coordinate digital workers across roles",
    inputHints: ["workers", "goal"],
    outputHints: ["plan", "assignments"],
    readOnly: true,
  },
];

export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILL_CATALOG.find((s) => s.id === id);
}

export function listSkillsByKind(kind: SkillKind): SkillDefinition[] {
  return SKILL_CATALOG.filter((s) => s.kind === kind);
}

export function buildSkillRegistryManifest(
  skills: SkillDefinition[] = SKILL_CATALOG,
): SkillRegistryManifest {
  const kinds = new Set(skills.map((s) => s.kind));
  const catalogComplete = SKILL_KINDS.every((k) => kinds.has(k));
  if (!catalogComplete) {
    throw new Error("Skill catalog incomplete: missing kinds");
  }

  return {
    skillCount: skills.length,
    kinds: [...kinds] as SkillKind[],
    skills,
    catalogComplete: true,
    readOnly: true,
  };
}
