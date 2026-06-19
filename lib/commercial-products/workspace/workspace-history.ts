import type { WorkspaceHistoryAction, WorkspaceHistoryItem } from "./workspace-types";

const historyByCustomer = new Map<string, WorkspaceHistoryItem[]>();

export function listWorkspaceHistory(customerId: string): WorkspaceHistoryItem[] {
  return historyByCustomer.get(customerId) ?? [];
}

export function appendWorkspaceHistory(input: {
  customerId: string;
  action: WorkspaceHistoryAction;
  quoteId: string;
  projectName: string;
  summary: string;
}): WorkspaceHistoryItem {
  const item: WorkspaceHistoryItem = {
    historyId: `ws-history-${input.action}-${input.quoteId}-${Date.now()}`,
    action: input.action,
    quoteId: input.quoteId,
    projectName: input.projectName,
    createdAt: Date.now(),
    summary: input.summary,
  };

  const existing = historyByCustomer.get(input.customerId) ?? [];
  historyByCustomer.set(input.customerId, [item, ...existing].slice(0, 50));
  return item;
}

export function clearWorkspaceHistory(customerId?: string): void {
  if (customerId) {
    historyByCustomer.delete(customerId);
    return;
  }
  historyByCustomer.clear();
}
