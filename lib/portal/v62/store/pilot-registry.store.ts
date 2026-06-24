/**
 * V62 — Pilot organization / user / project registry (in-memory)
 */

export type PilotEntityStatus = "active" | "paused" | "completed" | "inactive";

export type PilotOrganizationRecord = {
  organizationId: string;
  name: string;
  status: PilotEntityStatus;
  startedAt: string;
  notes?: string;
};

export type PilotUserRecord = {
  userId: string;
  organizationId: string;
  email?: string;
  status: PilotEntityStatus;
  joinedAt: string;
};

export type PilotProjectRecord = {
  projectId: string;
  organizationId: string;
  name?: string;
  status: PilotEntityStatus;
  createdAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v62PilotRegistry:
    | {
        organizations: PilotOrganizationRecord[];
        users: PilotUserRecord[];
        projects: PilotProjectRecord[];
      }
    | undefined;
}

function registry() {
  globalThis.__v62PilotRegistry ||= {
    organizations: [],
    users: [],
    projects: [],
  };
  return globalThis.__v62PilotRegistry;
}

export function listPilotOrganizations(): PilotOrganizationRecord[] {
  return [...registry().organizations];
}

export function listPilotUsers(organizationId?: string): PilotUserRecord[] {
  const users = registry().users;
  return organizationId ? users.filter((u) => u.organizationId === organizationId) : [...users];
}

export function listPilotProjects(organizationId?: string): PilotProjectRecord[] {
  const projects = registry().projects;
  return organizationId ? projects.filter((p) => p.organizationId === organizationId) : [...projects];
}

export function registerPilotOrganization(input: {
  organizationId: string;
  name: string;
  notes?: string;
}): PilotOrganizationRecord {
  const existing = registry().organizations.find((o) => o.organizationId === input.organizationId);
  if (existing) return existing;
  const record: PilotOrganizationRecord = {
    organizationId: input.organizationId,
    name: input.name,
    status: "active",
    startedAt: new Date().toISOString(),
    notes: input.notes,
  };
  registry().organizations.push(record);
  return record;
}

export function registerPilotUser(input: {
  userId: string;
  organizationId: string;
  email?: string;
}): PilotUserRecord {
  const existing = registry().users.find((u) => u.userId === input.userId);
  if (existing) return existing;
  const record: PilotUserRecord = {
    userId: input.userId,
    organizationId: input.organizationId,
    email: input.email,
    status: "active",
    joinedAt: new Date().toISOString(),
  };
  registry().users.push(record);
  return record;
}

export function registerPilotProject(input: {
  projectId: string;
  organizationId: string;
  name?: string;
}): PilotProjectRecord {
  const existing = registry().projects.find((p) => p.projectId === input.projectId);
  if (existing) return existing;
  const record: PilotProjectRecord = {
    projectId: input.projectId,
    organizationId: input.organizationId,
    name: input.name,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  registry().projects.push(record);
  return record;
}

export function isPilotOrganization(organizationId: string): boolean {
  return registry().organizations.some(
    (o) => o.organizationId === organizationId && o.status === "active",
  );
}

export function clearPilotRegistryForTests(): void {
  globalThis.__v62PilotRegistry = { organizations: [], users: [], projects: [] };
}
