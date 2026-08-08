/** @scaffold BLP-API-005 → tender intake (idempotent per projectId) */
import { randomUUID } from "node:crypto";

import { V80RuntimeError } from "../runtime/errors";
import { withV80Lock } from "../runtime/lock";
import { v80Persist } from "../runtime/store";

export type TenderIntakeInput = {
  projectId: string;
  tenderType: "enterprise-gym";
  documentUrls?: string[];
};

export async function createTenderFromIntake(input: TenderIntakeInput) {
  return withV80Lock(`tender:intake:${input.projectId}`, async () => {
    const project = await v80Persist.getProject(input.projectId);
    if (!project) {
      throw new V80RuntimeError("Project not found", "PROJECT_NOT_FOUND", 404);
    }

    const existingTender = await v80Persist.findTenderByProject(input.projectId);
    const existingQuote = await v80Persist.findQuoteByProject(input.projectId);

    // Fully mapped — return same IDs (retry-safe)
    if (existingTender && existingQuote) {
      return {
        tenderId: existingTender.id,
        quoteId: existingQuote.id,
        status: existingTender.status as "draft",
        documentCount: input.documentUrls?.length ?? 0,
        idempotent: true as const,
      };
    }

    const now = new Date();
    // Partial: reuse existing side, only create the missing one
    let tenderId = existingTender?.id;
    let quoteId = existingQuote?.id;
    let createdSide: "tender" | "quote" | "both" | "none" = "none";

    if (!tenderId) {
      tenderId = randomUUID();
      await v80Persist.saveTender({
        id: tenderId,
        projectId: input.projectId,
        status: "draft",
        tenderType: input.tenderType,
        createdAt: now,
      });
      createdSide = existingQuote ? "tender" : "both";
    }

    if (!quoteId) {
      quoteId = randomUUID();
      await v80Persist.saveQuote({
        id: quoteId,
        organizationId: project.organizationId,
        projectId: input.projectId,
        createdAt: now,
      });
      createdSide = existingTender ? "quote" : createdSide === "tender" ? "both" : "both";
    }

    if (createdSide !== "none") {
      await v80Persist.incrementUsage(project.organizationId, "tender_intake");
    }

    return {
      tenderId,
      quoteId,
      status: "draft" as const,
      documentCount: input.documentUrls?.length ?? 0,
      idempotent: createdSide === "none" ? (true as const) : undefined,
    };
  });
}
