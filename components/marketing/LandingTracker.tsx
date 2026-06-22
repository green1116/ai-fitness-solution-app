"use client";

import { useEffect } from "react";
import { trackLandingView } from "@/lib/landing/conversion/conversion.tracker";
import { trackFunnelStage } from "@/lib/landing/conversion/funnel.tracker";

export function LandingTracker({ path = "/" }: { path?: string }) {
  useEffect(() => {
    trackLandingView({ path });
    trackFunnelStage("landing", { path });
  }, [path]);
  return null;
}
