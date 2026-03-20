// lib/pdf/tocMeta.ts
export type TocLevel = 1 | 2;

export type ChapterMark = {
  key: string;         // 稳定 key（建议：PLAN.OVERVIEW / BUDGET.SUMMARY）
  title: string;       // 目录显示标题
  level: TocLevel;     // 1/2
  startPage?: number;  // 合并后最终页码（从 1 开始）— route.ts 会填
};

export type TocBuildInput = {
  // 这些是“合并后最终页码”填充时需要用到的 offsets
  planStartPage: number;
  budgetStartPage: number;

  // 方案2：渲染器返回的“段内页码”（从 1 开始，表示该子 PDF 的第几页）
  // route.ts 会把它加上 planStartPage/budgetStartPage 的偏移，变成最终页码
  planChapters?: Array<ChapterMark & { startPage: number }>;
  budgetChapters?: Array<ChapterMark & { startPage: number }>;
};

export type TocItem = {
  title: string;
  page: number;
  level: TocLevel;
};

// 用 both：一级大章 + 二级子节
export function buildTocItemsBoth(input: TocBuildInput): TocItem[] {
  const items: TocItem[] = [];

  // 一级（固定）
  items.push({ title: "第一部分  方案与实施", page: input.planStartPage, level: 1 });

  // 二级（来自 plan renderer）
  if (input.planChapters?.length) {
    for (const c of input.planChapters) {
      // c.startPage 是“plan 子PDF 内页码”，转为 merged 最终页码：
      const finalPage = input.planStartPage + (c.startPage - 1);
      items.push({ title: c.title, page: finalPage, level: 2 });
    }
  } else {
    // 没拿到细分章节时，至少给一个默认项
    items.push({ title: "方案章节（未细分）", page: input.planStartPage, level: 2 });
  }

  items.push({ title: "第二部分  预算与报价", page: input.budgetStartPage, level: 1 });

  if (input.budgetChapters?.length) {
    for (const c of input.budgetChapters) {
      const finalPage = input.budgetStartPage + (c.startPage - 1);
      items.push({ title: c.title, page: finalPage, level: 2 });
    }
  } else {
    items.push({ title: "预算章节（未细分）", page: input.budgetStartPage, level: 2 });
  }

  return items;
}