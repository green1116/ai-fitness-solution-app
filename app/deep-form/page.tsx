import { Suspense } from "react";
import DeepFormClient from "./DeepFormClient";

export const dynamic = "force-dynamic";

export default function DeepFormPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <DeepFormClient />
    </Suspense>
  );
}