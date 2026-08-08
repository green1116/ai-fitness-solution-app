"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClarificationState, TenderRequirements } from "@/lib/pilot/v80";

type Props = {
  sessionId: string;
  readOnly?: boolean;
  onRequirementsChange: (req: TenderRequirements, meta?: { revision?: number }) => void;
};

export function IntakeClarificationPanel({
  sessionId,
  readOnly = false,
  onRequirementsChange,
}: Props) {
  const [state, setState] = useState<ClarificationState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/clarify`);
    const data = await res.json();
    if (res.ok && data.ok) setState(data.clarifications ?? null);
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runDetect() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "detect" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "检测失败");
      setState(data.clarifications);
      if (data.requirements) {
        onRequirementsChange(data.requirements, { revision: data.revision });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "检测失败");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(questionId: string) {
    const answer = (drafts[questionId] ?? "").trim();
    if (!answer) {
      setError("请先填写回答");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", questionId, answer }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "提交失败");
      setState(data.clarifications);
      if (data.requirements) {
        onRequirementsChange(data.requirements, { revision: data.revision });
      }
      setDrafts((d) => {
        const next = { ...d };
        delete next[questionId];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setBusy(false);
    }
  }

  async function skipQuestion(questionId: string, forceBlocking = false) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip", questionId, forceBlocking }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "跳过失败");
      setState(data.clarifications);
    } catch (e) {
      setError(e instanceof Error ? e.message : "跳过失败");
    } finally {
      setBusy(false);
    }
  }

  const open = state?.questions.filter((q) => q.status === "open") ?? [];
  const blockingOpen = open.filter((q) => q.severity === "blocking").length;

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">澄清循环</h3>
          <p className="text-xs text-zinc-500">
            检测缺失/含糊信息并合并客户回答（第 {state?.round ?? 0} 轮）
            {blockingOpen > 0 ? (
              <span className="ml-2 text-amber-300">阻断待答 {blockingOpen}</span>
            ) : (
              <span className="ml-2 text-emerald-400">无阻断澄清</span>
            )}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void runDetect()}
            className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
          >
            运行缺口检测
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      {!state ? (
        <p className="text-xs text-zinc-600">尚未运行澄清检测。</p>
      ) : open.length === 0 ? (
        <p className="text-xs text-zinc-500">当前无待答澄清问题。</p>
      ) : (
        <ul className="space-y-3">
          {open.map((q) => (
            <li key={q.id} className="rounded-lg border border-zinc-800 p-3">
              <div className="mb-1 flex flex-wrap gap-2 text-[11px]">
                <span
                  className={
                    q.severity === "blocking" ? "text-amber-300" : "text-zinc-500"
                  }
                >
                  {q.severity === "blocking" ? "阻断" : "建议"}
                </span>
                <span className="font-mono text-zinc-600">{q.fieldPath}</span>
              </div>
              <p className="text-sm text-zinc-200">{q.question}</p>
              {!readOnly ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs"
                    rows={2}
                    value={drafts[q.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                    placeholder="填写客户回答…"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void submitAnswer(q.id)}
                      className="rounded-lg bg-emerald-600/90 px-3 py-1 text-xs font-medium text-black disabled:opacity-40"
                    >
                      提交并合并
                    </button>
                    {q.severity === "advisory" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void skipQuestion(q.id)}
                        className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 disabled:opacity-40"
                      >
                        跳过
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
