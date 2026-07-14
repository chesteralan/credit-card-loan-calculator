import { useEffect, useState } from 'react';
import { useCalculatorStore } from './store/useCalculatorStore';
import { calculateLoan } from './store/loanEngine';
import { simulateCard, simulateCombinedCards } from './store/cardEngine';
import { SliderInput } from './components/SliderInput';
import { DonutChart } from './components/DonutChart';
import { AreaChart } from './components/AreaChart';
import { AmortizationTable } from './components/AmortizationTable';
import { Glossary } from './components/Glossary';

function App() {
  const store = useCalculatorStore();
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,

    // Loan inputs
    loanAmount,
    loanApr,
    loanTermMonths,
    loanExtraPayment,
    setLoanInput,

    // Credit Card inputs
    cardBalance,
    cardApr,
    cardCustomPayment,
    cardMinPaymentFloor,
    cardMinPaymentPercent,
    setCardInput,

    // Consolidation inputs
    consolidationCards,
    consolidationTermMonths,
    consolidationApr,
    consolidationOriginationFee,
    consolidationStrategy,
    consolidationCustomPayment,
    setConsolidationInput,
    addConsolidationCard,
    removeConsolidationCard,
    updateConsolidationCard,
    setConsolidationStrategy,
  } = store;

  // Initialize theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // States for card form in consolidation manager
  const [newCardName, setNewCardName] = useState('');
  const [newCardBalance, setNewCardBalance] = useState(1000);
  const [newCardApr, setNewCardApr] = useState(18);

  // Helper: project date
  const getPayoffDate = (months: number) => {
    if (months === Infinity || isNaN(months) || months <= 0) return 'Never';
    const date = new Date();
    date.setMonth(date.getMonth() + Math.round(months));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;
    addConsolidationCard({
      name: newCardName,
      balance: newCardBalance,
      apr: newCardApr,
    });
    setNewCardName('');
    setNewCardBalance(1000);
    setNewCardApr(18);
  };

  // 1. Traditional Loan Calculations
  const loanResults = calculateLoan(
    loanAmount,
    loanApr,
    loanTermMonths,
    loanExtraPayment
  );
  const loanBaseResults = calculateLoan(loanAmount, loanApr, loanTermMonths, 0);

  // Prepare chart data for Traditional Loan
  const loanChartLabels = Array.from(
    { length: loanBaseResults.schedule.length + 1 },
    (_, i) => `Mo ${i}`
  );
  const loanChartDatasets = [
    {
      label: 'Standard Plan',
      data: [
        loanAmount,
        ...loanBaseResults.schedule.map((r) => r.endingBalance),
      ],
      color: '#a855f7',
      gradientFrom: '#a855f7',
    },
    {
      label: 'With Extra Payments',
      data: [loanAmount, ...loanResults.schedule.map((r) => r.endingBalance)],
      color: '#6366f1',
      gradientFrom: '#6366f1',
    },
  ];

  // 2. Credit Card Calculations
  const cardMinResults = simulateCard(
    cardBalance,
    cardApr,
    0,
    cardMinPaymentFloor,
    cardMinPaymentPercent
  );
  const cardCustomResults = simulateCard(
    cardBalance,
    cardApr,
    cardCustomPayment,
    cardMinPaymentFloor,
    cardMinPaymentPercent
  );

  const cardChartLength = Math.max(
    cardMinResults.schedule.length === Infinity
      ? 0
      : cardMinResults.schedule.length,
    cardCustomResults.schedule.length
  );

  const cardChartLabels = Array.from(
    { length: cardChartLength + 1 },
    (_, i) => `Mo ${i}`
  );
  const cardChartDatasets = [
    ...(cardMinResults.schedule.length !== Infinity
      ? [
          {
            label: 'Minimum Payment Only',
            data: [
              cardBalance,
              ...cardMinResults.schedule.map((r) => r.endingBalance),
            ],
            color: '#ef4444',
            gradientFrom: '#ef4444',
          },
        ]
      : []),
    {
      label: 'Custom Payoff Plan',
      data: [
        cardBalance,
        ...cardCustomResults.schedule.map((r) => r.endingBalance),
      ],
      color: '#10b981',
      gradientFrom: '#10b981',
    },
  ];

  // 3. Debt Consolidation Comparison Calculations
  const totalCardBalance = consolidationCards.reduce(
    (sum, c) => sum + c.balance,
    0
  );
  const totalMinPaymentRequired = consolidationCards.reduce((sum, c) => {
    const interest = c.balance * (c.apr / 100 / 12);
    return sum + Math.max(25, interest + 0.01 * c.balance);
  }, 0);

  // Combine payoff simulation
  const targetCCBudget = Math.max(
    consolidationCustomPayment,
    totalMinPaymentRequired
  );
  const ccCombinedResults = simulateCombinedCards(
    consolidationCards,
    targetCCBudget,
    consolidationStrategy
  );

  // Consolidation Loan calculations
  const feeAmount = totalCardBalance * (consolidationOriginationFee / 100);
  const consolidationLoanAmount = totalCardBalance + feeAmount;
  const consolidationLoanResults = calculateLoan(
    consolidationLoanAmount,
    consolidationApr,
    consolidationTermMonths,
    0
  );

  const ccSavings = {
    interestSaved: Math.max(
      0,
      ccCombinedResults.totalInterest - consolidationLoanResults.totalInterest
    ),
    monthsSaved: Math.max(
      0,
      (ccCombinedResults.payoffMonths === Infinity
        ? 600
        : ccCombinedResults.payoffMonths) -
        consolidationLoanResults.payoffMonths
    ),
    monthlyPaymentDiff:
      targetCCBudget - consolidationLoanResults.monthlyPayment,
  };

  const consolidationChartLength = Math.max(
    ccCombinedResults.schedule.length === Infinity
      ? 0
      : ccCombinedResults.schedule.length,
    consolidationLoanResults.schedule.length
  );
  const consolidationChartLabels = Array.from(
    { length: consolidationChartLength + 1 },
    (_, i) => `Mo ${i}`
  );
  const consolidationChartDatasets = [
    ...(ccCombinedResults.schedule.length !== Infinity
      ? [
          {
            label: 'Current Cards Payoff',
            data: [
              totalCardBalance,
              ...ccCombinedResults.schedule.map((r) => r.endingBalance),
            ],
            color: '#ef4444',
            gradientFrom: '#ef4444',
          },
        ]
      : []),
    {
      label: 'Consolidation Personal Loan',
      data: [
        consolidationLoanAmount,
        ...consolidationLoanResults.schedule.map((r) => r.endingBalance),
      ],
      color: '#6366f1',
      gradientFrom: '#6366f1',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#090a0f] dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-[#111219]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 15.75V18m-3-3V18m-3-3V18m3-12h.008v.008H12.75V6zm3 0h.008v.008H15.75V6zm2.25 2.25h.008v.008H18V8.25zM18 12h.008v.008H18V12zm-2.25 2.25h.008v.008H15.75v-.008zm-3-1.125h.008v.008H12.75v-.008zm-3 1.125h.008v.008H9.75v-.008zm-3 0h.008v.008H6.75v-.008zm0-3h.008v.008H6.75V12zm0-3h.008v.008H6.75V9zm0-3h.008v.008H6.75V6zm3 0h.008v.008H9.75V6zm0 3h.008v.008H9.75V9zm-3 3h.008v.008H6.75V12zm3 0h.008v.008H9.75V12z"
                />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xl font-extrabold text-transparent">
              Antigravity Calc
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5 text-indigo-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:overflow-x-visible lg:pb-0">
              <button
                onClick={() => setActiveTab('loan')}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'loan'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                  />
                </svg>
                Loan Calculator
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>
                Credit Card Payoff
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'compare'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
                Consolidation Compare
              </button>

              <button
                onClick={() => setActiveTab('compare' as any)} // Custom toggle to glossary
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  (activeTab as any) === 'glossary'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('glossary' as any)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
                Glossary & Tips
              </button>
            </nav>
          </div>

          {/* Interactive Calculator Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'loan' && (
              <div className="flex flex-col gap-8">
                <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Inputs */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Loan Inputs
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Model amortized personal, auto, or home loans.
                        </p>
                      </div>

                      <SliderInput
                        id="loan-amount"
                        label="Loan Amount"
                        value={loanAmount}
                        min={1000}
                        max={100000}
                        step={500}
                        type="currency"
                        onChange={(val) => setLoanInput('loanAmount', val)}
                      />

                      <SliderInput
                        id="loan-apr"
                        label="Annual APR"
                        value={loanApr}
                        min={0.1}
                        max={30}
                        step={0.1}
                        type="percent"
                        onChange={(val) => setLoanInput('loanApr', val)}
                      />

                      <SliderInput
                        id="loan-term"
                        label="Loan Term"
                        value={loanTermMonths}
                        min={12}
                        max={120}
                        step={6}
                        type="months"
                        onChange={(val) => setLoanInput('loanTermMonths', val)}
                      />

                      <SliderInput
                        id="loan-extra"
                        label="Extra Monthly Payment"
                        value={loanExtraPayment}
                        min={0}
                        max={2000}
                        step={25}
                        type="currency"
                        onChange={(val) =>
                          setLoanInput('loanExtraPayment', val)
                        }
                      />
                    </div>

                    {/* Results / Visualizations */}
                    <div className="flex flex-col gap-6 lg:col-span-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Summary Dashboard
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Calculated payoff metrics and amortization split.
                        </p>
                      </div>

                      {/* KPI Blocks */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200/50 bg-white/20 p-4 shadow-sm dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Monthly Payment
                          </span>
                          <p className="mt-1 text-lg font-extrabold text-indigo-500">
                            {formatCurrency(loanResults.monthlyPayment)}
                            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              P & I Standard
                            </span>
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/50 bg-white/20 p-4 shadow-sm dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Total Interest
                          </span>
                          <p className="mt-1 text-lg font-extrabold text-rose-500">
                            {formatCurrency(loanResults.totalInterest)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/50 bg-white/20 p-4 shadow-sm dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Payoff Date
                          </span>
                          <p className="mt-1 text-lg font-extrabold">
                            {getPayoffDate(loanResults.payoffMonths)}
                            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              in {loanResults.payoffMonths} months
                            </span>
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/50 bg-white/20 p-4 shadow-sm dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Total Loan Cost
                          </span>
                          <p className="mt-1 text-lg font-extrabold">
                            {formatCurrency(loanResults.totalPaid)}
                          </p>
                        </div>
                      </div>

                      {/* Extra Payments Success Block */}
                      {loanExtraPayment > 0 &&
                        (loanResults.interestSaved > 0 ||
                          loanResults.monthsSaved > 0) && (
                          <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🚀</span>
                              <div>
                                <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-400">
                                  Extra Payment Savings
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                  Save{' '}
                                  <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                    {formatCurrency(loanResults.interestSaved)}
                                  </strong>{' '}
                                  in interest and pay off your loan{' '}
                                  <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                    {loanResults.monthsSaved} months
                                  </strong>{' '}
                                  sooner!
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Charts Grid */}
                      <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <span className="mb-3 block text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Composition Break
                          </span>
                          <DonutChart
                            data={[
                              {
                                name: 'Principal',
                                value: loanAmount,
                                color: '#6366f1',
                              },
                              {
                                name: 'Interest',
                                value: loanResults.totalInterest,
                                color: '#f43f5e',
                              },
                            ]}
                          />
                        </div>
                        <div>
                          <span className="mb-3 block text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Amortization Declines
                          </span>
                          <AreaChart
                            labels={loanChartLabels}
                            datasets={loanChartDatasets}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                  <AmortizationTable
                    schedule={loanResults.schedule}
                    title="Loan Amortization Schedule"
                  />
                </div>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="flex flex-col gap-8">
                <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Inputs */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Credit Card Inputs
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Model card compounding and optimize fixed payoffs.
                        </p>
                      </div>

                      <SliderInput
                        id="card-balance"
                        label="Card Balance"
                        value={cardBalance}
                        min={500}
                        max={30000}
                        step={500}
                        type="currency"
                        onChange={(val) => setCardInput('cardBalance', val)}
                      />

                      <SliderInput
                        id="card-apr"
                        label="Card APR"
                        value={cardApr}
                        min={5}
                        max={36}
                        step={0.1}
                        type="percent"
                        onChange={(val) => setCardInput('cardApr', val)}
                      />

                      <SliderInput
                        id="card-custom"
                        label="Planned Monthly Payment"
                        value={cardCustomPayment}
                        min={50}
                        max={2000}
                        step={25}
                        type="currency"
                        onChange={(val) =>
                          setCardInput('cardCustomPayment', val)
                        }
                      />

                      {/* Advanced Settings Accordion */}
                      <details className="group dark:border-slate-850 rounded-xl border border-slate-200/50 bg-white/10 transition-all dark:bg-white/5">
                        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-bold tracking-wider text-slate-400 uppercase outline-none select-none dark:text-slate-500">
                          <span>Min Payment Formula Settings</span>
                          <span className="transition-transform group-open:rotate-180">
                            ▼
                          </span>
                        </summary>
                        <div className="dark:border-slate-850 flex flex-col gap-4 border-t border-slate-100 px-4 pt-1 pb-4">
                          <SliderInput
                            id="card-min-floor"
                            label="Min Payment Floor"
                            value={cardMinPaymentFloor}
                            min={10}
                            max={100}
                            step={5}
                            type="currency"
                            onChange={(val) =>
                              setCardInput('cardMinPaymentFloor', val)
                            }
                          />
                          <SliderInput
                            id="card-min-percent"
                            label="Balance Percentage"
                            value={cardMinPaymentPercent * 100}
                            min={0.5}
                            max={5}
                            step={0.1}
                            type="percent"
                            onChange={(val) =>
                              setCardInput('cardMinPaymentPercent', val / 100)
                            }
                          />
                        </div>
                      </details>
                    </div>

                    {/* Results / Visualizations */}
                    <div className="flex flex-col gap-6 lg:col-span-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Payoff Plan Comparison
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Comparing Minimum Payment Only vs. Custom fixed
                          payoff.
                        </p>
                      </div>

                      {/* Side-by-side KPI Comparisons */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200/50 bg-slate-50/40 p-4 dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">
                            Minimum Payment Only
                          </span>
                          <div className="mt-2.5 flex flex-col gap-1">
                            <span className="block text-sm font-semibold text-slate-400 dark:text-slate-500">
                              Payoff Time:
                            </span>
                            <span className="text-base font-extrabold">
                              {cardMinResults.neverPaysOff
                                ? 'Never Pay Off'
                                : `${cardMinResults.payoffMonths} Months`}
                            </span>

                            <span className="mt-1 block text-sm font-semibold text-slate-400 dark:text-slate-500">
                              Total Interest:
                            </span>
                            <span className="text-base font-extrabold text-rose-500">
                              {cardMinResults.neverPaysOff
                                ? 'N/A'
                                : formatCurrency(cardMinResults.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                          <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase dark:text-indigo-400">
                            Custom Payoff Plan
                          </span>
                          <div className="mt-2.5 flex flex-col gap-1">
                            <span className="block text-sm font-semibold text-slate-400 dark:text-slate-500">
                              Payoff Time:
                            </span>
                            <span className="text-base font-extrabold">
                              {cardCustomResults.payoffMonths} Months
                            </span>

                            <span className="mt-1 block text-sm font-semibold text-slate-400 dark:text-slate-500">
                              Total Interest:
                            </span>
                            <span className="text-base font-extrabold text-emerald-500">
                              {formatCurrency(cardCustomResults.totalInterest)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Savings summary banner */}
                      {!cardMinResults.neverPaysOff && (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💰</span>
                            <div>
                              <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-400">
                                Payoff Strategy Savings
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                Save{' '}
                                <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                  {formatCurrency(
                                    Math.max(
                                      0,
                                      cardMinResults.totalInterest -
                                        cardCustomResults.totalInterest
                                    )
                                  )}
                                </strong>{' '}
                                in compounding interest fees, and finish
                                debt-free{' '}
                                <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                  {Math.max(
                                    0,
                                    cardMinResults.payoffMonths -
                                      cardCustomResults.payoffMonths
                                  )}{' '}
                                  months
                                </strong>{' '}
                                faster!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payoff chart */}
                      <div className="mt-2 flex flex-col gap-2.5">
                        <span className="block text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                          Payoff Timeline Comparison
                        </span>
                        <AreaChart
                          labels={cardChartLabels}
                          datasets={cardChartDatasets}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                  <AmortizationTable
                    schedule={cardCustomResults.schedule}
                    title="Custom Payoff Plan Schedule"
                    hasExtraColumn={false}
                  />
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="flex flex-col gap-8">
                {/* Consolidation comparison card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Inputs Column */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Consolidation Loan inputs
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Model single personal loan consolidating the credit
                          cards.
                        </p>
                      </div>

                      <SliderInput
                        id="cons-apr"
                        label="Consolidation APR"
                        value={consolidationApr}
                        min={3}
                        max={25}
                        step={0.1}
                        type="percent"
                        onChange={(val) =>
                          setConsolidationInput('consolidationApr', val)
                        }
                      />

                      <SliderInput
                        id="cons-term"
                        label="Loan Term"
                        value={consolidationTermMonths}
                        min={12}
                        max={120}
                        step={6}
                        type="months"
                        onChange={(val) =>
                          setConsolidationInput('consolidationTermMonths', val)
                        }
                      />

                      <SliderInput
                        id="cons-fee"
                        label="Origination Fee"
                        value={consolidationOriginationFee}
                        min={0}
                        max={8}
                        step={0.5}
                        type="percent"
                        onChange={(val) =>
                          setConsolidationInput(
                            'consolidationOriginationFee',
                            val
                          )
                        }
                      />

                      <SliderInput
                        id="cons-budget"
                        label="Total Current Payoff Budget"
                        value={consolidationCustomPayment}
                        min={100}
                        max={3000}
                        step={50}
                        type="currency"
                        onChange={(val) =>
                          setConsolidationInput(
                            'consolidationCustomPayment',
                            val
                          )
                        }
                      />

                      {/* Payoff strategy settings */}
                      <div className="dark:border-slate-850 flex items-center justify-between border-t border-slate-200 pt-4">
                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                          Card Strategy
                        </span>

                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/50 bg-slate-50/50 p-1 dark:border-slate-800/50 dark:bg-black/20">
                          <button
                            onClick={() =>
                              setConsolidationStrategy('avalanche')
                            }
                            className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                              consolidationStrategy === 'avalanche'
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          >
                            Avalanche
                          </button>
                          <button
                            onClick={() => setConsolidationStrategy('snowball')}
                            className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                              consolidationStrategy === 'snowball'
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          >
                            Snowball
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Results Columns */}
                    <div className="flex flex-col gap-6 lg:col-span-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Consolidation comparison
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Current credit cards payoff path vs. a single personal
                          loan.
                        </p>
                      </div>

                      {/* Comparisons KPI Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200/50 bg-slate-50/40 p-4 dark:border-slate-800/50 dark:bg-white/5">
                          <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">
                            Current cards payoff
                          </span>
                          <div className="mt-2.5 flex flex-col gap-1.5">
                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Total Debt:
                            </span>
                            <span className="text-base font-extrabold">
                              {formatCurrency(totalCardBalance)}
                            </span>

                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Payoff Time:
                            </span>
                            <span className="text-base font-extrabold">
                              {ccCombinedResults.neverPaysOff
                                ? 'Never'
                                : `${ccCombinedResults.payoffMonths} Months`}
                            </span>

                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Total Interest:
                            </span>
                            <span className="text-base font-extrabold text-rose-500">
                              {ccCombinedResults.neverPaysOff
                                ? 'N/A'
                                : formatCurrency(
                                    ccCombinedResults.totalInterest
                                  )}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                          <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase dark:text-indigo-400">
                            Consolidated Loan Plan
                          </span>
                          <div className="mt-2.5 flex flex-col gap-1.5">
                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Loan Balance (+Fee):
                            </span>
                            <span className="text-base font-extrabold">
                              {formatCurrency(consolidationLoanAmount)}
                              {feeAmount > 0 && (
                                <span className="block text-[10px] font-normal text-slate-400">
                                  incl. {formatCurrency(feeAmount)} fee
                                </span>
                              )}
                            </span>

                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Monthly Payment:
                            </span>
                            <span className="text-base font-extrabold text-indigo-500">
                              {formatCurrency(
                                consolidationLoanResults.monthlyPayment
                              )}
                              <span className="block text-[10px] font-normal text-slate-400">
                                Fixed term
                              </span>
                            </span>

                            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              Total Interest:
                            </span>
                            <span className="text-base font-extrabold text-emerald-500">
                              {formatCurrency(
                                consolidationLoanResults.totalInterest
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Consolidation Savings Banner */}
                      {ccSavings.interestSaved > 0 &&
                        !ccCombinedResults.neverPaysOff && (
                          <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🎉</span>
                              <div>
                                <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-400">
                                  Consolidation Financial Impact
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                  Save{' '}
                                  <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                    {formatCurrency(ccSavings.interestSaved)}
                                  </strong>{' '}
                                  in interest fees! Make you debt-free{' '}
                                  <strong className="dark:text-emerald-250 font-bold text-emerald-800">
                                    {ccSavings.monthsSaved} months
                                  </strong>{' '}
                                  sooner!
                                  {ccSavings.monthlyPaymentDiff > 0 && (
                                    <span className="mt-1 block text-xs font-normal text-slate-400">
                                      Freed up monthly cashflow of{' '}
                                      {formatCurrency(
                                        ccSavings.monthlyPaymentDiff
                                      )}
                                      /mo compared to your current budget!
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Consolidation Chart */}
                      <div className="mt-2 flex flex-col gap-2.5">
                        <span className="block text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                          Consolidation Payoff Timeline
                        </span>
                        <AreaChart
                          labels={consolidationChartLabels}
                          datasets={consolidationChartDatasets}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit card manager panel */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                  {/* Dynamic Card Manager */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md lg:col-span-2 dark:border-slate-800/80 dark:bg-[#111219]/40">
                    <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                      Credit Cards Portfolio
                    </h3>
                    <p className="mt-1 mb-6 text-xs text-slate-500 dark:text-slate-400">
                      Add, update, or remove credit card debts to evaluate
                      consolidation.
                    </p>

                    {/* Card input form */}
                    <form
                      onSubmit={handleAddCard}
                      className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                          Card Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newCardName}
                          onChange={(e) => setNewCardName(e.target.value)}
                          placeholder="e.g. Visa Premier"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Balance ($)
                          </label>
                          <input
                            type="number"
                            min="100"
                            max="50000"
                            required
                            value={newCardBalance}
                            onChange={(e) =>
                              setNewCardBalance(parseInt(e.target.value))
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            APR (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="36"
                            step="0.1"
                            required
                            value={newCardApr}
                            onChange={(e) =>
                              setNewCardApr(parseFloat(e.target.value))
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg bg-indigo-500 py-2 text-center text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-600"
                      >
                        + Add Card
                      </button>
                    </form>

                    {/* Cards List */}
                    <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                      {consolidationCards.map((card) => (
                        <div
                          key={card.id}
                          className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {card.name}
                            </span>
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                              <span>APR: {card.apr}%</span>
                              <span>•</span>
                              <span className="dark:text-slate-350 text-slate-700">
                                Bal: {formatCurrency(card.balance)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => removeConsolidationCard(card.id)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-rose-500/10"
                            aria-label={`Remove ${card.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {consolidationCards.length === 0 && (
                        <div className="border-slate-250 rounded-xl border border-dashed py-8 text-center text-xs font-bold text-slate-400 dark:border-slate-800 dark:text-slate-500">
                          No credit cards added. Add one above.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Schedule */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md lg:col-span-3 dark:border-slate-800/80 dark:bg-[#111219]/40">
                    <AmortizationTable
                      schedule={consolidationLoanResults.schedule}
                      title="Consolidated Personal Loan Schedule"
                      hasExtraColumn={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {(activeTab as any) === 'glossary' && (
              <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-[#111219]/40">
                <Glossary />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
