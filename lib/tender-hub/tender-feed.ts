import { buildTenderRegistryRecords } from "./tender-registry";
import type { RegistryValidation, TenderFeed } from "./shared/types";
import { TENDER_HUB_VERSION } from "./shared/types";

export function buildTenderFeed(limit = 10): TenderFeed {
  const items = [...buildTenderRegistryRecords()]
    .sort(
      (left, right) =>
        right.score.totalTenderScore - left.score.totalTenderScore ||
        right.publishedAt.localeCompare(left.publishedAt),
    )
    .slice(0, limit);

  return {
    feedId: `tender-feed-${TENDER_HUB_VERSION}`,
    items,
    feedCount: items.length,
    feedReady: items.length > 0,
    mode: "tender-hub",
  };
}

export function validateTenderFeed(): RegistryValidation {
  const feed = buildTenderFeed(10);
  const monotonic = feed.items.every(
    (item, index, items) =>
      index === 0 || items[index - 1]!.score.totalTenderScore >= item.score.totalTenderScore,
  );

  const valid = feed.feedReady && feed.feedCount >= 5 && monotonic;

  return {
    valid,
    count: feed.feedCount,
    summary: `tender-feed count=${feed.feedCount} valid=${valid}`,
  };
}
