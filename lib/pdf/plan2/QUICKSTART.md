# Plan22 V2 快速开始

## 🎯 已完成的基础框架

### ✅ 核心模块
- `tokens.ts` - 排版令牌系统（页面尺寸、字体、颜色）
- `layout.ts` - 页面框架（newPage, PageCtx）
- `components/headerFooter.ts` - 页脚组件
- `components/titles.ts` - 标题组件（H1, Body）
- `sections/cover.ts` - 封面页
- `sections/toc.ts` - 目录页
- `sections/execSummary.ts` - 执行摘要页
- `renderPlan22_v2.ts` - 主入口

### ✅ 测试路由
- `app/api/plan22-v2/route.ts` - HTTP 测试接口

---

## 🚀 测试方法

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问测试 URL
```
http://localhost:3000/api/plan22-v2?planId=test-001&companyName=测试企业
```

### 3. 查看生成的 PDF
浏览器会直接显示生成的 PDF，包含：
- 第 1 页：封面（居中布局，包含企业名称、Plan ID、日期）
- 第 2 页：目录（简单列表）
- 第 3 页：执行摘要（三条要点）

所有页面（除封面外）都有统一的页脚：
- 左侧：Plan ID | 日期 | 页码 | SIG
- 右侧：AI Fitness Solution

---

## 📁 目录结构

```
lib/pdf/plan2/
├── tokens.ts                      # 排版令牌
├── layout.ts                      # 页面框架
├── components/
│   ├── headerFooter.ts            # 页脚
│   └── titles.ts                  # 标题组件
├── sections/
│   ├── cover.ts                   # 封面
│   ├── toc.ts                     # 目录
│   └── execSummary.ts             # 执行摘要
├── renderPlan22_v2.ts             # 主入口
├── README.md                      # 完整架构文档
├── IMPLEMENTATION_CHECKLIST.md    # 实施清单
└── QUICKSTART.md                  # 本文档
```

---

## 🔧 下一步开发

### 1. 扩展 TOC 页（使用现有代码）
将 `renderPlan22.ts` 中的 TOC 页代码迁移到 `sections/toc.ts`：
- 双层标题（中文 + 英文）
- 分割线
- 卡片容器
- 勾选列表
- 底部提示

### 2. 添加更多章节
按照 `sections/execSummary.ts` 的模式创建：
- `spaceAnalysis.ts` - 空间分析
- `equipmentPlan.ts` - 设备方案
- `budgetBridge.ts` - 预算桥接
- `implementation.ts` - 实施计划
- 等等...

### 3. 增强组件库
在 `components/` 下添加：
- `card.ts` - 卡片容器
- `list.ts` - 列表组件（勾选、项目符号、编号）
- `table.ts` - 表格组件
- `divider.ts` - 分割线

### 4. 完善 tokens
根据需要扩展 `tokens.ts`：
- 更多字号（H4, H5, Caption）
- 更多颜色（success, warning, error）
- 间距系统（xs, sm, md, lg, xl）

---

## 📝 代码示例

### 添加新章节

```typescript
// lib/pdf/plan2/sections/mySection.ts
import { PDFDocument, PDFFont } from "pdf-lib";
import { newPage } from "../layout";
import { drawH1, drawBody } from "../components/titles";

export function renderMySection(
  doc: PDFDocument,
  font: PDFFont
) {
  const ctx = newPage(doc);
  let y = ctx.cursorY;

  y = drawH1(ctx.page, font, y, "我的章节");
  y = drawBody(ctx.page, font, y, "这是内容...");
}
```

### 在主入口中使用

```typescript
// lib/pdf/plan2/renderPlan22_v2.ts
import { renderMySection } from "./sections/mySection";

// 在 renderPlan22PdfBytes_v2 函数中添加：
renderMySection(doc, font);
```

---

## ✅ 优势对比

### 当前 v2 架构 vs 旧的 golden 回放

| 特性 | V2 生成式 | V1 Golden 回放 |
|------|----------|---------------|
| 可控性 | ✅ 完全可控 | ❌ 需要覆盖 |
| 可维护性 | ✅ 模块化 | ❌ 单一大文件 |
| 可扩展性 | ✅ 添加章节容易 | ❌ 需要修改模板 |
| 视觉冲突 | ✅ 无冲突 | ❌ 经常重叠 |
| 调试难度 | ✅ 简单 | ❌ 困难 |
| 性能 | ✅ 快速 | ⚠️ 需要加载模板 |

---

## 🐛 已知问题

目前没有已知问题，所有模块都通过了 linter 检查。

---

## 📞 支持

如有问题，请查看：
- 完整架构文档：`README.md`
- 实施清单：`IMPLEMENTATION_CHECKLIST.md`
- 旧实现参考：`lib/pdf/plan/renderPlan22.ts`
