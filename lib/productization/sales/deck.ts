import type { SalesDeck } from "./types";
import { SALES_ENABLEMENT_VERSION } from "./types";

const PRODUCT_NAME = "AI Fitness Solution";

export function buildSalesDeck(input?: { deploymentId?: string }): SalesDeck {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const slides = [
    {
      id: "slide-intro",
      order: 1,
      title: "AI Fitness Solution Overview",
      bullets: [
        "Enterprise-grade AI fitness planning platform",
        "Plan, budget, and tender package generation",
        "Built on frozen platform baseline v13",
      ],
    },
    {
      id: "slide-problem",
      order: 2,
      title: "Customer Problem",
      bullets: [
        "Manual fitness solution planning is slow and inconsistent",
        "Budget and proposal creation lacks standardization",
        "Enterprise buyers need compliance-ready deliverables",
      ],
    },
    {
      id: "slide-solution",
      order: 3,
      title: "Our Solution",
      bullets: [
        "AI-assisted plan and budget generation",
        "Proposal PDF and tender package export",
        "Starter / Professional / Enterprise tiers",
      ],
    },
    {
      id: "slide-packaging",
      order: 4,
      title: "Product Packaging",
      bullets: [
        "Starter — small teams, core generation",
        "Professional — tender workflows, priority support",
        "Enterprise — unlimited scale, dedicated support",
      ],
    },
    {
      id: "slide-roi",
      order: 5,
      title: "ROI & Business Impact",
      bullets: [
        "Productivity gains from automated planning",
        "Wellness program ROI through utilization tracking",
        "Custom pricing — contact sales",
      ],
    },
    {
      id: "slide-next-steps",
      order: 6,
      title: "Next Steps",
      bullets: [
        "Schedule a demo",
        "Run ROI calculator with your inputs",
        "Receive tailored proposal template",
      ],
    },
  ];

  return {
    deckId: `sales-deck-${deploymentId}`,
    version: SALES_ENABLEMENT_VERSION,
    productName: PRODUCT_NAME,
    title: `${PRODUCT_NAME} — Sales Deck`,
    slides,
    summary: `sales-deck slides=${slides.length} product=${PRODUCT_NAME}`,
  };
}
