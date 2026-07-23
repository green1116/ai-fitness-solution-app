/**
 * Launch L1 — Project scenario
 */

import { getCustomerProfile } from "../customer/customer.profile";
import { PROJECT_SCENARIO_KINDS } from "../demo/demo.constants";
import { getTenant } from "../tenant/tenant.registry";
import type {
  CreateProjectScenarioInput,
  DemoProject,
  ProjectScenarioKind,
} from "./project.types";

const projects = new Map<string, DemoProject>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProject(project: DemoProject): DemoProject {
  return { ...project, metadata: { ...project.metadata } };
}

export function createProjectScenario(
  input: CreateProjectScenarioInput,
): DemoProject {
  const name = input.name.trim();
  const tenantId = input.tenantId.trim();
  const customerId = input.customerId.trim();
  if (!name) throw new Error("project.name is required");
  if (!tenantId) throw new Error("project.tenantId is required");
  if (!customerId) throw new Error("project.customerId is required");
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }
  const customer = getCustomerProfile(customerId);
  if (!customer) {
    throw new Error(`customer not found: ${customerId}`);
  }
  if (customer.tenantId !== tenantId) {
    throw new Error(
      `customer ${customerId} does not belong to tenant ${tenantId}`,
    );
  }
  if (!(PROJECT_SCENARIO_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid project scenario kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("l1prj");
  if (projects.has(id)) {
    throw new Error(`project scenario already exists: ${id}`);
  }

  const objective =
    (input.objective ?? "").trim() || `Demonstrate ${input.kind.toLowerCase()}`;
  const now = nowIso();
  const project: DemoProject = {
    id,
    tenantId,
    customerId,
    name,
    kind: input.kind,
    objective,
    detail: `kind=${input.kind} objective=${objective}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  projects.set(id, project);
  return cloneProject(project);
}

export function getProjectScenario(id: string): DemoProject | undefined {
  const project = projects.get(id.trim());
  return project ? cloneProject(project) : undefined;
}

export function listProjectScenarios(filter?: {
  tenantId?: string;
  kind?: ProjectScenarioKind;
}): DemoProject[] {
  let result = [...projects.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProject);
}

export function clearProjectScenarios(): void {
  projects.clear();
}
