"use client";

import { useEffect, useState } from "react";

export default function PilotSupportPage() {
  const [hints, setHints] = useState<string[]>([]);
  const [retry, setRetry] = useState<string[]>([]);
  const [known, setKnown] = useState<{ title: string; workaround?: string }[]>([]);

  useEffect(() => {
    void fetch("/api/pilot/support")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setHints(d.report.troubleshootingHints);
          setRetry(d.report.retryGuidance);
          setKnown(d.report.knownIssues);
        }
      });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Support Readiness</h2>
      <Section title="Troubleshooting" items={hints} />
      <Section title="Retry Guidance" items={retry} />
      <div>
        <h3 className="font-medium text-zinc-300">Known Issues</h3>
        <ul className="mt-2 space-y-2">
          {known.map((k) => (
            <li key={k.title} className="rounded-lg border border-zinc-800 bg-black/30 p-3 text-sm">
              <p className="font-medium">{k.title}</p>
              {k.workaround ? <p className="mt-1 text-zinc-400">{k.workaround}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-medium text-zinc-300">{title}</h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400 space-y-1">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
