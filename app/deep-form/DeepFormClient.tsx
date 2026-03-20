"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function DeepFormClient() {
  const searchParams = useSearchParams();

  const planId = useMemo(() => searchParams.get("planId") || "", [searchParams]);
  const mode = useMemo(() => searchParams.get("mode") || "", [searchParams]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Deep Form</h1>
      <p>planId: {planId || "-"}</p>
      <p>mode: {mode || "-"}</p>
    </main>
  );
}