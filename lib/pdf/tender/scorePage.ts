/**
 * 评分项对照页 V2（评审映射页）— 与 `renderScoreMappingPdf` 同一实现，便于按文件名检索。
 */
export { renderScoreMappingPdf as renderScorePagePdf } from "@/lib/pdf/tender/renderScoreMappingPdf";
export type { RenderScoreMappingPdfInput as RenderScorePagePdfInput } from "@/lib/pdf/tender/renderScoreMappingPdf";
export {
  buildDefaultTenderScoreMappings,
  formatSectionWithPage,
  mapScoreMappingToTenderRow,
  SCORE_MAPPING_PAGE_FOOTNOTE,
  SCORE_MAPPING_PAGE_SUBTITLE,
  type TenderScoreMappingRow,
  type TenderScoreMappingSectionKey,
} from "@/lib/pdf/tender/scoreMapping";
export {
  buildTenderSectionPageRefs,
  buildTenderSectionPageRefsFromPackLayout,
  type TenderPackSegmentPageCounts,
  type TenderSectionPageRefs,
} from "@/lib/pdf/tender/pageRefs";
