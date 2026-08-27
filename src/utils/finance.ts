import { roundTo } from "@/utils/number";

/**
 * Pure financial and health formulas.
 *
 * No UI, no state — every calculator tool imports from here, so a formula
 * exists in exactly one place and can be reasoned about independently.
 */

/* ------------------------------------------------------------------ basics */

/** Discount: returns the amount saved and the final payable price. */
export function calculateDiscount(price: number, discountPercent: number) {
  const rate = discountPercent / 100;
  const saved = price * rate;
  const final = price - saved;
  return {
    saved,
    final,
    /** Effective price as a share of the original. */
    payingPercent: price === 0 ? 0 : (final / price) * 100,
  };
}

/** Reverse discount: what the original price was, given the sale price. */
export function originalFromDiscounted(salePrice: number, discountPercent: number) {
  const rate = discountPercent / 100;
  if (rate >= 1) return Number.NaN;
  return salePrice / (1 - rate);
}

export type TaxMode = "exclusive" | "inclusive";

/**
 * GST / VAT.
 *  - `exclusive`: `amount` is the net price, tax is added on top.
 *  - `inclusive`: `amount` already contains tax, so it is extracted.
 */
export function calculateTax(amount: number, ratePercent: number, mode: TaxMode) {
  const rate = ratePercent / 100;
  if (mode === "inclusive") {
    const net = amount / (1 + rate);
    return { net, tax: amount - net, gross: amount };
  }
  const tax = amount * rate;
  return { net: amount, tax, gross: amount + tax };
}

/** Tip: returns tip amount and grand total. */
export function calculateTip(bill: number, tipPercent: number) {
  const tip = bill * (tipPercent / 100);
  return { tip, total: bill + tip };
}

/**
 * Splits a total between people, distributing rounding remainders
 * so the parts always add back up to the exact total.
 */
export function splitAmount(total: number, people: number, decimals = 2) {
  if (people < 1) return { each: Number.NaN, shares: [] as number[], uneven: false };

  const factor = 10 ** decimals;
  const totalUnits = Math.round(total * factor);
  const baseUnits = Math.floor(totalUnits / people);
  let remainderUnits = totalUnits - baseUnits * people;

  const shares: number[] = [];
  for (let index = 0; index < people; index++) {
    const extra = remainderUnits > 0 ? 1 : 0;
    if (remainderUnits > 0) remainderUnits--;
    shares.push((baseUnits + extra) / factor);
  }

  return {
    each: total / people,
    shares,
    /** True when shares are not all identical because of rounding. */
    uneven: shares.length > 1 && shares[0] !== shares[shares.length - 1],
  };
}

/* ------------------------------------------------------------------- loans */

export interface LoanResult {
  /** Equated monthly instalment. */
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  months: number;
  monthlyRate: number;
  /** Interest as a share of the principal. */
  interestPercent: number;
}

/**
 * EMI / amortising loan payment.
 *
 *   EMI = P · r · (1 + r)^n / ((1 + r)^n − 1)
 *
 * where r is the monthly rate and n the number of months.
 * A zero interest rate falls back to a simple principal ÷ months split.
 */
export function calculateLoan(
  principal: number,
  annualRatePercent: number,
  months: number,
): LoanResult {
  const monthlyRate = annualRatePercent / 100 / 12;

  let emi: number;
  if (months <= 0) {
    emi = Number.NaN;
  } else if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const growth = (1 + monthlyRate) ** months;
    emi = (principal * monthlyRate * growth) / (growth - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return {
    emi,
    totalPayment,
    totalInterest,
    principal,
    months,
    monthlyRate,
    interestPercent: principal === 0 ? 0 : (totalInterest / principal) * 100,
  };
}

export interface AmortisationRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

/** Full amortisation schedule; the final row absorbs rounding drift. */
export function amortisationSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
): AmortisationRow[] {
  const { emi, monthlyRate } = calculateLoan(principal, annualRatePercent, months);
  if (!Number.isFinite(emi) || months <= 0) return [];

  const rows: AmortisationRow[] = [];
  let balance = principal;

  for (let period = 1; period <= months; period++) {
    const interest = balance * monthlyRate;
    let principalPart = emi - interest;
    if (period === months) principalPart = balance; // clear any residue
    balance = Math.max(0, balance - principalPart);
    rows.push({
      period,
      payment: interest + principalPart,
      interest,
      principal: principalPart,
      balance,
    });
  }

  return rows;
}

/** Aggregates a schedule into per-year totals for compact display. */
export function yearlySummary(rows: AmortisationRow[]) {
  const years: { year: number; interest: number; principal: number; balance: number }[] = [];
  rows.forEach((row, index) => {
    const year = Math.floor(index / 12);
    if (!years[year]) years[year] = { year: year + 1, interest: 0, principal: 0, balance: 0 };
    years[year].interest += row.interest;
    years[year].principal += row.principal;
    years[year].balance = row.balance;
  });
  return years;
}

/* --------------------------------------------------------------- interest */

export type CompoundFrequency = 1 | 2 | 4 | 12 | 52 | 365;

export const compoundFrequencies: { value: CompoundFrequency; label: string }[] = [
  { value: 1, label: "Annually" },
  { value: 2, label: "Semi-annually" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 52, label: "Weekly" },
  { value: 365, label: "Daily" },
];

export interface CompoundResult {
  amount: number;
  interest: number;
  principal: number;
  /** Annual equivalent rate after compounding. */
  effectiveRate: number;
  /** Balance at the end of each year. */
  breakdown: { year: number; balance: number; interest: number }[];
}

/**
 * Compound interest with optional regular contributions.
 *
 *   A = P(1 + r/n)^(nt)
 *
 * Contributions are added at the end of each compounding period, giving the
 * standard future value of an ordinary annuity:
 *
 *   FV = PMT · ((1 + r/n)^(nt) − 1) / (r/n)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  frequency: CompoundFrequency = 1,
  contribution = 0,
): CompoundResult {
  const rate = annualRatePercent / 100;
  const periodRate = rate / frequency;
  const totalPeriods = frequency * years;

  const growth = (1 + periodRate) ** totalPeriods;
  const fromPrincipal = principal * growth;
  const fromContributions =
    contribution === 0
      ? 0
      : periodRate === 0
        ? contribution * totalPeriods
        : contribution * ((growth - 1) / periodRate);

  const amount = fromPrincipal + fromContributions;
  const invested = principal + contribution * totalPeriods;

  const breakdown: { year: number; balance: number; interest: number }[] = [];
  const wholeYears = Math.min(Math.floor(years), 50);
  for (let year = 1; year <= wholeYears; year++) {
    const periods = frequency * year;
    const yearGrowth = (1 + periodRate) ** periods;
    const balance =
      principal * yearGrowth +
      (contribution === 0
        ? 0
        : periodRate === 0
          ? contribution * periods
          : contribution * ((yearGrowth - 1) / periodRate));
    breakdown.push({
      year,
      balance,
      interest: balance - (principal + contribution * periods),
    });
  }

  return {
    amount,
    interest: amount - invested,
    principal: invested,
    effectiveRate: ((1 + periodRate) ** frequency - 1) * 100,
    breakdown,
  };
}

/** Simple (non-compounding) interest, for comparison. */
export function calculateSimpleInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
) {
  const interest = principal * (annualRatePercent / 100) * years;
  return { interest, amount: principal + interest };
}

/* -------------------------------------------------------------------- BMI */

export interface BmiResult {
  bmi: number;
  category: string;
  tone: "warning" | "success" | "danger";
  /** Healthy weight range for the given height, in kilograms. */
  healthyRange: [number, number];
  /** Difference from the nearest healthy bound (negative = below). */
  difference: number;
}

/** Body Mass Index: weight (kg) ÷ height (m)². */
export function calculateBmi(weightKg: number, heightMeters: number): BmiResult {
  const bmi = heightMeters <= 0 ? Number.NaN : weightKg / heightMeters ** 2;

  let category = "—";
  let tone: BmiResult["tone"] = "success";
  if (Number.isFinite(bmi)) {
    if (bmi < 18.5) {
      category = "Underweight";
      tone = "warning";
    } else if (bmi < 25) {
      category = "Normal weight";
      tone = "success";
    } else if (bmi < 30) {
      category = "Overweight";
      tone = "warning";
    } else {
      category = "Obese";
      tone = "danger";
    }
  }

  const lower = 18.5 * heightMeters ** 2;
  const upper = 24.9 * heightMeters ** 2;
  const difference = weightKg < lower ? weightKg - lower : weightKg > upper ? weightKg - upper : 0;

  return {
    bmi,
    category,
    tone,
    healthyRange: [roundTo(lower, 1), roundTo(upper, 1)],
    difference: roundTo(difference, 1),
  };
}

/** Converts feet + inches into meters. */
export function feetInchesToMeters(feet: number, inches: number): number {
  return (feet * 12 + inches) * 0.0254;
}

/** Converts pounds into kilograms. */
export function poundsToKilograms(pounds: number): number {
  return pounds * 0.45359237;
}
