/**
 * PI-3.1 — Primary Command → Domain ownership (PD-2.5).
 * Closed 47-row catalogue. Services must respect primary owner.
 */
import type { ProductDomainId } from "./domain-ownership";

export type CommandExecutionKind = "Command" | "Query" | "NavPref";

export type BackendCommandOwnership = Readonly<{
  actionId: string;
  command: string;
  primaryDomain: ProductDomainId;
  supportingDomains: readonly ProductDomainId[];
  executionKind: CommandExecutionKind;
}>;

/**
 * PD-2.5 Action → Primary Domain map (47).
 * executionKind is backend CQ reading (PD-5.1 §8) — not UI flowKind.
 */
export const BACKEND_COMMAND_OWNERSHIP = [
  {
    actionId: "ACT-01-01",
    command: "SignIn",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Command",
  },
  {
    actionId: "ACT-01-02",
    command: "SelectLanguage",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-01-03",
    command: "ChooseGoal.EnterpriseBuilder",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-01-04",
    command: "ChooseGoal.TenderIntelligence",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-01-05",
    command: "ChooseGoal.SalesCenter",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-01-06",
    command: "OpenMyProjects",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-02-01",
    command: "StartPlanning",
    primaryDomain: "M12",
    supportingDomains: ["M13"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-02-02",
    command: "SubmitPlanningInputs",
    primaryDomain: "M14",
    supportingDomains: ["M11"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-02-03",
    command: "ContinueToWorkspace",
    primaryDomain: "M13",
    supportingDomains: ["M12"],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-03-01",
    command: "UploadTenderDocument",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Command",
  },
  {
    actionId: "ACT-03-02",
    command: "ViewProcessingStatus",
    primaryDomain: "M11",
    supportingDomains: ["M12"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-03-03",
    command: "ProceedToRequirementReview",
    primaryDomain: "M11",
    supportingDomains: ["M13"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-04-01",
    command: "WorkspaceInteract",
    primaryDomain: "M12",
    supportingDomains: ["M13"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-04-02",
    command: "ViewProjectContext",
    primaryDomain: "M13",
    supportingDomains: ["M11"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-04-03",
    command: "ConfirmRequirements",
    primaryDomain: "M11",
    supportingDomains: ["M14"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-04-04",
    command: "GenerateTenderPackage",
    primaryDomain: "M12",
    supportingDomains: ["M11", "M14"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-04-05",
    command: "CaptureOpportunity",
    primaryDomain: "M14",
    supportingDomains: ["M12"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-04-06",
    command: "OpenSolutionResult",
    primaryDomain: "M14",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-04-07",
    command: "OpenBudgetResult",
    primaryDomain: "M14",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-04-08",
    command: "OpenDocuments",
    primaryDomain: "M11",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-05-01",
    command: "ReviewSolution",
    primaryDomain: "M14",
    supportingDomains: ["M11"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-05-02",
    command: "ReviewProposalResult",
    primaryDomain: "M14",
    supportingDomains: ["M12"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-05-03",
    command: "DownloadSolution",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Command",
  },
  {
    actionId: "ACT-05-04",
    command: "ShareSolution",
    primaryDomain: "M15",
    supportingDomains: ["M11"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-05-05",
    command: "ContinueToBudget",
    primaryDomain: "M14",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-05-06",
    command: "OpenDocuments",
    primaryDomain: "M11",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-05-07",
    command: "ReturnToWorkspace",
    primaryDomain: "M13",
    supportingDomains: ["M12"],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-06-01",
    command: "ReviewBudget",
    primaryDomain: "M14",
    supportingDomains: ["M11"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-06-02",
    command: "DownloadBudget",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Command",
  },
  {
    actionId: "ACT-06-03",
    command: "AdjustRequirements",
    primaryDomain: "M13",
    supportingDomains: ["M12", "M14"],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-06-04",
    command: "OpenDocuments",
    primaryDomain: "M11",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-06-05",
    command: "ReturnToSolution",
    primaryDomain: "M13",
    supportingDomains: ["M14"],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-07-01",
    command: "ListProjects",
    primaryDomain: "M13",
    supportingDomains: ["M15"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-07-02",
    command: "ContinueProject",
    primaryDomain: "M13",
    supportingDomains: ["M12", "M15"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-07-03",
    command: "OpenProjectDocuments",
    primaryDomain: "M11",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-08-01",
    command: "BrowseDocumentCategories",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-08-02",
    command: "PreviewDocument",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-08-03",
    command: "DownloadDocument",
    primaryDomain: "M11",
    supportingDomains: [],
    executionKind: "Command",
  },
  {
    actionId: "ACT-08-04",
    command: "ShareDocument",
    primaryDomain: "M15",
    supportingDomains: ["M11"],
    executionKind: "Command",
  },
  {
    actionId: "ACT-08-05",
    command: "ReturnToProjects",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-08-06",
    command: "ReturnToWorkspace",
    primaryDomain: "M13",
    supportingDomains: ["M12"],
    executionKind: "NavPref",
  },
  {
    actionId: "ACT-09-01",
    command: "ViewAdminDashboard",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-09-02",
    command: "ViewOrganizations",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-09-03",
    command: "ViewUsers",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-09-04",
    command: "ViewUsage",
    primaryDomain: "M13",
    supportingDomains: ["M15"],
    executionKind: "Query",
  },
  {
    actionId: "ACT-09-05",
    command: "ViewSecurity",
    primaryDomain: "M13",
    supportingDomains: [],
    executionKind: "Query",
  },
  {
    actionId: "ACT-09-06",
    command: "ViewGovernance",
    primaryDomain: "M15",
    supportingDomains: ["M13"],
    executionKind: "Query",
  },
] as const satisfies readonly BackendCommandOwnership[];

export function countPrimaryByDomain(
  domain: ProductDomainId,
): number {
  return BACKEND_COMMAND_OWNERSHIP.filter((row) => row.primaryDomain === domain)
    .length;
}

export function getCommandOwnership(
  actionId: string,
): BackendCommandOwnership | undefined {
  return BACKEND_COMMAND_OWNERSHIP.find((row) => row.actionId === actionId);
}
