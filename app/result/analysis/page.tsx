import { Suspense } from "react";
import AnalysisClient from "./AnalysisClient";

export const dynamic = "force-dynamic";

export default function ResultAnalysisPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <AnalysisClient />
    </Suspense>
  );
}