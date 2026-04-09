export type TenderRefPageMap = Record<string, number>;

export function offsetRefPageMap(
  map: TenderRefPageMap | undefined,
  pageOffset: number
): TenderRefPageMap {
  const out: TenderRefPageMap = {};
  for (const [key, page] of Object.entries(map || {})) {
    out[key] = page + pageOffset;
  }
  return out;
}

export function mergeRefPageMaps(
  ...maps: Array<TenderRefPageMap | undefined>
): TenderRefPageMap {
  const out: TenderRefPageMap = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [key, page] of Object.entries(map)) {
      out[key] = page;
    }
  }
  return out;
}

