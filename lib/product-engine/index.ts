/**
 * V59 Product Engine — V58 Runtime 产品封装层
 *
 * V58 quote-lifecycle 为冻结黑盒；本层仅做产品能力映射。
 */

export type {
  CompanyInfoInput,
  QuoteProposal,
  BudgetStructure,
  TenderArtifact,
} from "./types";

export {
  runQuoteEngine,
  type QuoteEngineInput,
  type QuoteEngineResult,
} from "./quote.engine";

export {
  runBudgetEngine,
  type BudgetEngineInput,
  type BudgetEngineResult,
} from "./budget.engine";

export {
  assertBudgetReady,
  FEAT_15_ID,
  GENERATE_BUDGET_PACKAGE_CAPABILITY,
  BUDGET_PACKAGE_GENERATION_STATUSES,
  generateBudgetPackage,
  toBudgetReadyState,
  type BudgetPackageGenerationResult,
  type BudgetPackageGenerationStatus,
  type BudgetPackageMetadata,
  type BudgetReadyState,
} from "./generate-budget-package";

export {
  assertBudgetPackageAvailable,
  BUDGET_PACKAGE_DOWNLOAD_API,
  DOWNLOAD_BUDGET_PACKAGE_CAPABILITY,
  downloadBudgetPackage,
  FEAT_16_ID,
  toBudgetPackageAvailable,
  type BudgetPackageAvailable,
  type DownloadBudgetPackageResult,
} from "./download-budget-package";

export {
  BUDGET_PACKAGE_SHARE_API,
  FEAT_17_ID,
  SHARE_BUDGET_PACKAGE_CAPABILITY,
  shareBudgetPackage,
  type ShareBudgetPackageResult,
} from "./share-budget-package";

export {
  assertBudgetPackageTrackable,
  BUDGET_PACKAGE_LIFECYCLE_STATUSES,
  FEAT_18_ID,
  TRACK_BUDGET_PACKAGE_CAPABILITY,
  toBudgetPackageTrackInput,
  trackBudgetPackage,
  type BudgetPackageLifecycleStatus,
  type BudgetPackageTrackInput,
  type TrackBudgetPackageResult,
} from "./track-budget-package";

export {
  archiveBudgetPackage,
  BUDGET_PACKAGE_ARCHIVE_STATUSES,
  FEAT_19_ID,
  ARCHIVE_BUDGET_PACKAGE_CAPABILITY,
  toBudgetPackageArchiveInput,
  type ArchiveBudgetPackageResult,
  type BudgetPackageArchiveStatus,
} from "./archive-budget-package";

export {
  assertArchivedBudgetPackage,
  BUDGET_PACKAGE_RESTORE_STATUSES,
  FEAT_20_ID,
  RESTORE_BUDGET_PACKAGE_CAPABILITY,
  restoreBudgetPackage,
  toArchivedBudgetPackage,
  type ArchivedBudgetPackage,
  type BudgetPackageRestoreStatus,
  type RestoreBudgetPackageResult,
} from "./restore-budget-package";

export {
  BUDGET_PACKAGE_DELETE_STATUSES,
  DELETE_BUDGET_PACKAGE_CAPABILITY,
  deleteBudgetPackage,
  FEAT_21_ID,
  toBudgetPackageDeleteInput,
  type BudgetPackageDeleteStatus,
  type DeleteBudgetPackageResult,
} from "./delete-budget-package";

export {
  clearListedBudgetPackages,
  FEAT_22_ID,
  findExistingBudgetPackage,
  LIST_BUDGET_PACKAGE_CAPABILITY,
  BUDGET_PACKAGE_LIST_STATUSES,
  listBudgetPackages,
  patchExistingBudgetPackageMetadata,
  rememberExistingBudgetPackage,
  type BudgetPackageListItem,
  type BudgetPackageListQuery,
  type BudgetPackageListStatus,
  type ListBudgetPackagesResult,
} from "./list-budget-package";

export {
  BUDGET_PACKAGE_DETAIL_STATUSES,
  FEAT_23_ID,
  GET_BUDGET_PACKAGE_DETAILS_CAPABILITY,
  getBudgetPackageDetails,
  type BudgetPackageDetails,
  type BudgetPackageDetailStatus,
  type GetBudgetPackageDetailsResult,
} from "./get-budget-package-details";

export {
  BUDGET_PACKAGE_UPDATE_STATUSES,
  FEAT_24_ID,
  UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY,
  updateBudgetPackageMetadata,
  type BudgetPackageMetadataPatch,
  type BudgetPackageUpdateStatus,
  type UpdateBudgetPackageMetadataResult,
} from "./update-budget-package-metadata";

export {
  BUDGET_PACKAGE_SEARCH_STATUSES,
  FEAT_25_ID,
  SEARCH_BUDGET_PACKAGE_CAPABILITY,
  searchBudgetPackages,
  type BudgetPackageSearchQuery,
  type BudgetPackageSearchStatus,
  type SearchBudgetPackagesResult,
} from "./search-budget-package";

export {
  BUDGET_PACKAGE_SORT_DIRECTIONS,
  BUDGET_PACKAGE_SORT_FIELDS,
  BUDGET_PACKAGE_SORT_STATUSES,
  FEAT_26_ID,
  SORT_BUDGET_PACKAGE_CAPABILITY,
  sortBudgetPackages,
  type BudgetPackageSortDirection,
  type BudgetPackageSortField,
  type BudgetPackageSortQuery,
  type BudgetPackageSortStatus,
  type SortBudgetPackagesResult,
} from "./sort-budget-package";

export {
  runTenderEngine,
  type TenderEngineInput,
  type TenderEngineResult,
} from "./tender.engine";

export const V59_PRODUCT_ENGINE_VERSION = "v59-product-engine-1" as const;
