import React, { useState } from 'react';

interface GlossaryItem {
  term: string;
  definition: string;
  tip?: string;
}

export const Glossary: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items: GlossaryItem[] = [
    {
      term: 'Annual Percentage Rate (APR)',
      definition:
        'The yearly interest rate charged on borrowed money, including fees and other costs. Credit cards calculate compounding interest monthly using the APR divided by 12.',
      tip: 'Even a small 1% difference in APR can save thousands of dollars over the lifetime of a large loan.',
    },
    {
      term: 'Amortization',
      definition:
        'The process of spreading out a loan into a series of equal periodic payments. Over time, the ratio of your payment going towards the principal increases while the interest portion decreases.',
      tip: 'Paying extra principal early in the loan term is the most effective way to shorten your amortization schedule and save on interest.',
    },
    {
      term: 'Principal vs. Interest',
      definition:
        'Principal is the actual amount of money you borrowed. Interest is the fee the lender charges you to borrow that money.',
      tip: 'Always ensure your lender applies extra payments directly to the principal balance, rather than counting them as early next-month payments.',
    },
    {
      term: 'Debt Avalanche Method',
      definition:
        'A debt payoff strategy where you pay minimums on all accounts, and allocate all extra payoff funds to the account with the highest interest rate (APR). Once that is paid off, you roll the payment into the next highest APR account.',
      tip: 'This is the mathematically optimal strategy, saving you the maximum amount of money in interest fees.',
    },
    {
      term: 'Debt Snowball Method',
      definition:
        'A debt payoff strategy where you pay minimums on all accounts, and allocate all extra payoff funds to the account with the smallest balance first. Once that is paid off, you roll that payment into the next smallest account.',
      tip: 'This method is great for psychological motivation, giving you quick victories as small accounts are wiped out fast.',
    },
    {
      term: 'Origination Fee',
      definition:
        'An upfront fee charged by a lender to process a new loan. It is usually calculated as a percentage of the total loan amount (typically 1% to 5%) and deducted from the loan payout or rolled into the principal.',
      tip: 'Always include the origination fee when comparing debt consolidation savings, as it is a pure upfront cost that increases your total loan size.',
    },
    {
      term: 'Debt Consolidation',
      definition:
        'The act of combining multiple high-interest debts (like credit cards) into a single personal loan, ideally with a lower APR and fixed term.',
      tip: 'Consolidation only works if you avoid charging new balances on the cards you just paid off, otherwise, you double your debt burden.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Financial Glossary & Strategy Tips
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Equip yourself with the financial knowledge and terms needed to make
          smart borrowing and repayment decisions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={item.term}
              className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 dark:border-slate-800/80 dark:bg-[#111219]/40 ${
                isOpen ? 'ring-1 ring-indigo-500/20' : ''
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="text-slate-850 flex w-full items-center justify-between px-5 py-4 text-left font-bold transition-colors hover:bg-slate-50/50 dark:text-slate-200 dark:hover:bg-white/5"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base">{item.term}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 text-indigo-500 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'dark:border-slate-850 max-h-96 border-t border-slate-100 opacity-100'
                    : 'pointer-events-none max-h-0 opacity-0'
                }`}
              >
                <div className="text-slate-650 dark:text-slate-350 flex flex-col gap-4 p-5 text-sm leading-relaxed">
                  <p>{item.definition}</p>

                  {item.tip && (
                    <div className="flex gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                        💡
                      </div>
                      <div className="flex-1">
                        <strong className="font-bold">Pro Tip:</strong>{' '}
                        {item.tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
