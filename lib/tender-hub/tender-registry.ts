import type { IndustryTransaction } from "@/lib/industry-transaction";
import { getTransactionsByType } from "@/lib/industry-transaction";
import type {
  RegistryValidation,
  TenderHubStatus,
  TenderRecord,
  TenderSourceType,
} from "./shared/types";
import { CANONICAL_TENDER_HUB_BUYER_ID } from "./shared/types";
import { getTenderSourceByType } from "./tender-source";
import { buildTenderScore } from "./tender-scoring";

interface TenderSeed {
  tenderId: string;
  sourceType: TenderSourceType;
  buyerOrganizationId: string;
  title: string;
  summary: string;
  tenderStatus: TenderHubStatus;
  publishedAt: string;
  metadata: Record<string, string>;
  scoreInput: {
    opportunityScore: number;
    budgetScore: number;
    competitionScore: number;
    matchingScore: number;
  };
}

const STATIC_TENDER_SEEDS: TenderSeed[] = [
  {
    tenderId: "th-tender-gov-sh-sports-policy-2026",
    sourceType: "government",
    buyerOrganizationId: CANONICAL_TENDER_HUB_BUYER_ID,
    title: "Shanghai Public Sports Facility Equipment Framework",
    summary: "Government framework tender for commercial fitness equipment across district sports centers.",
    tenderStatus: "registered",
    publishedAt: "2026-05-01T08:00:00.000Z",
    metadata: { region: "Shanghai", budgetTier: "high", venueType: "sports-center" },
    scoreInput: { opportunityScore: 82, budgetScore: 88, competitionScore: 62, matchingScore: 79 },
  },
  {
    tenderId: "th-tender-gov-bj-municipal-gym-2026",
    sourceType: "government",
    buyerOrganizationId: "ind-org-buyer-bj-hotel",
    title: "Beijing Municipal Community Gym Equipment Award",
    summary: "Awarded government tender for municipal community gym equipment supply.",
    tenderStatus: "awarded",
    publishedAt: "2026-03-15T08:00:00.000Z",
    metadata: { region: "Beijing", budgetTier: "medium", venueType: "community-gym" },
    scoreInput: { opportunityScore: 90, budgetScore: 85, competitionScore: 70, matchingScore: 88 },
  },
  {
    tenderId: "th-tender-enterprise-wuhan-club-2026",
    sourceType: "enterprise",
    buyerOrganizationId: "ind-org-consultant-fitness-advisory",
    title: "Wuhan Enterprise Fitness Club Equipment Discovery",
    summary: "Enterprise club chain exploring cardio and strength equipment procurement.",
    tenderStatus: "discovered",
    publishedAt: "2026-05-10T09:00:00.000Z",
    metadata: { region: "Central China", budgetTier: "medium", venueType: "enterprise-club" },
    scoreInput: { opportunityScore: 74, budgetScore: 78, competitionScore: 55, matchingScore: 72 },
  },
  {
    tenderId: "th-tender-school-sh-university-gym",
    sourceType: "school",
    buyerOrganizationId: "ind-org-consultant-fitness-advisory",
    title: "Shanghai University Campus Gym Equipment Discovery",
    summary: "Campus gym renovation with strength and functional training zones.",
    tenderStatus: "discovered",
    publishedAt: "2026-05-08T10:00:00.000Z",
    metadata: { region: "Shanghai", budgetTier: "medium", venueType: "university-gym" },
    scoreInput: { opportunityScore: 76, budgetScore: 80, competitionScore: 58, matchingScore: 74 },
  },
  {
    tenderId: "th-tender-school-hangzhou-campus",
    sourceType: "school",
    buyerOrganizationId: "ind-org-association-china-fitness",
    title: "Hangzhou Campus Fitness Center Registration",
    summary: "Registered school procurement for campus fitness center equipment package.",
    tenderStatus: "registered",
    publishedAt: "2026-04-28T11:00:00.000Z",
    metadata: { region: "Zhejiang", budgetTier: "medium", venueType: "campus-gym" },
    scoreInput: { opportunityScore: 78, budgetScore: 82, competitionScore: 60, matchingScore: 76 },
  },
  {
    tenderId: "th-tender-hospital-gz-rehab-center",
    sourceType: "hospital",
    buyerOrganizationId: "ind-org-buyer-bj-hotel",
    title: "Guangzhou Hospital Rehabilitation Equipment Qualification",
    summary: "Qualified hospital rehabilitation tender for cardio and therapy equipment.",
    tenderStatus: "qualified",
    publishedAt: "2026-04-20T08:30:00.000Z",
    metadata: { region: "Guangdong", budgetTier: "high", venueType: "rehab-center" },
    scoreInput: { opportunityScore: 80, budgetScore: 86, competitionScore: 64, matchingScore: 81 },
  },
  {
    tenderId: "th-tender-hospital-sh-rehab",
    sourceType: "hospital",
    buyerOrganizationId: CANONICAL_TENDER_HUB_BUYER_ID,
    title: "Shanghai Hospital Wellness Rehab Equipment Qualification",
    summary: "Hospital-linked wellness rehab equipment qualification for buyer network.",
    tenderStatus: "qualified",
    publishedAt: "2026-04-22T09:00:00.000Z",
    metadata: { region: "Shanghai", budgetTier: "high", venueType: "rehab-center" },
    scoreInput: { opportunityScore: 79, budgetScore: 84, competitionScore: 63, matchingScore: 80 },
  },
  {
    tenderId: "th-tender-factory-sz-smart-plant",
    sourceType: "factory",
    buyerOrganizationId: "ind-org-supplier-life-fitness-cn",
    title: "Shenzhen Smart Factory Employee Fitness Tracking",
    summary: "Factory wellness center tender tracked through supplier network channel.",
    tenderStatus: "tracked",
    publishedAt: "2026-04-18T07:00:00.000Z",
    metadata: { region: "Guangdong", budgetTier: "medium", venueType: "factory-gym" },
    scoreInput: { opportunityScore: 77, budgetScore: 79, competitionScore: 57, matchingScore: 75 },
  },
  {
    tenderId: "th-tender-factory-dongguan-fitness",
    sourceType: "factory",
    buyerOrganizationId: "ind-org-supplier-technogym-cn",
    title: "Dongguan Manufacturing Plant Fitness Center Tracking",
    summary: "Industrial plant employee fitness center under active supplier tracking.",
    tenderStatus: "tracked",
    publishedAt: "2026-04-16T07:30:00.000Z",
    metadata: { region: "Guangdong", budgetTier: "medium", venueType: "factory-gym" },
    scoreInput: { opportunityScore: 75, budgetScore: 77, competitionScore: 56, matchingScore: 73 },
  },
  {
    tenderId: "th-tender-sports-center-nanjing-2026",
    sourceType: "sports-center",
    buyerOrganizationId: "ind-org-operator-platform-ops",
    title: "Nanjing Sports Center Equipment Submission",
    summary: "Submitted sports center tender for multi-zone fitness equipment deployment.",
    tenderStatus: "submitted",
    publishedAt: "2026-04-10T12:00:00.000Z",
    metadata: { region: "Jiangsu", budgetTier: "high", venueType: "sports-center" },
    scoreInput: { opportunityScore: 84, budgetScore: 87, competitionScore: 68, matchingScore: 83 },
  },
  {
    tenderId: "th-tender-sports-center-wuhan-arena",
    sourceType: "sports-center",
    buyerOrganizationId: "ind-org-operator-platform-ops",
    title: "Wuhan Arena Sports Center Submission",
    summary: "Arena sports center proposal submitted for premium cardio and strength zones.",
    tenderStatus: "submitted",
    publishedAt: "2026-04-12T12:00:00.000Z",
    metadata: { region: "Hubei", budgetTier: "high", venueType: "sports-arena" },
    scoreInput: { opportunityScore: 83, budgetScore: 86, competitionScore: 67, matchingScore: 82 },
  },
  {
    tenderId: "th-tender-commercial-chengdu-tower",
    sourceType: "commercial-building",
    buyerOrganizationId: CANONICAL_TENDER_HUB_BUYER_ID,
    title: "Chengdu Commercial Tower Gym Matching",
    summary: "Commercial building operator gym tender matched to buyer procurement profile.",
    tenderStatus: "matched",
    publishedAt: "2026-04-25T10:00:00.000Z",
    metadata: { region: "Sichuan", budgetTier: "high", venueType: "commercial-gym" },
    scoreInput: { opportunityScore: 81, budgetScore: 85, competitionScore: 65, matchingScore: 84 },
  },
];

function transactionStatusToTenderStatus(transaction: IndustryTransaction): TenderHubStatus {
  if (transaction.transactionStatus === "closed") {
    return "closed";
  }

  if (transaction.transactionStatus === "completed") {
    return "awarded";
  }

  if (transaction.transactionStatus === "contracting") {
    return transaction.score.totalTransactionScore >= 84 ? "proposed" : "matched";
  }

  if (transaction.transactionStatus === "executing") {
    return "submitted";
  }

  if (transaction.transactionStatus === "negotiating" || transaction.transactionStatus === "quoted") {
    return "tracked";
  }

  if (transaction.transactionStatus === "qualified") {
    return "qualified";
  }

  return "registered";
}

function transactionSourceType(transaction: IndustryTransaction): TenderSourceType {
  if (transaction.subjectId === "ind-org-buyer-bj-hotel") {
    return "enterprise";
  }

  return "commercial-building";
}

function transactionToTenderRecord(transaction: IndustryTransaction): TenderRecord {
  const sourceType = transactionSourceType(transaction);
  const source = getTenderSourceByType(sourceType)!;
  const tenderStatus = transactionStatusToTenderStatus(transaction);
  const tenderId = transaction.transactionId.replace("ind-transaction-", "th-tender-");
  const score = buildTenderScore(tenderId, {
    opportunityScore: transaction.score.executionScore,
    budgetScore: transaction.score.quotationScore,
    competitionScore: Math.max(50, 100 - transaction.score.confidenceScore),
    matchingScore: transaction.score.qualificationScore,
  });

  return {
    tenderId,
    sourceId: source.sourceId,
    sourceType,
    buyerOrganizationId: transaction.subjectId,
    transactionId: transaction.transactionId,
    title: `${transaction.title.replace(" — Transaction", "")} — Tender Hub`,
    summary: `${transaction.summary} Registered in tender hub from industry transaction layer.`,
    tenderStatus,
    score,
    publishedAt: transaction.generatedAt,
    metadata: {
      ...transaction.metadata,
      sourceLayer: "v35-industry-transaction",
    },
    mode: "tender-hub",
  };
}

function seedToTenderRecord(seed: TenderSeed): TenderRecord {
  const source = getTenderSourceByType(seed.sourceType)!;
  const score = buildTenderScore(seed.tenderId, seed.scoreInput);

  return {
    tenderId: seed.tenderId,
    sourceId: source.sourceId,
    sourceType: seed.sourceType,
    buyerOrganizationId: seed.buyerOrganizationId,
    title: seed.title,
    summary: seed.summary,
    tenderStatus: seed.tenderStatus,
    score,
    publishedAt: seed.publishedAt,
    metadata: seed.metadata,
    mode: "tender-hub",
  };
}

export function buildTenderRegistryRecords(): TenderRecord[] {
  const transactionTenders = getTransactionsByType("tender").map(transactionToTenderRecord);
  const staticTenders = STATIC_TENDER_SEEDS.map(seedToTenderRecord);

  return [...transactionTenders, ...staticTenders];
}

export function getTenderById(tenderId: string): TenderRecord | undefined {
  return buildTenderRegistryRecords().find((tender) => tender.tenderId === tenderId);
}

export function getTendersBySource(sourceType: TenderSourceType): TenderRecord[] {
  return buildTenderRegistryRecords().filter((tender) => tender.sourceType === sourceType);
}

export function getTendersByBuyer(buyerOrganizationId: string): TenderRecord[] {
  return buildTenderRegistryRecords().filter(
    (tender) => tender.buyerOrganizationId === buyerOrganizationId,
  );
}

export function validateTenderRegistry(): RegistryValidation {
  const tenders = buildTenderRegistryRecords();
  const requiredSources: TenderSourceType[] = [
    "government",
    "enterprise",
    "school",
    "hospital",
    "factory",
    "commercial-building",
    "sports-center",
  ];
  const requiredStatuses: TenderHubStatus[] = [
    "discovered",
    "registered",
    "qualified",
    "tracked",
    "matched",
    "proposed",
    "submitted",
    "awarded",
    "closed",
  ];

  const sourceCoverage = requiredSources.every((source) =>
    tenders.some((tender) => tender.sourceType === source),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    tenders.some((tender) => tender.tenderStatus === status),
  );

  const scoreValid = tenders.every(
    (tender) =>
      tender.score.opportunityScore > 0 &&
      tender.score.budgetScore > 0 &&
      tender.score.competitionScore > 0 &&
      tender.score.matchingScore > 0 &&
      tender.score.winProbability > 0 &&
      tender.score.totalTenderScore > 0,
  );

  const canonical = getTendersByBuyer(CANONICAL_TENDER_HUB_BUYER_ID);
  const transactionLinked = tenders.filter((tender) => tender.transactionId).length;

  const valid =
    tenders.length >= 12 &&
    sourceCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 2 &&
    transactionLinked >= 2;

  return {
    valid,
    count: tenders.length,
    summary: `tender-registry count=${tenders.length} sources=${requiredSources.filter((s) => tenders.some((t) => t.sourceType === s)).length}/7 statuses=${requiredStatuses.filter((s) => tenders.some((t) => t.tenderStatus === s)).length}/9 valid=${valid}`,
  };
}
