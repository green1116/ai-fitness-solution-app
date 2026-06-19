import type { ApprovalAction, ApprovalHistoryItem } from "./approval-types";

const historyByApproval = new Map<string, ApprovalHistoryItem[]>();

export function appendApprovalHistory(input: {
  approvalId: string;
  action: ApprovalAction;
  summary: string;
}): ApprovalHistoryItem {
  const item: ApprovalHistoryItem = {
    id: `ap-history-${input.action}-${input.approvalId}-${Date.now()}`,
    approvalId: input.approvalId,
    action: input.action,
    createdAt: Date.now(),
    summary: input.summary,
  };

  const existing = historyByApproval.get(input.approvalId) ?? [];
  historyByApproval.set(input.approvalId, [item, ...existing]);
  return item;
}

export function getApprovalHistory(approvalId: string): ApprovalHistoryItem[] {
  return historyByApproval.get(approvalId) ?? [];
}

export function clearApprovalHistory(approvalId?: string): void {
  if (approvalId) {
    historyByApproval.delete(approvalId);
    return;
  }
  historyByApproval.clear();
}
