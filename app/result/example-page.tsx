"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function ExamplePageClient() {
  const sp = useSearchParams();

  const planId = useMemo(() => sp.get("planId") || "", [sp]);
  const mode = useMemo(() => sp.get("mode") || "", [sp]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Example Page</h1>
      <p>planId: {planId || "-"}</p>
      <p>mode: {mode || "-"}</p>
    </main>
  );
}