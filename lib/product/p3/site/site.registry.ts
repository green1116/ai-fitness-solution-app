/**
 * Product P3 — Site registry
 */

import { SITE_STATUSES } from "../project/project.constants";
import { getProject } from "../project/project.registry";
import type {
  ProjectSite,
  RegisterSiteInput,
  SiteStatus,
} from "./site.types";

const sites = new Map<string, ProjectSite>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSite(site: ProjectSite): ProjectSite {
  return { ...site, metadata: { ...site.metadata } };
}

export function registerSite(input: RegisterSiteInput): ProjectSite {
  const projectId = input.projectId.trim();
  const name = input.name.trim();
  const location = input.location.trim();
  if (!projectId) throw new Error("site.projectId is required");
  if (!name) throw new Error("site.name is required");
  if (!location) throw new Error("site.location is required");
  if (!getProject(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }

  const id = input.id?.trim() || createId("p3site");
  if (sites.has(id)) {
    throw new Error(`site already exists: ${id}`);
  }

  const status = SITE_STATUSES[0];
  const site: ProjectSite = {
    id,
    projectId,
    name,
    location,
    status,
    detail: `location=${location} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  sites.set(id, site);
  return cloneSite(site);
}

export function getSite(id: string): ProjectSite | undefined {
  const site = sites.get(id.trim());
  return site ? cloneSite(site) : undefined;
}

export function listSites(filter?: {
  projectId?: string;
  status?: SiteStatus;
}): ProjectSite[] {
  let result = [...sites.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((s) => s.projectId === pid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSite);
}

export function clearSites(): void {
  sites.clear();
}
