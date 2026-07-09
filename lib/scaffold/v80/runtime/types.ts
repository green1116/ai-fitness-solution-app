/** V80 runtime domain types */
import { randomUUID } from "node:crypto";

export type V80Plan = "BASIC" | "PRO" | "ENTERPRISE";

export type V80Organization = {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  plan: V80Plan;
  createdAt: Date;
};

export type V80Project = {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
};

export type V80Tender = {
  id: string;
  projectId: string;
  status: string;
  tenderType: string;
  createdAt: Date;
};

export type V80Quote = {
  id: string;
  organizationId: string;
  projectId: string;
  createdAt: Date;
};

export type V80Budget = {
  id: string;
  quoteId: string;
  tier: "low" | "mid" | "high";
  companySize: number;
  totalAmount: number;
  idempotencyKey: string;
  createdAt: Date;
};

export type V80WorkflowStepState = {
  step: string;
  status: "pending" | "running" | "completed" | "failed";
  attempts: number;
  error?: string;
  completedAt?: Date;
};

export type V80WorkflowJob = {
  id: string;
  projectId: string;
  workflowKey: "tender-pack-complete";
  status: "pending" | "running" | "completed" | "failed";
  steps: V80WorkflowStepState[];
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
};

export type V80PdfArtifact = {
  id: string;
  projectId: string;
  type: "plan" | "budget" | "proposal" | "bundle";
  buffer: Uint8Array;
  createdAt: Date;
};

export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `org-${randomUUID().slice(0, 8)}`;
}

export function budgetIdempotencyKey(input: {
  quoteId: string;
  budgetTier: string;
  companySize: number;
}) {
  return `budget:${input.quoteId}:${input.budgetTier}:${input.companySize}`;
}

export function workflowIdempotencyKey(projectId: string, workflowKey: string) {
  return `workflow:${projectId}:${workflowKey}`;
}
