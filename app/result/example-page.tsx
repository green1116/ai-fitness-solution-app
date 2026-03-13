"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default function ResultPage() {
  const sp = useSearchParams();
  const planId = sp.get("planId") || "";

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>?????</h1>

      <div style={{ display: "flex", gap: 12 }}>
        
        

        <a
          className="px-4 py-2 rounded border"
          href={
            `/api/pdf?planId=${encodeURIComponent(planId)}` +
            `&mode=preview&download=1` +
            (typeof process !== "undefined" && process.env?.NODE_ENV !== "production"
              ? `&downloadToken=${encodeURIComponent("DEV_MODE_TOKEN")}`
              : "")
          }
          target="_blank"
          rel="noreferrer"
        >
          ??????????
        </a>
      </div>

      <div style={{ marginTop: 16, color: "#666" }}>
        planId?{planId || "?????"}
      </div>
    </div>
  );
}

