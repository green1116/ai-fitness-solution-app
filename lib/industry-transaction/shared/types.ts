export const INDUSTRY_TRANSACTION_VERSION = "v35-industry-transaction-1" as const;
export const INDUSTRY_TRANSACTION_TAG = "v35-industry-transaction-foundation" as const;

export type IndustryTransactionMode = "industry-transaction";

export type IndustryTransactionStatus =
  | "initiated"
  | "qualified"
  | "quoted"
  | "negotiating"
  | "contracting"
  | "executing"
  | "completed"
  | "closed";

export type IndustryTransactionType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryTransactionSubjectType = "organization" | "directory-entry" | "relationship";

export type TransactionSettlementStatus = "pending" | "settled" | "closed";

export interface TransactionScore {
  scoreId: string;
  transactionId: string;
  qualificationScore: number;
  quotationScore: number;
  executionScore: number;
  completionScore: number;
  confidenceScore: number;
  totalTransactionScore: number;
  mode: IndustryTransactionMode;
}

export interface IndustryTransaction {
  transactionId: string;
  marketplaceId: string;
  crmId: string;
  lifecycleId: string;
  pipelineId: string;
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  transactionType: IndustryTransactionType;
  subjectId: string;
  subjectType: IndustryTransactionSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  transactionStatus: IndustryTransactionStatus;
  score: TransactionScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryTransactionMode;
}

export interface TransactionContext {
  contextId: string;
  transactions: IndustryTransaction[];
  transactionCount: number;
  typeBreakdown: Record<IndustryTransactionType, number>;
  statusBreakdown: Record<IndustryTransactionStatus, number>;
  transactionReady: boolean;
  mode: IndustryTransactionMode;
}

export interface TransactionQuery {
  subjectId?: string;
  transactionType?: IndustryTransactionType;
  transactionStatus?: IndustryTransactionStatus;
  minTransactionScore?: number;
  limit?: number;
}

export interface TransactionQueryResult {
  queryId: string;
  query: TransactionQuery;
  transactions: IndustryTransaction[];
  hitCount: number;
  transactionReady: boolean;
}

export interface TransactionLifecycle {
  lifecycleId: string;
  transactions: IndustryTransaction[];
  qualifiedTransactions: IndustryTransaction[];
  quotedTransactions: IndustryTransaction[];
  executingTransactions: IndustryTransaction[];
  completedTransactions: IndustryTransaction[];
  lifecycleReady: boolean;
  mode: IndustryTransactionMode;
}

export interface TransactionSettlement {
  settlementId: string;
  transactionId: string;
  transactionType: IndustryTransactionType;
  subjectId: string;
  settlementStatus: TransactionSettlementStatus;
  settlementScore: number;
  settlementReady: boolean;
  mode: IndustryTransactionMode;
}

export interface TransactionSettlementContext {
  contextId: string;
  settlements: TransactionSettlement[];
  settlementCount: number;
  typeBreakdown: Record<IndustryTransactionType, number>;
  settlementReady: boolean;
  mode: IndustryTransactionMode;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryTransactionValidation {
  valid: boolean;
  transactionRegistry: RegistryValidation;
  transactionContext: RegistryValidation;
  transactionQuery: RegistryValidation;
  transactionLifecycle: RegistryValidation;
  transactionSettlement: RegistryValidation;
}

export const CANONICAL_TRANSACTION_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_TRANSACTION_QUERY: TransactionQuery = {
  subjectId: CANONICAL_TRANSACTION_SUBJECT_ID,
  transactionType: "tender",
  limit: 5,
} as const;

export const TOP_TRANSACTION_SCORE_THRESHOLD = 78 as const;
