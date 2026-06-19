import type { PersistenceRepositories } from "../contracts/persistence-contracts";
import { quoteRepository } from "./quote-repository";
import { workflowEventRepository } from "./workflow-event-repository";
import { workflowHistoryRepository } from "./workflow-history-repository";
import { workflowRepository } from "./workflow-repository";
import { workspaceRepository } from "./workspace-repository";

export const persistenceRepositories: PersistenceRepositories = {
  workspace: workspaceRepository,
  quote: quoteRepository,
  workflow: workflowRepository,
  workflowHistory: workflowHistoryRepository,
  workflowEvent: workflowEventRepository,
};

export { workspaceRepository } from "./workspace-repository";
export { quoteRepository } from "./quote-repository";
export { workflowRepository } from "./workflow-repository";
export { workflowHistoryRepository } from "./workflow-history-repository";
export { workflowEventRepository } from "./workflow-event-repository";

export * from "./workspace-repository";
export * from "./quote-repository";
export * from "./workflow-repository";
export * from "./workflow-history-repository";
export * from "./workflow-event-repository";
export { runPersistenceTransaction } from "./transaction";
