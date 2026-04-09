import {
  buildDefaultTenderAttachmentIndexRows,
  mapAttachmentIndexRowsToRefs,
  type TenderAttachmentIndexKey,
  type TenderAttachmentRefItem,
  type TenderAttachmentRefMap,
} from "@/lib/pdf/tender/attachmentIndex";

export type TenderAttachmentRefKey = TenderAttachmentIndexKey;
export type { TenderAttachmentRefItem, TenderAttachmentRefMap };

export function buildDefaultTenderAttachmentRefs(): TenderAttachmentRefMap {
  return mapAttachmentIndexRowsToRefs(buildDefaultTenderAttachmentIndexRows());
}

