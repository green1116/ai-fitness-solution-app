"use client";

import { useEffect, useState } from "react";
import { PEX_INTELLIGENCE_ENDPOINT } from "@/lib/product/experience";

export function ProductIntelligenceExperience() {
  const [status, setStatus] = useState("");
  const [signals, setSignals] = useState("");
  const [attention, setAttention] = useState("");

  useEffect(() => {
    void fetch(PEX_INTELLIGENCE_ENDPOINT)
      .then((r) => r.json())
      .then((v) => {
        setStatus(v.status);
        setSignals(
          `open ${v.signals.openCount} · queued ${v.signals.queuedCount} · watch ${v.signals.watchCount} · held ${v.signals.heldCount} · escalate ${v.signals.escalateCount}`,
        );
        setAttention(
          `open ${v.attention.openCount} · escalate ${v.attention.escalateCount}`,
        );
      });
  }, []);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm">
      <p className="text-xs text-zinc-600">只读 · GET {PEX_INTELLIGENCE_ENDPOINT}</p>
      <p className="mt-2">Status: {status}</p>
      <p className="mt-1 text-zinc-300">Signals: {signals}</p>
      <p className="mt-1 text-zinc-300">Attention: {attention}</p>
    </section>
  );
}
