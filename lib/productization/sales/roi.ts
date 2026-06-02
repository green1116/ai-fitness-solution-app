import type { ROICalculator, ROICalculatorInput } from "./types";

const DEFAULT_INPUT: ROICalculatorInput = {
  employeeCount: 100,
  spaceSizeSqm: 500,
  projectBudget: 250000,
  expectedUtilization: 75,
};

function clampUtilization(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function computeProductivityImpact(input: ROICalculatorInput): number {
  const utilizationFactor = clampUtilization(input.expectedUtilization) / 100;
  const scaleFactor = Math.min(1, input.employeeCount / 500);
  return Math.round((15 + scaleFactor * 20 + utilizationFactor * 10) * 10) / 10;
}

function computeWellnessImpact(input: ROICalculatorInput): number {
  const spaceFactor = Math.min(1, input.spaceSizeSqm / 1000);
  const utilizationFactor = clampUtilization(input.expectedUtilization) / 100;
  return Math.round((10 + spaceFactor * 15 + utilizationFactor * 12) * 10) / 10;
}

function computeEstimatedRoi(
  input: ROICalculatorInput,
  productivityImpact: number,
  wellnessImpact: number,
): number {
  if (input.projectBudget <= 0) return 0;
  const annualBenefit =
    input.employeeCount * 1200 * (productivityImpact / 100) +
    input.spaceSizeSqm * 8 * (wellnessImpact / 100);
  return Math.round((annualBenefit / input.projectBudget) * 1000) / 10;
}

export function buildROICalculator(input?: {
  deploymentId?: string;
  calculatorInput?: Partial<ROICalculatorInput>;
}): ROICalculator {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const calculatorInput: ROICalculatorInput = {
    ...DEFAULT_INPUT,
    ...input?.calculatorInput,
  };

  const productivityImpact = computeProductivityImpact(calculatorInput);
  const wellnessImpact = computeWellnessImpact(calculatorInput);
  const estimatedRoi = computeEstimatedRoi(calculatorInput, productivityImpact, wellnessImpact);

  const investmentSummary = [
    `employees=${calculatorInput.employeeCount}`,
    `space=${calculatorInput.spaceSizeSqm}sqm`,
    `budget=${calculatorInput.projectBudget}`,
    `utilization=${calculatorInput.expectedUtilization}%`,
    `estimatedRoi=${estimatedRoi}%`,
  ].join(" ");

  return {
    calculatorId: `roi-calculator-${deploymentId}`,
    input: calculatorInput,
    estimatedRoi,
    productivityImpact,
    wellnessImpact,
    investmentSummary,
    summary: `roi-calculator roi=${estimatedRoi}% productivity=${productivityImpact}% wellness=${wellnessImpact}%`,
  };
}

export { DEFAULT_INPUT as DEFAULT_ROI_INPUT };
