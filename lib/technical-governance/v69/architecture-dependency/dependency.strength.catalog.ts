/**
 * V69 P2 — Architecture dependency strength catalog (declarative)
 */
import type {
  ArchitectureDependencyStrengthDefinition,
  ArchitectureDependencyStrengthManifest,
} from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";

export const ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG: ArchitectureDependencyStrengthDefinition[] =
  [
    {
      id: "ADEP-STR-001",
      level: "weak",
      weight: 1,
      couplingScore: 10,
      required: true,
      description: "Weak coupling — optional or best-effort dependency",
    },
    {
      id: "ADEP-STR-002",
      level: "moderate",
      weight: 2,
      couplingScore: 40,
      required: true,
      description: "Moderate coupling — degradable dependency",
    },
    {
      id: "ADEP-STR-003",
      level: "strong",
      weight: 3,
      couplingScore: 70,
      required: true,
      description: "Strong coupling — hard runtime dependency",
    },
    {
      id: "ADEP-STR-004",
      level: "critical",
      weight: 4,
      couplingScore: 95,
      required: true,
      description: "Critical coupling — outage propagates immediately",
    },
  ];

export function buildArchitectureDependencyStrengthManifest(): ArchitectureDependencyStrengthManifest {
  const strengths = ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG;
  const levels = new Set(strengths.map((s) => s.level));
  const catalogComplete = strengths.length >= 4 && levels.size >= 4;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    strengthCount: strengths.length,
    levelCount: levels.size,
    catalogComplete,
    strengths,
    summary: [
      `dependency-strengths count=${strengths.length}`,
      `levels=${levels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDependencyStrengthById(
  id: string,
): ArchitectureDependencyStrengthDefinition | undefined {
  return ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG.find((s) => s.id === id);
}

export function computeDeclarativeCouplingAllowed(input: {
  strengthRef: string;
  boundaryAllowed: boolean;
}): boolean {
  const strength = getDependencyStrengthById(input.strengthRef);
  if (!strength || !input.boundaryAllowed) return false;
  return strength.couplingScore <= 95;
}
