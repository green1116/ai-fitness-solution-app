import type { OutreachChannel, OutreachOutcome, OutreachRecord } from "./types";

const SAMPLES: Array<{ channel: OutreachChannel; action: string; response: string; outcome: OutreachOutcome }> = [
  { channel: "email", action: "产品介绍邮件", response: "已打开", outcome: "responded" },
  { channel: "demo", action: "产品演示预约", response: "已预约", outcome: "scheduled" },
  { channel: "follow-up", action: "跟进电话", response: "有兴趣", outcome: "responded" },
  { channel: "proposal-sharing", action: "方案样例分享", response: "已下载", outcome: "converted" },
  { channel: "email", action: "续触达邮件", response: "未回复", outcome: "no-response" },
];

export function buildOutreachRecords(input?: { deploymentId?: string }): OutreachRecord[] {
  const deploymentId = input?.deploymentId ?? "outreach-default";
  return SAMPLES.map((s, i) => ({
    recordId: `outreach-${deploymentId}-${i + 1}`,
    channel: s.channel,
    action: s.action,
    response: s.response,
    outcome: s.outcome,
    leadId: `gtm-lead-${deploymentId}-${i + 1}`,
    mode: "readiness-stub" as const,
  }));
}

export function summarizeOutreach(records: OutreachRecord[]): {
  responseRate: number;
  conversionRate: number;
} {
  const responded = records.filter((r) => r.outcome !== "no-response").length;
  const converted = records.filter((r) => r.outcome === "converted").length;
  return {
    responseRate: Math.round((responded / records.length) * 100) / 100,
    conversionRate: Math.round((converted / records.length) * 100) / 100,
  };
}
