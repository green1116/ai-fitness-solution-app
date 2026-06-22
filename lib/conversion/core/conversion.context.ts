/**
 * V64 P2 — Conversion metrics from V60 growth events
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import type { ConversionMetrics } from "../conversion.types";

export function aggregateConversionMetrics(): ConversionMetrics {
  const events = getGrowthEventsSnapshot();

  const landingView = events.filter(
    (e) =>
      e.event === "visitor.landing" ||
      e.event === "funnel.landing_view",
  ).length;

  const demoStart = events.filter(
    (e) =>
      e.event === "demo.started" ||
      e.event === "funnel.demo_click",
  ).length;

  const demoComplete = events.filter(
    (e) =>
      e.event === "demo.completed" ||
      e.event === "funnel.demo_result",
  ).length;

  const signups = events.filter((e) => e.event === "user.signup").length;
  const paid = events.filter((e) => e.event === "payment.completed").length;

  const visitors = Math.max(landingView, signups, 1);
  const signupRate = visitors > 0 ? Math.round((signups / visitors) * 100) : 0;
  const conversionRate = visitors > 0 ? Math.round((paid / visitors) * 100) : signupRate;

  return {
    landingView: Math.max(landingView, 1),
    demoStart,
    demoComplete,
    signupRate,
    conversionRate,
  };
}

export function computeCtaClickRate(): number {
  const events = getGrowthEventsSnapshot();
  const views = events.filter(
    (e) => e.event === "visitor.landing" || e.event === "funnel.landing_view",
  ).length;
  const clicks = events.filter(
    (e) =>
      e.event === "signup.clicked" ||
      e.event === "funnel.demo_click" ||
      e.event === "demo.started",
  ).length;
  return views > 0 ? Math.round((clicks / views) * 100) : 0;
}

export function computeDemoDropOffRate(): number {
  const metrics = aggregateConversionMetrics();
  if (metrics.demoStart === 0) return 0;
  const incomplete = Math.max(0, metrics.demoStart - metrics.demoComplete);
  return Math.round((incomplete / metrics.demoStart) * 100);
}
