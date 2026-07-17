/**
 * E07-P1 — Digital Workforce Registry
 * Binds digital workers onto E06 autonomous operations
 */

import { getOperationById } from "../../../autonomous/e06/core/operation.registry";
import { getSkillById } from "../skill/skill.registry";
import {
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_FREEZE_VERSION,
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
  WORKER_ROLES,
} from "./workforce.constants";
import type {
  WorkerDefinition,
  WorkerRole,
  WorkforceRegistryManifest,
} from "./workforce.types";

export const WORKER_CATALOG: WorkerDefinition[] = [
  {
    id: "e07.worker.observer",
    name: "Opportunity Observer",
    role: "observer",
    description: "Observes opportunity signals through the observe operation",
    operationId: "e06.op.observe-opportunity",
    skillIds: ["e07.skill.sense", "e07.skill.analyze"],
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.worker.analyst",
    name: "Pricing Analyst",
    role: "analyst",
    description: "Analyzes pricing decisions through the decide operation",
    operationId: "e06.op.decide-pricing",
    skillIds: ["e07.skill.analyze", "e07.skill.report"],
    dependsOn: ["e07.worker.observer"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.worker.executor",
    name: "Risk Executor",
    role: "executor",
    description: "Executes risk mitigation through the act operation",
    operationId: "e06.op.act-risk",
    skillIds: ["e07.skill.execute", "e07.skill.sense"],
    dependsOn: ["e07.worker.observer"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.worker.auditor",
    name: "Compliance Auditor",
    role: "auditor",
    description: "Audits compliance through the monitor operation",
    operationId: "e06.op.monitor-compliance",
    skillIds: ["e07.skill.verify", "e07.skill.report"],
    dependsOn: ["e07.worker.analyst", "e07.worker.executor"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.worker.escalator",
    name: "Delivery Escalator",
    role: "escalator",
    description: "Escalates delivery posture through the escalate operation",
    operationId: "e06.op.escalate-delivery",
    skillIds: ["e07.skill.report", "e07.skill.execute"],
    dependsOn: ["e07.worker.auditor"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.worker.orchestrator",
    name: "Workforce Orchestrator",
    role: "orchestrator",
    description: "Coordinates the workforce through the coordinate operation",
    operationId: "e06.op.coordinate-synthesis",
    skillIds: ["e07.skill.coordinate", "e07.skill.report"],
    dependsOn: [
      "e07.worker.observer",
      "e07.worker.analyst",
      "e07.worker.executor",
      "e07.worker.auditor",
      "e07.worker.escalator",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertWorkerDefinition(worker: WorkerDefinition): void {
  if (!worker.id.trim()) throw new Error("worker.id is required");
  if (!worker.name.trim()) throw new Error("worker.name is required");
  if (!(WORKER_ROLES as readonly string[]).includes(worker.role)) {
    throw new Error(`invalid worker role: ${worker.role}`);
  }
  if (worker.readOnly !== true) throw new Error("readOnly must be true");
  if (worker.skillIds.length === 0) {
    throw new Error(`worker ${worker.id} requires skills`);
  }

  if (!getOperationById(worker.operationId)) {
    throw new Error(`missing E06 operation: ${worker.operationId}`);
  }

  for (const skillId of worker.skillIds) {
    if (!getSkillById(skillId)) {
      throw new Error(`unknown skill ${skillId} on ${worker.id}`);
    }
  }
}

export function isWorkerDependencyGraphValid(
  workers: WorkerDefinition[] = WORKER_CATALOG,
): boolean {
  const ids = new Set(workers.map((w) => w.id));
  for (const worker of workers) {
    for (const dep of worker.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildWorkforceRegistryManifest(
  workers: WorkerDefinition[] = WORKER_CATALOG,
): WorkforceRegistryManifest {
  for (const worker of workers) {
    assertWorkerDefinition(worker);
  }
  if (!isWorkerDependencyGraphValid(workers)) {
    throw new Error("Worker dependency graph is invalid");
  }

  const roles = [...new Set(workers.map((w) => w.role))];
  const requiredRoles: WorkerRole[] = [...WORKER_ROLES];
  const catalogComplete = requiredRoles.every((r) => roles.includes(r));
  if (!catalogComplete) {
    throw new Error("Worker catalog incomplete: missing roles");
  }

  return {
    platformId: E07_WORKFORCE_PLATFORM_ID,
    version: E07_WORKFORCE_VERSION,
    freezeVersion: E07_WORKFORCE_FREEZE_VERSION,
    base: E07_WORKFORCE_BASE,
    workerCount: workers.length,
    roles,
    workers,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getWorkerById(id: string): WorkerDefinition | undefined {
  return WORKER_CATALOG.find((w) => w.id === id);
}

export function getWorkerByRole(role: WorkerRole): WorkerDefinition | undefined {
  return WORKER_CATALOG.find((w) => w.role === role);
}

export function listExecutableWorkers(): WorkerDefinition[] {
  return WORKER_CATALOG.filter((w) => w.role !== "orchestrator");
}
