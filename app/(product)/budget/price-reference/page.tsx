import Link from "next/link";
import { redirect } from "next/navigation";

import { canManagePriceReferences } from "@/app/api/organization-price-references/shared";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { resolveExactSingleOrganizationForUser } from "@/lib/organization/single-org-context";

import { PriceReferenceManager } from "./PriceReferenceManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PriceReferencePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const org = await resolveExactSingleOrganizationForUser(user.id);
  const canManage = org.ok && canManagePriceReferences(org.role);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">组织估算价目表</h1>
        <p className="text-sm text-zinc-300">
          这里维护的是组织自己的预算估算单价区间，用于尚未提供核实单价的预算项。它不会覆盖已核实单价。
        </p>
        <p className="text-sm text-zinc-400">
          组织价目仍属于 ESTIMATE（估算），不是供应商报价或已核实采购价。未设置的子品类 × 档位使用平台通用估算；修改或停用只影响之后新计算的预算，已生成的预算保持原样。
        </p>
        {org.ok && !canManage ? (
          <p className="text-sm text-amber-300">当前账号为只读：仅组织所有者或管理员可新增、编辑或停用。</p>
        ) : null}
      </div>

      {org.ok ? (
        <PriceReferenceManager organizationId={org.organizationId} canManage={canManage} />
      ) : (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
          无法确定当前组织，暂不能查看组织估算价目表。
        </p>
      )}

      <Link href="/budget" className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200">
        ← 返回预算
      </Link>
    </div>
  );
}
