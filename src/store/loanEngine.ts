export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  endingBalance: number;
}

export interface LoanResults {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number;
  schedule: AmortizationRow[];
  interestSaved: number;
  monthsSaved: number;
}

export function calculateLoan(
  principal: number,
  apr: number,
  termMonths: number,
  extraPayment: number = 0
): LoanResults {
  const monthlyRate = apr / 100 / 12;

  // Standard monthly payment calculation
  let standardMonthlyPayment = 0;
  if (monthlyRate === 0) {
    standardMonthlyPayment = principal / termMonths;
  } else {
    standardMonthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  // 1. Generate Base Schedule (Without Extra Payments)
  const baseSchedule: AmortizationRow[] = [];
  let baseBalance = principal;
  let totalInterestBase = 0;

  for (let month = 1; month <= termMonths && baseBalance > 0.01; month++) {
    const beginningBalance = baseBalance;
    const interestPaid = beginningBalance * monthlyRate;
    let monthlyPayment = standardMonthlyPayment;

    if (beginningBalance + interestPaid <= monthlyPayment) {
      monthlyPayment = beginningBalance + interestPaid;
    }

    const principalPaid = monthlyPayment - interestPaid;
    baseBalance = beginningBalance - principalPaid;
    totalInterestBase += interestPaid;

    baseSchedule.push({
      month,
      beginningBalance,
      monthlyPayment,
      principalPaid,
      interestPaid,
      extraPayment: 0,
      endingBalance: Math.max(0, baseBalance),
    });
  }

  const payoffMonthsBase = baseSchedule.length;

  // 2. Generate Extra Payments Schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterestExtra = 0;

  // Run up to termMonths, but could terminate early due to extra payments
  for (let month = 1; month <= termMonths && balance > 0.01; month++) {
    const beginningBalance = balance;
    const interestPaid = beginningBalance * monthlyRate;
    let monthlyPayment = standardMonthlyPayment;

    if (beginningBalance + interestPaid <= monthlyPayment) {
      monthlyPayment = beginningBalance + interestPaid;
    }

    let principalPaid = monthlyPayment - interestPaid;

    // Apply extra payment to remaining balance
    const remainingBalanceAfterStandard = beginningBalance - principalPaid;
    const actualExtraPayment = Math.min(
      extraPayment,
      remainingBalanceAfterStandard
    );

    balance = remainingBalanceAfterStandard - actualExtraPayment;
    totalInterestExtra += interestPaid;

    schedule.push({
      month,
      beginningBalance,
      monthlyPayment,
      principalPaid,
      interestPaid,
      extraPayment: actualExtraPayment,
      endingBalance: Math.max(0, balance),
    });
  }

  const payoffMonthsExtra = schedule.length;
  const totalPaid = principal + totalInterestExtra;

  return {
    monthlyPayment: standardMonthlyPayment,
    totalInterest: totalInterestExtra,
    totalPaid,
    payoffMonths: payoffMonthsExtra,
    schedule,
    interestSaved: Math.max(0, totalInterestBase - totalInterestExtra),
    monthsSaved: Math.max(0, payoffMonthsBase - payoffMonthsExtra),
  };
}
