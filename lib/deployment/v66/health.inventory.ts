/**
 * V66 P2 — Health check inventory (declarative catalog)
 */
import type { HealthCheckCategory, HealthCheckSeverity } from "./execution.types";

export type HealthCheckDefinition = {
  id: string;
  label: string;
  category: HealthCheckCategory;
  severity: HealthCheckSeverity;
  required: boolean;
  signalKey: keyof import("./execution.types").DeploymentExecutionSignals;
  notes?: string;
};

export const HEALTH_CHECK_INVENTORY: HealthCheckDefinition[] = [
  {
    id: "HC-001",
    label: "V66 P1 deployment baseline ready",
    category: "upstream",
    severity: "critical",
    required: true,
    signalKey: "baselineReady",
  },
  {
    id: "HC-002",
    label: "Production-required secrets configured",
    category: "config",
    severity: "critical",
    required: true,
    signalKey: "requiredSecretsConfigured",
    notes: "DATABASE_URL, JWT_SECRET, DOWNLOAD_TOKEN_SECRET",
  },
  {
    id: "HC-003",
    label: "Forbidden dev flags clear for production",
    category: "config",
    severity: "critical",
    required: true,
    signalKey: "forbiddenFlagsClear",
  },
  {
    id: "HC-004",
    label: "package-lock.json present",
    category: "build",
    severity: "high",
    required: true,
    signalKey: "lockfilePresent",
  },
  {
    id: "HC-005",
    label: "Node engine declared in package.json",
    category: "build",
    severity: "medium",
    required: false,
    signalKey: "nodeEngineDeclared",
  },
  {
    id: "HC-006",
    label: "Prisma client generation step satisfied",
    category: "process",
    severity: "high",
    required: true,
    signalKey: "prismaClientGenerated",
    notes: "postinstall: prisma generate",
  },
  {
    id: "HC-007",
    label: "Database connectivity reachable",
    category: "process",
    severity: "high",
    required: false,
    signalKey: "databaseReachable",
    notes: "Optional live probe; declarative gate only",
  },
  {
    id: "HC-008",
    label: "Build artifacts present",
    category: "build",
    severity: "medium",
    required: false,
    signalKey: "buildArtifactsPresent",
    notes: ".next output after npm run build",
  },
  {
    id: "HC-009",
    label: "Readiness probe surface declared",
    category: "probe",
    severity: "high",
    required: true,
    signalKey: "probeSurfaceComplete",
  },
  {
    id: "HC-010",
    label: "Startup verification sequence complete",
    category: "process",
    severity: "critical",
    required: true,
    signalKey: "startupSequenceComplete",
  },
];
