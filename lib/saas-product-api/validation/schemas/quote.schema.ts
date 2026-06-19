import { PERSISTENCE_QUOTE_STATUSES } from "@/lib/saas-product-persistence";
import { z } from "zod";

export const createQuoteBodySchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  tenantId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateQuoteBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    status: z.enum(PERSISTENCE_QUOTE_STATUSES).optional(),
    tenantId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => Boolean(value.title) || Boolean(value.status) || value.metadata !== undefined, {
    message: "title, status, or metadata is required",
  });

export type CreateQuoteBody = z.infer<typeof createQuoteBodySchema>;
export type UpdateQuoteBody = z.infer<typeof updateQuoteBodySchema>;
