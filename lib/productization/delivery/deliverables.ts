import type { Deliverable } from "./types";

export function buildDeliverables(): Deliverable[] {
  return [
    {
      deliverableId: "del-plan-package",
      type: "plan-package",
      name: "Plan Package",
      status: "completed",
      ready: true,
    },
    {
      deliverableId: "del-budget-package",
      type: "budget-package",
      name: "Budget Package",
      status: "completed",
      ready: true,
    },
    {
      deliverableId: "del-proposal-pdf",
      type: "proposal-pdf",
      name: "Proposal PDF",
      status: "completed",
      ready: true,
    },
    {
      deliverableId: "del-tender-package",
      type: "tender-package",
      name: "Tender Package",
      status: "in-progress",
      ready: false,
    },
    {
      deliverableId: "del-executive-summary",
      type: "executive-summary",
      name: "Executive Summary",
      status: "planned",
      ready: false,
    },
  ];
}
