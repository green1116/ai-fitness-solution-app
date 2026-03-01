# Plan22 V2 目录结构

```
lib/pdf/plan2/
├── 📄 tokens.ts                      # 排版令牌系统
│   ├── PAGE (页面尺寸和边距)
│   ├── TYPE (字体大小)
│   ├── LEADING (行高)
│   └── COLOR (颜色系统)
│
├── 📄 layout.ts                      # 页面框架
│   ├── PageCtx (页面上下文类型)
│   └── newPage() (创建新页面)
│
├── 📁 components/                    # 可复用组件
│   ├── 📄 headerFooter.ts
│   │   └── drawFooter() (绘制页脚)
│   │
│   └── 📄 titles.ts
│       ├── drawH1() (绘制一级标题)
│       └── drawBody() (绘制正文)
│
├── 📁 sections/                      # 章节模块
│   ├── 📄 cover.ts
│   │   └── renderCover() (封面页)
│   │
│   ├── 📄 toc.ts
│   │   └── renderTOC() (目录页)
│   │
│   └── 📄 execSummary.ts
│       └── renderExecSummary() (执行摘要页)
│
├── 📄 renderPlan22_v2.ts             # 主入口
│   ├── Plan22V2Input (输入类型)
│   └── renderPlan22PdfBytes_v2() (主渲染函数)
│
├── 📄 README.md                      # 完整架构文档
├── 📄 IMPLEMENTATION_CHECKLIST.md    # 实施清单
├── 📄 QUICKSTART.md                  # 快速开始指南
└── 📄 STRUCTURE.md                   # 本文档
```

---

## 📊 模块依赖关系

```
renderPlan22_v2.ts
  ├─→ sections/cover.ts
  │     └─→ layout.ts
  │           └─→ tokens.ts
  │
  ├─→ sections/toc.ts
  │     ├─→ layout.ts
  │     └─→ components/titles.ts
  │           └─→ tokens.ts
  │
  ├─→ sections/execSummary.ts
  │     ├─→ layout.ts
  │     └─→ components/titles.ts
  │
  └─→ components/headerFooter.ts
        └─→ tokens.ts
```

---

## 🔄 数据流

```
HTTP Request
    ↓
app/api/plan22-v2/route.ts
    ↓
renderPlan22PdfBytes_v2()
    ↓
    ├─→ renderCover()        → Page 1
    ├─→ renderTOC()          → Page 2
    ├─→ renderExecSummary()  → Page 3
    └─→ drawFooter() × N     → 所有页面（除封面）
    ↓
PDF Bytes
    ↓
HTTP Response
```

---

## 📦 已实现的功能

### ✅ 核心系统
- [x] 排版令牌系统（tokens.ts）
- [x] 页面框架（layout.ts）
- [x] 页脚组件（headerFooter.ts）
- [x] 标题组件（titles.ts）

### ✅ 章节
- [x] 封面页（cover.ts）
- [x] 目录页（toc.ts - 基础版）
- [x] 执行摘要页（execSummary.ts）

### ✅ 基础设施
- [x] 主入口（renderPlan22_v2.ts）
- [x] 测试路由（app/api/plan22-v2/route.ts）
- [x] 文档（README.md, QUICKSTART.md, IMPLEMENTATION_CHECKLIST.md）

---

## 🚧 待扩展的功能

### 组件库
- [ ] card.ts - 卡片容器
- [ ] list.ts - 列表组件（勾选、项目符号、编号）
- [ ] table.ts - 表格组件
- [ ] divider.ts - 分割线
- [ ] badge.ts - 徽章/标签
- [ ] chart.ts - 简单图表

### 章节（剩余 19 页）
- [ ] spaceAnalysis.ts - 空间分析
- [ ] equipmentPlan.ts - 设备方案
- [ ] budgetBridge.ts - 预算桥接
- [ ] implementation.ts - 实施计划
- [ ] maintenance.ts - 维保方案
- [ ] appendix.ts - 附录
- [ ] ... 其他章节

### 高级功能
- [ ] 自动分页（needsNewPage）
- [ ] 图片嵌入
- [ ] 表格自动换行
- [ ] 多列布局
- [ ] 页眉支持

---

## 📏 设计规范

### 页面尺寸
- A4: 595.28 × 841.89 pt
- 左右边距: 48 pt
- 上边距: 64 pt
- 下边距: 54 pt

### 字体系统
- H1: 18pt / 24pt 行高
- H2: 14pt / 20pt 行高
- H3: 12pt / 17pt 行高
- BODY: 10.5pt / 15pt 行高
- SMALL: 9pt / 13pt 行高

### 颜色系统
- ink: rgb(0.08, 0.10, 0.12) - 深黑（标题）
- text: rgb(0.12, 0.14, 0.16) - 正文
- mute: rgb(0.50, 0.55, 0.60) - 弱化文本
- line: rgb(0.90, 0.92, 0.94) - 分割线

---

## 🎯 设计原则

1. **模块化**: 每个章节独立文件，便于维护
2. **可复用**: 组件可在多个章节中使用
3. **类型安全**: 使用 TypeScript 类型定义
4. **简单优先**: 避免过度设计，先实现基本功能
5. **渐进增强**: 从简单到复杂，逐步扩展

---

## 📝 命名规范

### 文件命名
- 小驼峰: `execSummary.ts`, `headerFooter.ts`
- 章节文件放在 `sections/`
- 组件文件放在 `components/`

### 函数命名
- 渲染函数: `render*()` (如 `renderCover()`)
- 绘制函数: `draw*()` (如 `drawH1()`)
- 工具函数: 动词开头 (如 `newPage()`)

### 类型命名
- 大驼峰: `PageCtx`, `Plan22V2Input`
- 配置类型: `*Config` (如 `CardConfig`)
- 元数据类型: `*Meta` (如 `FooterMeta`)

---

## 🔗 相关文件

- 旧实现: `lib/pdf/plan/renderPlan22.ts`
- Brand 层: `lib/pdf/brand.ts`
- 预算渲染器: `lib/pdf/budgetRender.ts`
- Sig 工具: `lib/pdf/engine/sig.ts`
