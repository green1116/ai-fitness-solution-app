import type { TenderNavMap } from "@/lib/pdf/tender/nav/pdfNavTypes";

export type TenderSectionStartPages = {
  score?: number;
  technicalResponse?: number;
  businessResponse?: number;
  technicalDeviation?: number;
  businessDeviation?: number;
  attachmentIndex?: number;
};

type ResponseRow = { refId?: string };
type ScoreRow = { scoreId?: string };
type AttachmentRow = { code?: string };

export function buildTenderNavMap(input: {
  sectionStarts: TenderSectionStartPages;
  technicalResponseRows?: ResponseRow[];
  businessResponseRows?: ResponseRow[];
  scoreRows?: ScoreRow[];
  attachmentRows?: AttachmentRow[];
  preciseRefPages?: Record<string, number>;
}): TenderNavMap {
  const map: TenderNavMap = {};
  const {
    sectionStarts,
    technicalResponseRows = [],
    businessResponseRows = [],
    scoreRows = [],
    attachmentRows = [],
  } = input;

  if (sectionStarts.score) {
    map["score-page"] = { key: "score-page", kind: "section", page: sectionStarts.score };
  }
  if (sectionStarts.technicalResponse) {
    map["technical-response"] = {
      key: "technical-response",
      kind: "section",
      page: sectionStarts.technicalResponse,
    };
    for (const row of technicalResponseRows) {
      if (!row.refId) continue;
      const precisePage = input.preciseRefPages?.[row.refId];
      map[row.refId] = {
        key: row.refId,
        kind: "responseRef",
        page: precisePage || sectionStarts.technicalResponse,
      };
    }
  }
  if (sectionStarts.businessResponse) {
    map["business-response"] = {
      key: "business-response",
      kind: "section",
      page: sectionStarts.businessResponse,
    };
    for (const row of businessResponseRows) {
      if (!row.refId) continue;
      const precisePage = input.preciseRefPages?.[row.refId];
      map[row.refId] = {
        key: row.refId,
        kind: "responseRef",
        page: precisePage || sectionStarts.businessResponse,
      };
    }
  }
  if (sectionStarts.technicalDeviation) {
    map["technical-deviation"] = {
      key: "technical-deviation",
      kind: "section",
      page: sectionStarts.technicalDeviation,
    };
  }
  if (sectionStarts.businessDeviation) {
    map["business-deviation"] = {
      key: "business-deviation",
      kind: "section",
      page: sectionStarts.businessDeviation,
    };
  }
  if (sectionStarts.attachmentIndex) {
    map["attachment-index"] = {
      key: "attachment-index",
      kind: "section",
      page: sectionStarts.attachmentIndex,
    };
  }

  for (const row of scoreRows) {
    if (!row.scoreId || !sectionStarts.score) continue;
    const precisePage = input.preciseRefPages?.[row.scoreId];
    map[row.scoreId] = {
      key: row.scoreId,
      kind: "scoreRef",
      page: precisePage || sectionStarts.score,
    };
  }
  for (const row of attachmentRows) {
    if (!row.code || !sectionStarts.attachmentIndex) continue;
    map[row.code] = { key: row.code, kind: "attachmentRef", page: sectionStarts.attachmentIndex };
  }

  return map;
}

