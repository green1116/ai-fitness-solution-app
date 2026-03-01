# 预算 PDF 双层级系统实施清单

## ✅ 已完成

### Phase 1: 架构设计与类型定义
- [x] 创建架构设计文档 `ARCHITECTURE.md`
- [x] 创建类型定义文件 `types.ts`
- [x] 定义 `BudgetLevel` 类型
- [x] 定义 `BudgetItemStrict` 类型
- [x] 定义 `OptionalSurface` 类型
- [x] 定义 `GovernmentBudgetInput` 类型
- [x] 实现 `generateDocNumber()` 函数
- [x] 实现 `extractMin()` / `extractMax()` 辅助函数
- [x] 实现 `createRubberMatItem()` 函数
- [x] 实现 `createSportFloorItem()` 函数
- [x] 实现 `validateTotals()` 函数
- [x] 通过 linter 检查

---

## 📋 待实施

### Phase 2: 数据处理层（优先级：高）

#### 2.1 创建 `lib/pdf/budget/dataBuilder.ts`
- [ ] 实现 `buildStrictItems(input: GovernmentBudgetInput): Promise<BudgetItemStrict[]>`
  - [ ] 调用 `getBudgetSummary()` 获取基础数据
  - [ ] 转换为严格结构（使用 `extractMin/Max`）
  - [ ] 计算小计（`subtotalMin/Max`）
  - [ ] 添加可选地面项
  - [ ] 排序和编号
- [ ] 实现 `buildCategorySummary(items: BudgetItemStrict[]): CategorySummary[]`
  - [ ] 按类别分组
  - [ ] 计算每个类别的总计
- [ ] 添加单元测试

#### 2.2 创建 `lib/pdf/budget/__tests__/dataBuilder.test.ts`
- [ ] 测试 `buildStrictItems()` 基本功能
- [ ] 测试可选地面项添加
- [ ] 测试总计校验
- [ ] 测试边界情况

---

### Phase 3: Government 渲染器（优先级：高）

#### 3.1 创建 `lib/pdf/budget/renderGovernment.ts`

**第 1 页：封面**
- [ ] 实现 `renderCoverPage()`
  - [ ] 绘制 Logo 和标题
  - [ ] 显示文档编号（AFS-GOV-YYYYMMDD-PLANID-01）
  - [ ] 显示项目信息
  - [ ] 显示编制日期
  - [ ] 添加密级标识（如需要）

**第 2 页：总览**
- [ ] 实现 `renderOverviewPage()`
  - [ ] 项目概况（企业规模、预算档位、建议面积）
  - [ ] 预算总计（带背景条）
  - [ ] 分项汇总表（类别、最小值、最大值）
  - [ ] 统一页脚

**第 3-4 页：详细清单**
- [ ] 实现 `renderDetailPages()`
  - [ ] 表头：序号、类别、名称、数量、单价、小计、备注
  - [ ] 自动分页（每页最多 25 行）
  - [ ] 合计行（加粗显示）
  - [ ] 统一页脚

**第 5 页：技术规格**
- [ ] 实现 `renderSpecPage()`
  - [ ] 有氧设备规格要求
  - [ ] 力量设备规格要求
  - [ ] 地面配套规格要求
  - [ ] 其他技术要求

**第 6 页：附件与签章**
- [ ] 实现 `renderAppendixPage()`
  - [ ] 附件说明列表
  - [ ] 编制说明
  - [ ] 签章区（编制人、审核人、批准人）
  - [ ] 单位公章区域

**主函数**
- [ ] 实现 `renderGovernmentStrict(input, opts): Promise<Uint8Array>`
  - [ ] 调用 `buildStrictItems()`
  - [ ] 调用 `validateTotals()`
  - [ ] 生成文档编号
  - [ ] 渲染所有页面
  - [ ] 设置 PDF 元数据

---

### Phase 4: 主入口重构（优先级：中）

#### 4.1 修改 `lib/pdf/budgetRender.ts`
- [ ] 添加 `level` 参数到 `RenderBudgetPdfOpts`
- [ ] 实现分流逻辑
  ```typescript
  if (level === "brand") {
    return renderCompact2Pages(input, opts);
  }
  if (level === "government") {
    return renderGovernmentStrict(input, opts);
  }
  ```
- [ ] 保持向后兼容（默认 `level = "brand"`）
- [ ] 更新类型导出

#### 4.2 重构现有 Brand 渲染器
- [ ] 将当前主函数重命名为 `renderCompact2Pages()`
- [ ] 保持功能不变
- [ ] 添加注释说明

---

### Phase 5: 测试与文档（优先级：中）

#### 5.1 创建测试路由
- [ ] 创建 `app/api/budget-gov/route.ts`
- [ ] 支持查询参数：
  - `planId`
  - `companyName`
  - `companySize`
  - `budgetTier`
  - `rubberMat` (boolean)
  - `sportFloor` (boolean)
  - `projectName`
  - `projectCode`
- [ ] 返回 PDF 响应

#### 5.2 视觉回归测试
- [ ] 生成测试 PDF（Brand 级别）
- [ ] 生成测试 PDF（Government 级别）
- [ ] 对比页数、布局、内容
- [ ] 验证总计校验功能

#### 5.3 更新文档
- [ ] 更新 `README.md`
- [ ] 添加使用示例
- [ ] 添加 API 文档
- [ ] 添加常见问题 FAQ

---

### Phase 6: 优化与扩展（优先级：低）

#### 6.1 性能优化
- [ ] 缓存字体加载
- [ ] 优化表格渲染
- [ ] 减少内存占用

#### 6.2 功能扩展
- [ ] 支持自定义 Logo
- [ ] 支持多语言（中英文）
- [ ] 支持导出 Excel 格式
- [ ] 支持批量生成

#### 6.3 UI 增强
- [ ] 添加水印功能
- [ ] 添加二维码（验真）
- [ ] 优化表格样式
- [ ] 添加图表支持

---

## 🎯 当前优先级

### 立即可做（本周）
1. ✅ 完成 Phase 1（已完成）
2. 🔄 开始 Phase 2：数据处理层
   - 创建 `dataBuilder.ts`
   - 实现 `buildStrictItems()`
   - 添加基础测试

### 短期目标（下周）
3. 开始 Phase 3：Government 渲染器
   - 实现封面页
   - 实现总览页
   - 实现详细清单页

### 中期目标（2 周内）
4. 完成 Phase 4：主入口重构
5. 完成 Phase 5：测试与文档

### 长期目标（1 个月内）
6. Phase 6：优化与扩展

---

## 📝 注意事项

### 数据一致性
- 所有金额单位统一为 CNY
- 小计必须等于 `qty * price`
- 总计必须等于所有小计之和
- 使用 `validateTotals()` 强制校验

### 文档编号
- 格式：`AFS-GOV-YYYYMMDD-PLANID-01`
- PLANID 必须大写
- 序号从 01 开始
- 日期使用生成日期（非项目日期）

### 可选地面
- 默认不包含
- 必须明确指定 `optionalSurface.rubberMat` 或 `sportFloor`
- 面积按企业规模自动计算
- 单价使用市场参考价

### 向后兼容
- 现有 Brand 级别功能不受影响
- 默认 `level = "brand"`
- API 保持兼容

---

## 🔗 相关文件

- 架构设计：`ARCHITECTURE.md`
- 类型定义：`types.ts`
- 当前实现：`../budgetRender.ts`
- 主题系统：`../theme.ts`
- 数据源：`../../services/budgetService.ts`

---

## 🐛 已知问题

目前没有已知问题。

---

## 📞 支持

如有问题，请查看：
- 架构设计：`ARCHITECTURE.md`
- 实施清单：本文档
- 类型定义：`types.ts`
