import type { Lead, LeadSource, LeadStatus } from "./types";
import { LEAD_SOURCES, LEAD_STATUSES } from "./types";

const SAMPLE_LEADS: Array<{ companyName: string; contactName: string; source: LeadSource; status: LeadStatus; score: number }> = [
  { companyName: "某市体育局", contactName: "张主任", source: "inbound", status: "qualified", score: 82 },
  { companyName: "某大学后勤处", contactName: "李老师", source: "website", status: "contacted", score: 71 },
  { companyName: "某酒店集团", contactName: "王经理", source: "referral", status: "new", score: 58 },
  { companyName: "某制造企业", contactName: "赵工", source: "trade-show", status: "converted", score: 91 },
  { companyName: "某区政府", contactName: "刘科长", source: "partner", status: "lost", score: 34 },
];

export function buildLeads(input?: { deploymentId?: string }): Lead[] {
  const deploymentId = input?.deploymentId ?? "lead-default";
  return SAMPLE_LEADS.map((sample, index) => ({
    leadId: `lead-${deploymentId}-${index + 1}`,
    source: sample.source,
    status: sample.status,
    score: sample.score,
    companyName: sample.companyName,
    contactName: sample.contactName,
    mode: "readiness-stub" as const,
  }));
}

