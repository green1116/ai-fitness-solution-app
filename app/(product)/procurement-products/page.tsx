import Link from "next/link";
import { redirect } from "next/navigation";

import { canManageProcurementProducts } from "@/app/api/procurement-products/shared";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { resolveExactSingleOrganizationForUser } from "@/lib/organization/single-org-context";
import {
  MAX_PROCUREMENT_KEY_SPEC_LENGTH,
  MAX_PROCUREMENT_KEY_SPECS,
  PROCUREMENT_PRODUCT_CATEGORY_OPTIONS,
} from "@/lib/product-engine/product-intelligence";

import { ProcurementCatalogManager } from "./ProcurementCatalogManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProcurementProductsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const org = await resolveExactSingleOrganizationForUser(user.id);
  const canManage = org.ok && canManageProcurementProducts(org.role);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">组织采购库</h1>
        <p className="text-sm text-zinc-300">
          这里维护组织实际采购的产品（品牌 / 型号 / 关键参数），可在已支持的设备子品类下登记多个品牌与型号。启用的产品会作为「采购库产品」出现在方案的设备候选中。
        </p>
        <p className="text-sm text-zinc-400">
          产品身份（品牌、型号、参数）来自采购资料登记，参数未核实；只有填写了供应商报价或采购合同的核实采购价，预算才按核实价计价。修改或停用只影响之后新的选择，已保存的方案和预算快照保持原样。
        </p>
        {org.ok && !canManage ? (
          <p className="text-sm text-amber-300">当前账号为只读：仅组织所有者或管理员可新增、编辑或停用。</p>
        ) : null}
      </div>

      {org.ok ? (
        <ProcurementCatalogManager
          organizationId={org.organizationId}
          canManage={canManage}
          categoryOptions={PROCUREMENT_PRODUCT_CATEGORY_OPTIONS}
          keySpecLimits={{ maxCount: MAX_PROCUREMENT_KEY_SPECS, maxLength: MAX_PROCUREMENT_KEY_SPEC_LENGTH }}
        />
      ) : (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
          无法确定当前组织，暂不能查看组织采购库。
        </p>
      )}

      <Link href="/quote" className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200">
        ← 返回方案
      </Link>
    </div>
  );
}
