import type { ProjectEntryPlaceholderCard } from "../shared/portal-types";

export const PROJECT_ENTRY_PLACEHOLDER_CARDS: ProjectEntryPlaceholderCard[] = [
  {
    key: "project-list",
    title: "Project List",
    description: "Future workspace-scoped project inventory will appear here.",
    status: "coming-soon",
  },
  {
    key: "project-plan",
    title: "Delivery Plan",
    description: "Placeholder for delivery planning surfaces without project runtime.",
    status: "coming-soon",
  },
  {
    key: "project-metadata",
    title: "Project Metadata",
    description: "Read-only metadata preview reserved for a future project runtime.",
    status: "coming-soon",
  },
];

export function listProjectEntryPlaceholderCards(): ProjectEntryPlaceholderCard[] {
  return PROJECT_ENTRY_PLACEHOLDER_CARDS;
}
