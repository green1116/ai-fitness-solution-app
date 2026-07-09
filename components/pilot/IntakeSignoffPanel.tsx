"use client";

import { useCallback, useEffect, useState } from "react";

type ReadinessState = "pass" | "blocked" | "frozen" | "released";

type SignoffReport = {
  readiness: {
    state: ReadinessState;
    reasonCode: string;
    reasonMessage: string;
    lastEventAt?: string;
    lastWorkflowStep?: string;
  };
  gateSummary: {
    gates: Array<{ phase: string; label: string; ok: boolean }>;
    allGatesPass: boolean;
  };
  releaseManifest: {
    manifestId: string;
    builtAt: string;
    linkage: Record<string, string | undefined>;
    workflow: { status: string; phase: string; lastStep?: string };
    artifacts: Array<{
      kind: string;
      label: string;
      status: string;
      downloadUrl?: string;
      openUrl?: string;
    }>;
  };
  rollbackIndex: Array<{
    id: string;
    label: string;
    available: boolean;
    requiresExplicitAdmin: boolean;
    description: string;
  }>;
  deliveryChecklist: Array<{ id: string; label: string; ok: boolean; detail?: string }>;
  signoffState: {
    signedOff: boolean;
    signedOffAt?: string;
    signedOffBy?: string;
    releasePackageId?: string;
    canSignOff: boolean;
    blockReason?: string;
  };
};

const STATE_LABELS: Record<ReadinessState, string> = {
  pass: "可签收",
  blocked: "阻塞",
  frozen: "已冻结",
  released: "已发布",
};

const STATE_COLORS: Record<ReadinessState, string> = {
  pass: "text-emerald-300 border-emerald-800/60 bg-emerald-950/30",
  blocked: "text-red-300 border-red-800/60 bg-red-950/30",
  frozen: "text-amber-300 border-amber-800/60 bg-amber-950/30",
  released: "text-sky-300 border-sky-800/60 bg-sky-950/30",
};

type IntakeSignoffPanelProps = {
  sessionId: string;
  frozen?: boolean;
  onSignedOff?: () => void;
};

export function IntakeSignoffPanel({ sessionId, frozen, onSignedOff }: IntakeSignoffPanelProps) {
  const [report, setReport] = useState<SignoffReport | null>(null);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/signoff`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载签收报告失败");
      setReport(data.report as SignoffReport);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载签收报告失败");
    }
  }, [sessionId]);

  useEffect(() => {
    if (frozen) void load();
  }, [frozen, load]);

  async function handleSignOff() {
    setSigning(true);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/signoff`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "签收失败");
      await load();
      onSignedOff?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "签收失败");
    } finally {
      setSigning(false);
    }
  }

  if (!frozen) return null;

  if (!report) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm text-zinc-500">加载签收报告…</p>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </section>
    );
  }

  const readiness = report.readiness;

  return (
    <section className="space-y-6 rounded-2xl border border-violet-900/40 bg-violet-950/20 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-violet-200">最终签收 & 发布包</h2>
          <p className="mt-1 text-sm text-zinc-400">Pilot P8 — 冻结后完成闭环签收</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATE_COLORS[readiness.state]}`}
        >
          {STATE_LABELS[readiness.state]}
        </span>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-black/30 p-4 text-sm">
        <p className="text-zinc-300">{readiness.reasonMessage}</p>
        <dl className="mt-2 grid gap-1 font-mono text-xs text-zinc-500 sm:grid-cols-2">
          <div>
            <dt className="inline text-zinc-600">reason: </dt>
            <dd className="inline">{readiness.reasonCode}</dd>
          </div>
          {readiness.lastEventAt ? (
            <div>
              <dt className="inline text-zinc-600">lastEvent: </dt>
              <dd className="inline">{new Date(readiness.lastEventAt).toLocaleString()}</dd>
            </div>
          ) : null}
          {readiness.lastWorkflowStep ? (
            <div>
              <dt className="inline text-zinc-600">workflow: </dt>
              <dd className="inline">{readiness.lastWorkflowStep}</dd>
            </div>
          ) : null}
          {report.signoffState.releasePackageId ? (
            <div>
              <dt className="inline text-zinc-600">packageId: </dt>
              <dd className="inline break-all">{report.signoffState.releasePackageId}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300">交付清单</h3>
        <ul className="mt-2 space-y-1">
          {report.deliveryChecklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800/80 px-3 py-2 text-xs"
            >
              <span className={item.ok ? "text-emerald-300" : "text-zinc-400"}>
                {item.ok ? "✓" : "○"} {item.label}
              </span>
              {item.detail ? <span className="text-zinc-600">{item.detail}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300">发布门禁 P1–P8</h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {report.gateSummary.gates.map((gate) => (
            <li
              key={gate.phase}
              className="flex items-center gap-2 rounded border border-zinc-800/60 px-2 py-1.5 text-xs"
            >
              <span className={gate.ok ? "text-emerald-400" : "text-zinc-600"}>
                {gate.ok ? "✓" : "○"}
              </span>
              <span className="font-mono text-violet-400">{gate.phase}</span>
              <span className="text-zinc-400">{gate.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300">发布摘要 — 稳定 ID</h3>
        <dl className="mt-2 grid gap-1 font-mono text-xs text-zinc-400 sm:grid-cols-2">
          {Object.entries(report.releaseManifest.linkage).map(([key, value]) =>
            value ? (
              <div key={key}>
                <dt className="text-zinc-600">{key}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      {report.releaseManifest.artifacts.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-zinc-300">产物链接</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {report.releaseManifest.artifacts.map((a) => (
              <li key={`${a.kind}-${a.label}`} className="flex items-center gap-2 text-zinc-400">
                <span className="text-emerald-400">{a.status}</span>
                <span>{a.label}</span>
                {a.openUrl ? (
                  <a href={a.openUrl} className="text-sky-300 underline">
                    打开
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-medium text-zinc-300">回滚索引</h3>
        <ul className="mt-2 space-y-2">
          {report.rollbackIndex.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={entry.available ? "text-amber-300" : "text-zinc-600"}>
                  {entry.label}
                </span>
                {entry.requiresExplicitAdmin ? (
                  <span className="rounded bg-amber-950/50 px-1.5 py-0.5 text-amber-500">
                    admin only
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-zinc-500">{entry.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {report.signoffState.signedOff ? (
        <p className="text-sm text-emerald-300">
          已于 {report.signoffState.signedOffAt ? new Date(report.signoffState.signedOffAt).toLocaleString() : "—"}{" "}
          完成签收
        </p>
      ) : report.signoffState.canSignOff ? (
        <button
          type="button"
          disabled={signing}
          onClick={() => void handleSignOff()}
          className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {signing ? "签收中…" : "确认最终签收 → 发布包"}
        </button>
      ) : (
        <p className="text-sm text-amber-300">
          签收阻塞：{report.signoffState.blockReason ?? "条件未满足"}
        </p>
      )}
    </section>
  );
}
