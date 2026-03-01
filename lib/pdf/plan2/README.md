# Plan22 生成式引擎架构（v2）

## 🎯 目标

替代当前的 `renderPlan22.ts` golden PDF 回放模式，改为**完全生成式渲染**，实现：

- ✅ 每一页从 0 画出来，完全可控
- ✅ 可维护、可扩展、可测试
- ✅ 统一的排版规则和视觉系统
- ✅ 消除 golden PDF 覆盖带来的视觉冲突

---

## 📁 推荐目录结构

```
lib/pdf/plan2/
├── README.md                 # 本文档
├── tokens.ts                 # 设计令牌（字体、颜色、间距、栅格）
├── layout.ts                 # 页面布局引擎（PageFrame、cursor、measure）
├── components/
│   ├── headerFooter.ts       # 页眉页脚（复用 brand.ts）
│   ├── titles.ts             # H1/H2/H3 + 间距规则
│   ├── card.ts               # 卡片容器（TOC 页用）
│   ├── table.ts              # 表格模块
│   └── list.ts               # 列表（项目符号/勾选/编号）
├── sections/
│   ├── cover.ts              # 封面页
│   ├── toc.ts                # 目录页
│   ├── execSummary.ts        # 执行摘要
│   ├── spaceAnalysis.ts      # 空间分析
│   ├── equipmentPlan.ts      # 设备方案
│   ├── budgetBridge.ts       # 预算桥接
│   └── ...                   # 其他章节
└── renderPlan22_v2.ts        # 入口：拼装 22 页
```

---

## 🧩 核心模块说明

### 1. `tokens.ts` - 设计令牌系统

定义所有视觉参数，确保全局一致性：

```typescript
// 字体
export const FONTS = {
  sizes: {
    H1: 18,
    H2: 14,
    H3: 12,
    BODY: 11,
    SMALL: 9.5,
    CAPTION: 9,
  },
  lineHeights: {
    H1: 24,
    H2: 20,
    H3: 17,
    BODY: 16,
    SMALL: 14,
    CAPTION: 13,
  },
};

// 颜色系统（中性企业色）
export const COLORS = {
  ink: rgb(0.08, 0.10, 0.12),      // 深黑（标题）
  text: rgb(0.10, 0.12, 0.14),     // 正文
  mute: rgb(0.45, 0.50, 0.55),     // 弱化文本
  soft: rgb(0.50, 0.55, 0.60),     // 副标题
  line: rgb(0.90, 0.92, 0.94),     // 分割线
  border: rgb(0.88, 0.90, 0.92),   // 边框
  card: rgb(0.995, 0.995, 0.998),  // 卡片背景
  accent: rgb(0.88, 0.90, 0.92),   // 强调条
};

// 间距系统（8pt 栅格）
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 页面边距
export const MARGINS = {
  top: 40,
  bottom: 54,
  left: 48,
  right: 48,
};
```

### 2. `layout.ts` - 页面布局引擎

提供页面框架、光标管理、自动分页：

```typescript
export type PageFrame = {
  page: PDFPage;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  contentTop: number;
  contentBottom: number;
  cursorY: number;
};

export function createPageFrame(doc: PDFDocument): PageFrame {
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  return {
    page,
    width,
    height,
    left: MARGINS.left,
    right: width - MARGINS.right,
    top: height - MARGINS.top,
    bottom: MARGINS.bottom,
    contentTop: height - MARGINS.top - 32, // 页眉下方安全区
    contentBottom: MARGINS.bottom + 40,    // 页脚上方安全区
    cursorY: height - MARGINS.top - 32,
  };
}

export function moveCursor(frame: PageFrame, delta: number): void {
  frame.cursorY -= delta;
}

export function needsNewPage(frame: PageFrame, requiredSpace: number): boolean {
  return frame.cursorY - requiredSpace < frame.contentBottom;
}

export function measureText(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(text, size);
}
```

### 3. `components/` - 可复用组件

#### `headerFooter.ts`
```typescript
import { drawBrandHeader, drawBrandFooter, computeBrandLayout } from "@/lib/pdf/brand";

export function addHeaderFooter(
  frame: PageFrame,
  font: PDFFont,
  meta: { planId: string; ymd: string; sig: string; pageNo: number; pageTotal: number }
) {
  const layout = computeBrandLayout(frame.page);
  drawBrandHeader(frame.page, font, layout);
  drawBrandFooter(frame.page, font, layout, meta);
}
```

#### `titles.ts`
```typescript
export function drawH1(frame: PageFrame, font: PDFFont, text: string): void {
  frame.page.drawText(text, {
    x: frame.left,
    y: frame.cursorY,
    size: FONTS.sizes.H1,
    font,
    color: COLORS.ink,
  });
  moveCursor(frame, FONTS.lineHeights.H1);
}

export function drawH2(frame: PageFrame, font: PDFFont, text: string): void {
  frame.page.drawText(text, {
    x: frame.left,
    y: frame.cursorY,
    size: FONTS.sizes.H2,
    font,
    color: COLORS.text,
  });
  moveCursor(frame, FONTS.lineHeights.H2);
}

export function drawDivider(frame: PageFrame): void {
  const contentW = frame.right - frame.left;
  frame.page.drawLine({
    start: { x: frame.left, y: frame.cursorY },
    end: { x: frame.left + contentW, y: frame.cursorY },
    thickness: 1,
    color: COLORS.line,
  });
  moveCursor(frame, SPACING.md);
}
```

#### `card.ts`
```typescript
export type CardConfig = {
  padding: { x: number; y: number };
  borderColor?: RGB;
  backgroundColor?: RGB;
  accentWidth?: number;
};

export function drawCard(
  frame: PageFrame,
  content: () => number, // 返回内容高度
  config: CardConfig
): void {
  const cardX = frame.left + 32;
  const cardW = (frame.right - frame.left) - 64;
  const cardTop = frame.cursorY;
  
  // 绘制内容并获取高度
  const contentHeight = content();
  const cardH = config.padding.y * 2 + contentHeight;
  const cardY = cardTop - cardH;
  
  // 绘制卡片背景
  frame.page.drawRectangle({
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH,
    color: config.backgroundColor ?? COLORS.card,
    borderColor: config.borderColor ?? COLORS.border,
    borderWidth: 1,
  });
  
  // 左侧强调条
  if (config.accentWidth) {
    frame.page.drawRectangle({
      x: cardX,
      y: cardY,
      width: config.accentWidth,
      height: cardH,
      color: COLORS.accent,
      borderWidth: 0,
    });
  }
  
  moveCursor(frame, cardH + SPACING.md);
}
```

#### `list.ts`
```typescript
export function drawCheckedList(
  frame: PageFrame,
  font: PDFFont,
  items: string[],
  config: { rowHeight: number; checkboxSize: number }
): void {
  const boxSize = config.checkboxSize;
  const boxX = frame.left + 20;
  const textX = boxX + boxSize + 10;
  
  for (const item of items) {
    const boxY = frame.cursorY - 3;
    
    // 绘制复选框
    frame.page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxSize,
      height: boxSize,
      borderColor: rgb(0.55, 0.60, 0.65),
      borderWidth: 1,
      color: undefined as any,
    });
    
    // 绘制对勾
    frame.page.drawLine({
      start: { x: boxX + 2, y: boxY + 8 },
      end: { x: boxX + 4, y: boxY + 5 },
      thickness: 0.9,
      color: rgb(0.25, 0.30, 0.35),
    });
    frame.page.drawLine({
      start: { x: boxX + 4, y: boxY + 5 },
      end: { x: boxX + 8, y: boxY + 11 },
      thickness: 0.9,
      color: rgb(0.25, 0.30, 0.35),
    });
    
    // 绘制文本
    frame.page.drawText(item, {
      x: textX,
      y: frame.cursorY,
      size: FONTS.sizes.BODY,
      font,
      color: COLORS.text,
    });
    
    moveCursor(frame, config.rowHeight);
  }
}
```

### 4. `sections/` - 章节模块

每个章节独立文件，例如 `toc.ts`：

```typescript
export async function renderTocPage(
  frame: PageFrame,
  font: PDFFont,
  meta: { planId: string; ymd: string; sig: string }
): Promise<void> {
  // 1. 页眉页脚
  addHeaderFooter(frame, font, { ...meta, pageNo: 2, pageTotal: 22 });
  
  // 2. 标题
  drawH1(frame, font, "目录");
  frame.page.drawText("Table of Contents", {
    x: frame.left,
    y: frame.cursorY,
    size: FONTS.sizes.SMALL,
    font,
    color: COLORS.soft,
  });
  moveCursor(frame, SPACING.lg);
  
  // 3. 分割线
  drawDivider(frame);
  
  // 4. 卡片内容
  drawCard(frame, () => {
    const items = [
      "本方案适用于 200 人规模企业的办公健身空间。",
      "建议 120m² 可落地基础有氧 + 力量配置。",
      "预算建议控制在 10–20 万，优先保障商用耐用与安全。",
    ];
    
    drawCheckedList(frame, font, items, { rowHeight: 22, checkboxSize: 10 });
    
    // 底部提示
    frame.page.drawText("注：以上为目录要点摘要，详细说明见后续章节。", {
      x: frame.left + 20,
      y: frame.cursorY,
      size: FONTS.sizes.SMALL,
      font,
      color: COLORS.mute,
    });
    
    return items.length * 22 + 20; // 返回内容高度
  }, {
    padding: { x: 20, y: 14 },
    accentWidth: 2,
  });
}
```

### 5. `renderPlan22_v2.ts` - 入口文件

```typescript
import { renderCoverPage } from "./sections/cover";
import { renderTocPage } from "./sections/toc";
import { renderExecSummaryPage } from "./sections/execSummary";
// ... 其他章节

export async function renderPlan22V2(input: Plan22Input): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  
  // 加载字体
  const fonts = await loadFonts();
  
  // 元数据
  const meta = {
    planId: input.planId,
    ymd: input.dateYmd,
    sig: input.reqsig,
  };
  
  // 第 1 页：封面
  const frame1 = createPageFrame(doc);
  await renderCoverPage(frame1, fonts.bold, meta);
  
  // 第 2 页：目录
  const frame2 = createPageFrame(doc);
  await renderTocPage(frame2, fonts.body, meta);
  
  // 第 3-4 页：执行摘要
  const frame3 = createPageFrame(doc);
  await renderExecSummaryPage(frame3, fonts.body, meta);
  
  // ... 其他 18 页
  
  // 设置 PDF 元数据
  doc.setTitle(`Plan - ${input.planId}`);
  doc.setSubject("AI Fitness Solution Plan");
  doc.setCreator("AI_FITNESS_SOLUTION");
  doc.setKeywords([`PLAN:${input.planId}`, `SIG:${meta.sig}`]);
  
  const bytes = await doc.save();
  return Buffer.from(bytes);
}
```

---

## 🚀 实施步骤

### Phase 1: 基础设施（1-2 天）
1. 创建 `lib/pdf/plan2/` 目录结构
2. 实现 `tokens.ts`（设计令牌）
3. 实现 `layout.ts`（页面框架）
4. 实现 `components/headerFooter.ts`（复用 brand.ts）

### Phase 2: 核心组件（2-3 天）
1. 实现 `components/titles.ts`（H1/H2/H3）
2. 实现 `components/card.ts`（卡片容器）
3. 实现 `components/list.ts`（列表组件）
4. 实现 `components/table.ts`（表格模块）

### Phase 3: 章节实现（5-7 天）
1. 实现 `sections/cover.ts`（封面）
2. 实现 `sections/toc.ts`（目录）- 可直接迁移现有代码
3. 实现 `sections/execSummary.ts`（执行摘要）
4. 逐步实现其他 19 个章节

### Phase 4: 集成与测试（2-3 天）
1. 实现 `renderPlan22_v2.ts` 入口
2. 创建测试路由 `/api/plan22-v2`
3. 视觉回归测试（与 golden PDF 对照）
4. 性能优化

### Phase 5: 切换与清理（1 天）
1. 将 `renderPlan22_v2.ts` 重命名为 `renderPlan22.ts`
2. 将旧的 `renderPlan22.ts` 重命名为 `renderPlan22_legacy.ts`
3. 更新路由引用
4. 保留 `public/golden/plan_attaguy-plan.pdf` 仅用于视觉对照

---

## ✅ 优势

1. **完全可控**：每一页、每个元素都是代码生成，无需覆盖
2. **可维护**：模块化设计，修改某一章节不影响其他
3. **可扩展**：新增章节只需添加新的 section 文件
4. **可测试**：每个组件可独立测试
5. **统一视觉**：通过 tokens.ts 确保全局一致性
6. **符合政府评审**：无隐藏文本，干净的 PDF 输出

---

## 📝 注意事项

1. **字体加载**：确保所有中文字体正确加载
2. **分页逻辑**：使用 `needsNewPage()` 自动处理跨页
3. **性能优化**：避免重复计算，缓存字体宽度测量
4. **视觉对照**：开发过程中与 golden PDF 对照，确保视觉一致
5. **元数据验真**：所有验真信息放在 PDF metadata，不使用隐藏文本

---

## 🔗 相关文件

- 当前实现：`lib/pdf/plan/renderPlan22.ts`
- Brand 层：`lib/pdf/brand.ts`
- 预算渲染器：`lib/pdf/budgetRender.ts`（参考实现）
- Golden PDF：`public/golden/plan_attaguy-plan.pdf`（仅用于视觉对照）
