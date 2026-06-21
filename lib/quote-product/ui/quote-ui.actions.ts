"use server";

import { submitQuoteEntry } from "../entry/quote-entry.controller";
import type { QuoteEntryFormInput, QuoteEntrySubmissionResult } from "../entry/quote-entry.types";
import { validateQuoteEntryFormInput } from "../entry/quote-entry.validation";

export async function submitQuoteEntryFormAction(
  input: QuoteEntryFormInput,
): Promise<QuoteEntrySubmissionResult> {
  if (!validateQuoteEntryFormInput(input)) {
    throw new Error("workspaceId is required");
  }

  return submitQuoteEntry({
    workspaceId: input.workspaceId,
    title: input.title,
    submit: true,
  });
}
