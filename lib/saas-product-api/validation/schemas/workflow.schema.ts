import { z } from "zod";

export const transitionWorkflowBodySchema = z.object({
  toState: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
  tenantId: z.string().optional(),
});

export type TransitionWorkflowBody = z.infer<typeof transitionWorkflowBodySchema>;
