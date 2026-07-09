"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type DeliveryLock = {
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  freezeReasonCode?: string;
  freezeReasonMessage?: string;
  frozenState?: {
    projectId?: string;
    quoteId?: string;
    tenderId?: string;
    workflowJobId?: string;
  };
  readOnly: boolean;
  deliveryLocked: boolean;
};

type IntakeFrozenBannerProps = {
  sessionId: string;
  documentCenterUrl?: string;
};

export function IntakeFrozenBanner({ sessionId, documentCenterUrl }: IntakeFrozenBannerProps) {
  const [lock, setLock] = useState<DeliveryLock | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/freeze`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setLock(data.deliveryLock as DeliveryLock);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!lock?.frozen && !lock?.deliveryLocked) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-amber-600/60 bg-amber-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
          已冻结 · 只读
        </span>
        <span className="text-sm text-amber-100/90">
          {lock.freezeReasonMessage ?? "交付已完成，intake 已锁定"}
        </span>
      </div>

      <dl className="grid gap-2 font-mono text-xs text-amber-100/70 sm:grid-cols-2">
        {lock.frozenAt ? (
          <div>
            <dt className="text-amber-700">frozenAt</dt>
            <dd>{new Date(lock.frozenAt).toLocaleString()}</dd>
          </div>
        ) : null}
        {lock.frozenBy ? (
          <div>
            <dt className="text-amber-700">frozenBy</dt>
            <dd>{lock.frozenBy}</dd>
          </div>
        ) : null}
        {lock.freezeReasonCode ? (
          <div>
            <dt className="text-amber-700">reason</dt>
            <dd>{lock.freezeReasonCode}</dd>
          </div>
        ) : null}
        {lock.frozenState?.projectId ? (
          <div>
            <dt className="text-amber-700">projectId</dt>
            <dd className="break-all">{lock.frozenState.projectId}</dd>
          </div>
        ) : null}
        {lock.frozenState?.quoteId ? (
          <div>
            <dt className="text-amber-700">quoteId</dt>
            <dd>{lock.frozenState.quoteId}</dd>
          </div>
        ) : null}
        {lock.frozenState?.tenderId ? (
          <div>
            <dt className="text-amber-700">tenderId</dt>
            <dd>{lock.frozenState.tenderId}</dd>
          </div>
        ) : null}
        {lock.frozenState?.workflowJobId ? (
          <div>
            <dt className="text-amber-700">workflowJobId</dt>
            <dd className="break-all">{lock.frozenState.workflowJobId}</dd>
          </div>
        ) : null}
      </dl>

      {documentCenterUrl ? (
        <Link
          href={documentCenterUrl}
          className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          打开 Document Center
        </Link>
      ) : null}
    </section>
  );
}
