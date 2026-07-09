"use client";

import { CustomerSuccessDashboard } from "@/components/pilot/CustomerSuccessDashboard";

export default function PilotCustomerSuccessPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V84 — Customer Success</h1>
        <p className="mt-2 text-sm text-zinc-400">
          跟进工作流 · 留存行动 · CRM 视图 · 仅写跟进状态
        </p>
      </div>

      <CustomerSuccessDashboard />
    </div>
  );
}
