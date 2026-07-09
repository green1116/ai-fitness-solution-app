"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type QueueItem = {
  sessionId: string;
  releasePackageId: string;
  projectName?: string;
  fileName: string;
  packageStatus: string;
  signedOffAt: string;
  linkage: Record<string, string | undefined>;
  artifactLinks: Array<{ kind: string; label: string; status: string; openUrl?: string }>;
  lastWorkflowEvent?: { step?: string; timestamp: string; message?: string };
  tracking: {
    opened: boolean;
    downloaded: boolean;
    viewed: boolean;
    pendingAction: boolean;
    failed: boolean;
  };
  readOnly: true;
};

type Notification = {
  id: string;
  kind: string;
  message: string;
  timestamp: string;
  sessionId: string;
};

const STATUS_LABELS: Record<string, string> = {
  released: "已发布",
  opened: "已打开",
  downloaded: "已下载",
  viewed: "已查看",
  pending_action: "待处理",
  failed_delivery: "交付失败",
};

export function DeliveryOpsDashboard() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v81/delivery-ops");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      setItems(data.dashboard?.items ?? []);
      setNotifications(data.dashboard?.notifications ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function track(sessionId: string, type: string) {
    setActing(`${sessionId}:${type}`);
    try {
      const res = await fetch(
        `/api/pilot/v81/delivery-ops/${encodeURIComponent(sessionId)}/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "追踪失败");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "追踪失败");
    } finally {
      setActing("");
    }
  }

  async function exportBundle(sessionId: string, packageId: string) {
    setActing(`export:${sessionId}`);
    try {
      const res = await fetch(
        `/api/pilot/v81/delivery-ops/${encodeURIComponent(sessionId)}/export`,
      );
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `delivery-export-${packageId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await track(sessionId, "artifact_downloaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "导出失败");
    } finally {
      setActing("");
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载交付运营面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">已发布项目</h2>
          <p className="mt-1 text-sm text-zinc-400">
            签收后只读 — {items.length} 个发布包
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {notifications.length > 0 ? (
        <section className="space-y-2 rounded-2xl border border-violet-900/40 bg-violet-950/20 p-4">
          <h3 className="text-sm font-medium text-violet-200">通知</h3>
          <ul className="space-y-1 text-xs">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="text-zinc-400">
                <span className="font-mono text-violet-400">{n.kind}</span> — {n.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-sm text-zinc-500">
          暂无已签收项目。完成{" "}
          <Link href="/pilot/intake" className="text-sky-400 underline">
            Intake 签收
          </Link>{" "}
          后将出现在此列表。
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.sessionId}
              className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">
                    {item.projectName ?? item.fileName}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {item.releasePackageId} · {new Date(item.signedOffAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                  {STATUS_LABELS[item.packageStatus] ?? item.packageStatus}
                </span>
              </div>

              <dl className="grid gap-1 font-mono text-xs text-zinc-500 sm:grid-cols-2">
                {Object.entries(item.linkage).map(([key, value]) =>
                  value ? (
                    <div key={key}>
                      <dt className="inline text-zinc-600">{key}: </dt>
                      <dd className="inline break-all text-zinc-400">{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>

              {item.lastWorkflowEvent ? (
                <p className="text-xs text-zinc-500">
                  最近工作流：{item.lastWorkflowEvent.step} ·{" "}
                  {new Date(item.lastWorkflowEvent.timestamp).toLocaleString()}
                </p>
              ) : null}

              {item.artifactLinks.length > 0 ? (
                <ul className="flex flex-wrap gap-2 text-xs">
                  {item.artifactLinks.map((a) => (
                    <li key={`${a.kind}-${a.label}`}>
                      {a.openUrl ? (
                        <a
                          href={a.openUrl}
                          className="rounded border border-zinc-700 px-2 py-1 text-sky-300 hover:bg-zinc-900"
                          onClick={() => void track(item.sessionId, "artifact_viewed")}
                        >
                          {a.label}
                        </a>
                      ) : (
                        <span className="text-zinc-500">{a.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                {item.tracking.opened ? <span className="text-emerald-500">已打开</span> : null}
                {item.tracking.viewed ? <span className="text-emerald-500">已查看</span> : null}
                {item.tracking.downloaded ? (
                  <span className="text-emerald-500">已下载</span>
                ) : null}
                {item.tracking.pendingAction ? (
                  <span className="text-amber-400">待处理</span>
                ) : null}
                {item.tracking.failed ? <span className="text-red-400">失败</span> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={acting !== ""}
                  onClick={() => void track(item.sessionId, "delivery_opened")}
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  记录打开
                </button>
                <button
                  type="button"
                  disabled={acting !== ""}
                  onClick={() => void exportBundle(item.sessionId, item.releasePackageId)}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  导出发布包
                </button>
                <Link
                  href={`/pilot/intake`}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400"
                >
                  Intake 追溯
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
