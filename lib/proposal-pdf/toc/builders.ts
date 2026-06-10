import { buildProposalPdfSections } from "../sections/builders";
import type { TocEntry } from "./types";

export function buildProposalTableOfContents(input?: {
  deploymentId?: string;
}): TocEntry[] {
  const deploymentId = input?.deploymentId ?? "toc-default";
  const sections = buildProposalPdfSections({ deploymentId });
  let page = 3; // cover + toc

  return sections.map((section, index) => {
    const entry: TocEntry = {
      entryId: `toc-${section.kind}-${deploymentId}`,
      index: index + 1,
      title: section.title,
      pageNumber: page,
      level: 1,
    };
    page += section.pageEstimate;
    return entry;
  });
}

export function buildProposalSectionIndex(input?: {
  deploymentId?: string;
}): TocEntry[] {
  const deploymentId = input?.deploymentId ?? "toc-default";
  const toc = buildProposalTableOfContents({ deploymentId });
  return toc.map((entry) => ({
    ...entry,
    entryId: `index-${entry.entryId}`,
  }));
}
