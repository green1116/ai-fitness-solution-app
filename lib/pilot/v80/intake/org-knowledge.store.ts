/**
 * V80 Pilot P12 — In-memory org knowledge library store (no Prisma changes)
 */

import type { OrgKnowledgeLibrary } from "./org-knowledge.schema";

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotOrgKnowledge: Map<string, OrgKnowledgeLibrary> | undefined;
}

function libraries(): Map<string, OrgKnowledgeLibrary> {
  globalThis.__v80PilotOrgKnowledge ||= new Map();
  return globalThis.__v80PilotOrgKnowledge;
}

export function getOrgKnowledgeLibrary(organizationId: string): OrgKnowledgeLibrary | null {
  return libraries().get(organizationId) ?? null;
}

export function saveOrgKnowledgeLibrary(library: OrgKnowledgeLibrary): OrgKnowledgeLibrary {
  libraries().set(library.organizationId, library);
  return library;
}

export function clearOrgKnowledgeStoreForTests(): void {
  globalThis.__v80PilotOrgKnowledge = new Map();
  // P13 — clear governance alongside library
  globalThis.__v80PilotOrgKnowledgeGovernance = new Map();
}
