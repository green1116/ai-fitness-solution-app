"use client";

import { useEffect, useState } from "react";

const CATEGORIES = ["UX", "Data", "Quote", "PDF", "Delivery", "Intelligence", "Launch"];

type FeedbackItem = {
  id: string;
  category: string;
  status: string;
  message: string;
  createdAt: string;
};

export default function PilotFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [category, setCategory] = useState("UX");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const res = await fetch("/api/pilot/feedback");
    const data = await res.json();
    if (data.ok) setItems(data.report.items);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    await fetch("/api/pilot/feedback/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, message }),
    });
    setMessage("");
    await load();
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Feedback Loop</h2>
      <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 space-y-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="描述您的反馈…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm min-h-[100px]"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          提交反馈
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((f) => (
          <li key={f.id} className="rounded-lg border border-zinc-800 bg-black/30 p-3 text-sm">
            <span className="text-sky-400">{f.category}</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-500">{f.status}</span>
            <p className="mt-1 text-zinc-300">{f.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
