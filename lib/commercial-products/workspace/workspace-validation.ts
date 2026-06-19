import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import type { WorkspaceValidation } from "./workspace-types";
import { CP_WORKSPACE_API_PATH } from "./workspace-types";
import {
  buildCustomerWorkspace,
  syncWorkspaceFromQuote,
} from "./workspace-service";
import { clearWorkspaceHistory } from "./workspace-history";
import { clearWorkspaceProjects } from "./workspace-projects";

const SAMPLE_CUSTOMER_ID = "default-customer";

export function validateCommercialWorkspace(): WorkspaceValidation {
  let workspaceReady = false;
  let projectsReady = false;
  let historyReady = false;
  let downloadCenterReady = false;

  try {
    clearWorkspaceProjects(SAMPLE_CUSTOMER_ID);
    clearWorkspaceHistory(SAMPLE_CUSTOMER_ID);

    const quote = createQuote({
      sku: "kickstart-package",
      projectName: "School Gym Project",
      areaSqm: 320,
      headcount: 180,
      budgetCny: 650_000,
      complexity: "medium",
      slaTier: "7d",
    });
    registerQuoteSnapshot(quote.snapshot);

    const workspace = syncWorkspaceFromQuote({
      customerId: SAMPLE_CUSTOMER_ID,
      customerName: "Validation Customer",
      quoteId: quote.snapshot.quoteId,
      projectName: quote.snapshot.inputs.projectName,
      sku: quote.snapshot.sku,
      suggestedPriceCny: quote.snapshot.price,
      sla: quote.snapshot.sla,
    });

    workspaceReady = Boolean(workspace.workspaceId && workspace.customerId);
    projectsReady = workspace.projects.length >= 1;
    historyReady = workspace.history.length >= 2;
    downloadCenterReady =
      workspace.projects[0]?.downloadLinks.length >= 5 &&
      workspace.projects[0]?.downloadLinks.every((link) => link.apiPath.startsWith("/api/commercial-products/"));

    buildCustomerWorkspace({ customerId: SAMPLE_CUSTOMER_ID });
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_WORKSPACE_API_PATH === "/api/commercial-products/workspace";
  const valid =
    workspaceReady &&
    projectsReady &&
    historyReady &&
    downloadCenterReady &&
    apiPathRegistered;

  return {
    valid,
    workspaceReady,
    projectsReady,
    historyReady,
    downloadCenterReady,
    apiPathRegistered,
    summary: [
      `workspaceReady=${workspaceReady}`,
      `projectsReady=${projectsReady}`,
      `historyReady=${historyReady}`,
      `downloadCenterReady=${downloadCenterReady}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
