export interface AmortizationScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
}

export interface FixedRateAmortization {
  basePayment: number;
  totalWithoutExtra: number;
  interestWithoutExtra: number;
  totalWithExtra: number;
  interestWithExtra: number;
  principalWithExtra: number;
  interestSaved: number;
  monthsSaved: number;
  originalMonths: number;
  actualMonths: number;
  schedule: AmortizationScheduleRow[];
}

interface ScheduleTotals {
  schedule: AmortizationScheduleRow[];
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
}

function buildSchedule(
  principal: number,
  monthlyRate: number,
  termMonths: number,
  basePayment: number,
  extraMonthlyPayment: number
): ScheduleTotals {
  const schedule: AmortizationScheduleRow[] = [];
  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let month = 1; month <= termMonths && balance > 0; month += 1) {
    const interest = balance * monthlyRate;
    const scheduledPrincipal = Math.max(0, basePayment - interest);
    let principalPaid = Math.min(
      balance,
      scheduledPrincipal + extraMonthlyPayment
    );

    // The contractual payment formula can leave a sub-cent floating residue.
    // The term's final row must retire it instead of creating another month.
    if (month === termMonths) principalPaid = balance;

    const basePrincipalPaid = Math.min(balance, scheduledPrincipal);
    const extraPayment = Math.max(0, principalPaid - basePrincipalPaid);
    const payment = principalPaid + interest;
    balance -= principalPaid;
    if (Math.abs(balance) < 1e-8) balance = 0;

    totalPaid += payment;
    totalInterest += interest;
    totalPrincipal += principalPaid;
    schedule.push({
      month,
      payment,
      principal: principalPaid,
      interest,
      extraPayment,
      balance,
    });
  }

  return { schedule, totalPaid, totalInterest, totalPrincipal };
}

export function calculateFixedRateAmortization(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
  extraMonthlyPayment = 0
): FixedRateAmortization | null {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(termMonths) ||
    !Number.isFinite(extraMonthlyPayment) ||
    principal <= 0 ||
    annualRatePercent < 0 ||
    termMonths < 1 ||
    extraMonthlyPayment < 0
  ) {
    return null;
  }

  const months = Math.round(termMonths);
  if (months < 1) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const basePayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -months));
  if (!Number.isFinite(basePayment) || basePayment <= 0) return null;

  const baseline = buildSchedule(
    principal,
    monthlyRate,
    months,
    basePayment,
    0
  );
  const withExtra = buildSchedule(
    principal,
    monthlyRate,
    months,
    basePayment,
    extraMonthlyPayment
  );

  return {
    basePayment,
    totalWithoutExtra: baseline.totalPaid,
    interestWithoutExtra: baseline.totalInterest,
    totalWithExtra: withExtra.totalPaid,
    interestWithExtra: withExtra.totalInterest,
    principalWithExtra: withExtra.totalPrincipal,
    interestSaved: Math.max(
      0,
      baseline.totalInterest - withExtra.totalInterest
    ),
    monthsSaved: months - withExtra.schedule.length,
    originalMonths: months,
    actualMonths: withExtra.schedule.length,
    schedule: withExtra.schedule,
  };
}
