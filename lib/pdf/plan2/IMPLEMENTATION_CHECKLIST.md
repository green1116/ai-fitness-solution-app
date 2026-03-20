# Plan22 生成式引擎实施检查清单

## ✅ 已完成

- [x] 删除预算 PDF 的所有隐藏探针（`addHiddenProbe`）
- [x] 创建 `lib/pdf/plan2/` 目录
- [x] 编写架构设计文档（README.md）

---

## 📋 待实施（按优先级）

### Phase 1: 基础设施
- [ ] 创建 `tokens.ts`
  - [ ] 定义字体系统（sizes, lineHeights）
  - [ ] 定义颜色系统（ink, text, mute, soft, line, border, card, accent）
  - [ ] 定义间距系统（xs, sm, md, lg, xl, xxl）
  - [ ] 定义页面边距（top, bottom, left, right）

- [ ] 创建 `layout.ts`
  - [ ] 实现 `PageFrame` 类型
  - [ ] 实现 `createPageFrame()` 函数
  - [ ] 实现 `moveCursor()` 函数
  - [ ] 实现 `needsNewPage()` 函数
  - [ ] 实现 `measureText()` 函数

- [ ] 创建 `components/headerFooter.ts`
  - [ ] 实现 `addHeaderFooter()` 函数（复用 brand.ts）

### Phase 2: 核心组件
- [ ] 创建 `components/titles.ts`
  - [ ] 实现 `drawH1()` 函数
  - [ ] 实现 `drawH2()` 函数
  - [ ] 实现 `drawH3()` 函数
  - [ ] 实现 `drawKicker()` 函数（副标题）
  - [ ] 实现 `drawDivider()` 函数（分割线）

- [ ] 创建 `components/card.ts`
  - [ ] 定义 `CardConfig` 类型
  - [ ] 实现 `drawCard()` 函数
  - [ ] 支持左侧强调条
  - [ ] 支持自定义背景色和边框色

- [ ] 创建 `components/list.ts`
  - [ ] 实现 `drawCheckedList()` 函数（勾选列表）
  - [ ] 实现 `drawBulletList()` 函数（项目符号）
  - [ ] 实现 `drawNumberedList()` 函数（编号列表）

- [ ] 创建 `components/table.ts`
  - [ ] 实现 `drawTable()` 函数
  - [ ] 支持自动分页
  - [ ] 支持表头重复
  - [ ] 支持不同列宽

### Phase 3: 章节实现（22 页）
- [ ] 创建 `sections/cover.ts`（第 1 页）
  - [ ] 实现封面布局
  - [ ] 添加标题、副标题
  - [ ] 添加企业信息
  - [ ] 添加日期和版本

- [ ] 创建 `sections/toc.ts`（第 2 页）
  - [ ] 迁移现有 TOC 代码
  - [ ] 使用 `drawCard()` 和 `drawCheckedList()`
  - [ ] 确保与当前视觉一致

- [ ] 创建 `sections/execSummary.ts`（第 3-4 页）
  - [ ] 实现执行摘要布局
  - [ ] 添加关键指标卡片
  - [ ] 添加方案亮点

- [ ] 创建 `sections/spaceAnalysis.ts`（第 5-7 页）
  - [ ] 实现空间分析章节
  - [ ] 添加平面图（如有）
  - [ ] 添加空间分区说明

- [ ] 创建 `sections/equipmentPlan.ts`（第 8-12 页）
  - [ ] 实现设备方案章节
  - [ ] 使用 `drawTable()` 绘制设备清单
  - [ ] 添加设备图片（如有）

- [ ] 创建 `sections/budgetBridge.ts`（第 13-15 页）
  - [ ] 实现预算桥接章节
  - [ ] 添加预算对比表
  - [ ] 添加成本分析图表

- [ ] 创建 `sections/implementation.ts`（第 16-18 页）
  - [ ] 实现实施计划章节
  - [ ] 添加时间轴
  - [ ] 添加里程碑

- [ ] 创建 `sections/maintenance.ts`（第 19-20 页）
  - [ ] 实现维保方案章节
  - [ ] 添加维保计划表

- [ ] 创建 `sections/appendix.ts`（第 21-22 页）
  - [ ] 实现附录章节
  - [ ] 添加补充说明
  - [ ] 添加联系方式

### Phase 4: 集成与测试
- [ ] 创建 `renderPlan22_v2.ts` 入口
  - [ ] 实现主渲染函数
  - [ ] 按顺序调用所有章节
  - [ ] 设置 PDF 元数据
  - [ ] 添加错误处理

- [ ] 创建测试路由
  - [ ] 创建 `/api/plan22-v2` 测试路由
  - [ ] 添加参数验证
  - [ ] 添加日志记录

- [ ] 视觉回归测试
  - [ ] 与 golden PDF 逐页对照
  - [ ] 检查字体、颜色、间距
  - [ ] 检查页眉页脚
  - [ ] 检查分页逻辑

- [ ] 性能优化
  - [ ] 测量渲染时间
  - [ ] 优化字体加载
  - [ ] 缓存重复计算
  - [ ] 减少内存占用

### Phase 5: 切换与清理
- [ ] 重命名文件
  - [ ] `renderPlan22.ts` → `renderPlan22_legacy.ts`
  - [ ] `renderPlan22_v2.ts` → `renderPlan22.ts`

- [ ] 更新路由引用
  - [ ] 更新 `/api/tender-pack/route.ts`
  - [ ] 更新其他引用位置

- [ ] 清理代码
  - [ ] 删除未使用的导入
  - [ ] 添加 JSDoc 注释
  - [ ] 运行 linter 检查

- [ ] 文档更新
  - [ ] 更新项目 README
  - [ ] 更新 API 文档
  - [ ] 添加使用示例

---

## 🎯 当前状态

**进度**: Phase 0 完成（准备工作）

**下一步**: 开始 Phase 1 - 创建 `tokens.ts` 和 `layout.ts`

**预计完成时间**: 10-15 天（根据实际情况调整）

---

## 📝 注意事项

1. **渐进式实施**：先实现 1-2 个章节，确保架构可行，再扩展到所有章节
2. **视觉对照**：每完成一个章节，立即与 golden PDF 对照
3. **测试驱动**：每个组件实现后立即测试
4. **代码复用**：尽可能复用现有代码（brand.ts, budgetRender.ts）
5. **保持简单**：避免过度设计，先实现基本功能

---

## 🔗 相关资源

- 架构设计：`lib/pdf/plan2/README.md`
- 当前实现：`lib/pdf/plan/renderPlan22.ts`
- Brand 层：`lib/pdf/brand.ts`
- 预算渲染器：`lib/pdf/budgetRender.ts`
- Golden PDF：`public/golden/plan_attaguy-plan.pdf`
