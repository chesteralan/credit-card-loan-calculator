export interface CardRow {
  month: number;
  beginningBalance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

export interface CardSimulationResult {
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedule: CardRow[];
  neverPaysOff: boolean;
}

export interface CardInput {
  id: string;
  name: string;
  balance: number;
  apr: number;
  customPayment?: number;
}

export interface CombinedCardMonth {
  month: number;
  beginningBalance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
  cardBalances: Record<string, number>;
}

export interface CombinedSimulationResult {
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedule: CombinedCardMonth[];
  neverPaysOff: boolean;
}

// Calculate minimum payment for a card balance
export function calculateMinPayment(
  balance: number,
  interest: number,
  floor = 25,
  percent = 0.01
): number {
  if (balance <= 0) return 0;
  // Standard card formula: interest + 1% of balance, or floor, whichever is greater
  return Math.min(
    balance + interest,
    Math.max(floor, interest + percent * balance)
  );
}

export function simulateCard(
  balance: number,
  apr: number,
  customPayment: number = 0,
  minPaymentFloor = 25,
  minPaymentPercent = 0.01
): CardSimulationResult {
  const monthlyRate = apr / 100 / 12;
  const schedule: CardRow[] = [];
  let currentBalance = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let neverPaysOff = false;
  const maxMonths = 600; // 50 years safety limit

  for (let month = 1; month <= maxMonths && currentBalance > 0.01; month++) {
    const beginningBalance = currentBalance;
    const interestPaid = beginningBalance * monthlyRate;
    const minPayment = calculateMinPayment(
      beginningBalance,
      interestPaid,
      minPaymentFloor,
      minPaymentPercent
    );

    // If interest is greater than or equal to min payment, and no custom payment is specified (or custom payment is also too low), balance will never decrease
    const targetPayment = Math.max(customPayment, minPayment);

    if (targetPayment <= interestPaid && beginningBalance > 0.01) {
      neverPaysOff = true;
      break;
    }

    let actualPayment = targetPayment;
    if (beginningBalance + interestPaid <= targetPayment) {
      actualPayment = beginningBalance + interestPaid;
    }

    const principalPaid = actualPayment - interestPaid;
    currentBalance = beginningBalance - principalPaid;
    totalInterest += interestPaid;
    totalPaid += actualPayment;

    schedule.push({
      month,
      beginningBalance,
      payment: actualPayment,
      interestPaid,
      principalPaid,
      endingBalance: Math.max(0, currentBalance),
    });
  }

  if (currentBalance > 0.01 && schedule.length >= maxMonths) {
    neverPaysOff = true;
  }

  return {
    payoffMonths: neverPaysOff ? Infinity : schedule.length,
    totalInterest,
    totalPaid,
    schedule,
    neverPaysOff,
  };
}

export function simulateCombinedCards(
  cards: CardInput[],
  customTotalPayment = 0,
  strategy: 'avalanche' | 'snowball' = 'avalanche',
  minPaymentFloor = 25,
  minPaymentPercent = 0.01
): CombinedSimulationResult {
  const activeCards = cards
    .map((c) => ({
      ...c,
      currentBalance: c.balance,
      monthlyRate: c.apr / 100 / 12,
    }))
    .filter((c) => c.balance > 0);

  if (activeCards.length === 0) {
    return {
      payoffMonths: 0,
      totalInterest: 0,
      totalPaid: 0,
      schedule: [],
      neverPaysOff: false,
    };
  }

  const schedule: CombinedCardMonth[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 1;
  const maxMonths = 600;
  let neverPaysOff = false;

  while (
    activeCards.some((c) => c.currentBalance > 0.01) &&
    month <= maxMonths
  ) {
    const beginningBalance = activeCards.reduce(
      (sum, c) => sum + c.currentBalance,
      0
    );

    // 1. Calculate interest and minimum payments for all cards
    const cardStates = activeCards.map((c) => {
      const interest = c.currentBalance * c.monthlyRate;
      const min = calculateMinPayment(
        c.currentBalance,
        interest,
        minPaymentFloor,
        minPaymentPercent
      );
      return {
        ...c,
        interest,
        min,
        paid: 0,
      };
    });

    const totalMinPaymentRequired = cardStates.reduce(
      (sum, c) => sum + c.min,
      0
    );
    let availableBudget = Math.max(customTotalPayment, totalMinPaymentRequired);

    // Check if the total budget is enough to cover monthly interest
    const totalInterestThisMonth = cardStates.reduce(
      (sum, c) => sum + c.interest,
      0
    );
    if (availableBudget <= totalInterestThisMonth && beginningBalance > 0.1) {
      neverPaysOff = true;
      break;
    }

    // 2. Pay minimums first
    for (const cs of cardStates) {
      if (cs.currentBalance > 0) {
        const payment = Math.min(cs.currentBalance + cs.interest, cs.min);
        cs.paid = payment;
        availableBudget -= payment;
      }
    }

    // 3. Allocate extra budget to target card(s)
    if (availableBudget > 0.01) {
      // Sort active cards based on strategy
      const sortedForExtra = [...cardStates]
        .filter((c) => c.currentBalance + c.interest - c.paid > 0.01)
        .sort((a, b) => {
          if (strategy === 'avalanche') {
            // Avalanche: Highest APR first
            return b.apr - a.apr;
          } else {
            // Snowball: Lowest remaining balance first (currentBalance + interest - paid)
            const balA = a.currentBalance + a.interest - a.paid;
            const balB = b.currentBalance + b.interest - b.paid;
            return balA - balB;
          }
        });

      for (const target of sortedForExtra) {
        const remainingDebt =
          target.currentBalance + target.interest - target.paid;
        const extraToApply = Math.min(availableBudget, remainingDebt);
        target.paid += extraToApply;
        availableBudget -= extraToApply;

        if (availableBudget <= 0.01) break;
      }
    }

    // 4. Update balances and record schedule
    let monthlyPaid = 0;
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;
    const cardBalances: Record<string, number> = {};

    for (const cs of cardStates) {
      const interestPaid = cs.interest;
      const principalPaid = cs.paid - interestPaid;

      const origCard = activeCards.find((c) => c.id === cs.id)!;
      origCard.currentBalance = Math.max(
        0,
        origCard.currentBalance - principalPaid
      );

      monthlyPaid += cs.paid;
      monthlyInterest += interestPaid;
      monthlyPrincipal += principalPaid;

      cardBalances[cs.id] = origCard.currentBalance;
    }

    totalInterest += monthlyInterest;
    totalPaid += monthlyPaid;

    schedule.push({
      month,
      beginningBalance,
      payment: monthlyPaid,
      interestPaid: monthlyInterest,
      principalPaid: monthlyPrincipal,
      endingBalance: Math.max(0, beginningBalance - monthlyPrincipal),
      cardBalances,
    });

    month++;
  }

  if (
    activeCards.some((c) => c.currentBalance > 0.01) &&
    schedule.length >= maxMonths
  ) {
    neverPaysOff = true;
  }

  return {
    payoffMonths: neverPaysOff ? Infinity : schedule.length,
    totalInterest,
    totalPaid,
    schedule,
    neverPaysOff,
  };
}
