import type { QuoteJobResultStatus } from "./quote-job-engine.types";

export interface QuoteJobResult {
  jobId: string;
  success: boolean;
  executionId?: string;
  error?: string;
  status: QuoteJobResultStatus;
}
