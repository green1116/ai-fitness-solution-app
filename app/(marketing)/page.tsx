import { Hero, Pain, Solution, Demo, UseCases, Pricing, CTA } from "@/components/landing";
import { LandingTracker } from "@/components/marketing/LandingTracker";

export default function LandingPage() {
  return (
    <>
      <LandingTracker path="/" />
      <div className="space-y-16 md:space-y-20">
        <Hero />
        <Pain />
        <Solution />
        <Demo />
        <UseCases />
        <Pricing />
        <CTA />
      </div>
    </>
  );
}
