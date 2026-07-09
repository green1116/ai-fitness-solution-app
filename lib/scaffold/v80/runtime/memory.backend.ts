/** V80 CODE P3 — in-memory persistence backend (dev / DB fallback) */
import { randomUUID } from "node:crypto";

import type {
  V80Budget,
  V80Organization,
  V80PdfArtifact,
  V80Project,
  V80Quote,
  V80Tender,
  V80WorkflowJob,
} from "./types";

const organizations = new Map<string, V80Organization>();
const projects = new Map<string, V80Project>();
const tenders = new Map<string, V80Tender>();
const quotes = new Map<string, V80Quote>();
const budgets = new Map<string, V80Budget>();
const jobs = new Map<string, V80WorkflowJob>();
const jobsByIdempotency = new Map<string, string>();
const artifacts = new Map<string, V80PdfArtifact>();
const usage = new Map<string, { organizationId: string; usageType: string; count: number }>();

function usageKey(orgId: string, type: string) {
  return `${orgId}:${type}`;
}

export const memoryBackend = {
  async findOrgBySlug(slug: string) {
    for (const org of organizations.values()) {
      if (org.slug === slug) return org;
    }
    return null;
  },

  async getOrg(id: string) {
    return organizations.get(id) ?? null;
  },

  async saveOrg(org: V80Organization) {
    organizations.set(org.id, org);
  },

  async saveProject(project: V80Project) {
    projects.set(project.id, project);
  },

  async getProject(id: string) {
    return projects.get(id) ?? null;
  },

  async saveTender(tender: V80Tender) {
    tenders.set(tender.id, tender);
  },

  async findTenderByProject(projectId: string) {
    for (const t of tenders.values()) {
      if (t.projectId === projectId) return t;
    }
    return null;
  },

  async saveQuote(quote: V80Quote) {
    quotes.set(quote.id, quote);
  },

  async getQuote(id: string) {
    return quotes.get(id) ?? null;
  },

  async findQuoteByProject(projectId: string) {
    for (const q of quotes.values()) {
      if (q.projectId === projectId) return q;
    }
    return null;
  },

  async findBudgetByIdempotency(key: string) {
    for (const b of budgets.values()) {
      if (b.idempotencyKey === key) return b;
    }
    return null;
  },

  async saveBudget(budget: V80Budget) {
    budgets.set(budget.id, budget);
  },

  async findBudgetForProject(projectId: string) {
    for (const b of budgets.values()) {
      const q = quotes.get(b.quoteId);
      if (q?.projectId === projectId) return b;
    }
    return null;
  },

  async getBudget(id: string) {
    return budgets.get(id) ?? null;
  },

  async incrementUsage(organizationId: string, usageType: string) {
    const key = usageKey(organizationId, usageType);
    const row = usage.get(key);
    if (row) row.count += 1;
    else usage.set(key, { organizationId, usageType, count: 1 });
  },

  async getUsageMap(organizationId: string) {
    const out: Record<string, number> = {};
    for (const row of usage.values()) {
      if (row.organizationId === organizationId) out[row.usageType] = row.count;
    }
    return out;
  },

  async findJobByIdempotency(key: string) {
    const id = jobsByIdempotency.get(key);
    return id ? (jobs.get(id) ?? null) : null;
  },

  async saveJob(job: V80WorkflowJob) {
    jobs.set(job.id, job);
    jobsByIdempotency.set(job.idempotencyKey, job.id);
  },

  async getJob(id: string) {
    return jobs.get(id) ?? null;
  },

  async saveArtifact(input: Omit<V80PdfArtifact, "id" | "createdAt">) {
    const id = randomUUID();
    artifacts.set(id, { ...input, id, createdAt: new Date() });
    return id;
  },

  async getArtifact(id: string) {
    return artifacts.get(id) ?? null;
  },

  async listArtifactsByProject(projectId: string) {
    return [...artifacts.values()].filter((a) => a.projectId === projectId);
  },

  /** test introspection */
  snapshot() {
    return { organizations, projects, tenders, quotes, budgets, jobs, artifacts, usage };
  },
};
