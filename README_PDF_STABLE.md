# PDF 引擎稳定版本说明

## 📌 当前稳定版本

Tag: `pdf-stable-2026-02-16`

状态：

- 方案 PDF：22 页（18 主体 + 附录 A-D）
- 预算 PDF：2 页
- 中文字体：NotoSansSC-Regular.ttf
- 预算与方案完全解耦（不同路由）

---

## 🔑 关键路径（不要随意改）

### 方案链路

lib/pdf/render.ts  
app/api/pdf/route.ts  

### 预算链路

lib/pdf/budget.ts  
lib/pdf/renderBudget.ts  
lib/pdf/table.ts  
app/api/budget-pdf/route.ts  

### 前端入口

components/DownloadPdfButton.tsx  

### 字体

public/fonts/NotoSansSC-Regular.ttf  

---

## 🛡 以后改动规范

1. 不在 main 上直接开发
2. 使用分支开发（例如：pdf-next）
3. 每次大改前先打 tag

---

## 🚑 快速回滚命令

如 PDF 出现异常（页数错误 / 预算变方案 / 中文乱码）：

```bash
git checkout pdf-stable-2026-02-16 -- lib/pdf
git checkout pdf-stable-2026-02-16 -- app/api/pdf
git checkout pdf-stable-2026-02-16 -- app/api/budget-pdf
git checkout pdf-stable-2026-02-16 -- components/DownloadPdfButton.tsx
git checkout pdf-stable-2026-02-16 -- public/fonts
