/**
 * V62 P1 — Pilot program foundation
 */

import {
  listPilotOrganizations,
  listPilotProjects,
  listPilotUsers,
  registerPilotOrganization,
  registerPilotUser,
  type PilotOrganizationRecord,
  type PilotProjectRecord,
  type PilotUserRecord,
} from "../store/pilot-registry.store";

export type PilotProgramReport = {
  organizations: PilotOrganizationRecord[];
  users: PilotUserRecord[];
  projects: PilotProjectRecord[];
  activeOrganizations: number;
  activeUsers: number;
  activeProjects: number;
  score: number;
  generatedAt: string;
};

export function buildPilotProgramReport(organizationId?: string): PilotProgramReport {
  const organizations = organizationId
    ? listPilotOrganizations().filter((o) => o.organizationId === organizationId)
    : listPilotOrganizations();
  const users = listPilotUsers(organizationId);
  const projects = listPilotProjects(organizationId);

  const activeOrganizations = organizations.filter((o) => o.status === "active").length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const score = Math.min(
    100,
    40 + activeOrganizations * 15 + activeUsers * 5 + activeProjects * 5,
  );

  return {
    organizations,
    users,
    projects,
    activeOrganizations,
    activeUsers,
    activeProjects,
    score,
    generatedAt: new Date().toISOString(),
  };
}

export function ensurePilotEnrollment(input: {
  organizationId: string;
  organizationName: string;
  userId: string;
  userEmail?: string;
}) {
  registerPilotOrganization({
    organizationId: input.organizationId,
    name: input.organizationName,
  });
  registerPilotUser({
    userId: input.userId,
    organizationId: input.organizationId,
    email: input.userEmail,
  });
}
