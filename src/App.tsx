import { useEffect } from 'react';
import { useCalculatorStore } from './store/useCalculatorStore';

function App() {
  const { theme, toggleTheme, activeTab, setActiveTab } = useCalculatorStore();

  // Initialize theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 15.75V18m-3-3V18m-3-3V18m3-12h.008v.008H12.75V6zm3 0h.008v.008H15.75V6zm2.25 2.25h.008v.008H18V8.25zM18 12h.008v.008H18V12zm-2.25 2.25h.008v.008H15.75v-.008zm-3-1.125h.008v.008H12.75v-.008zm-3 1.125h.008v.008H9.75v-.008zm-3 0h.008v.008H6.75v-.008zm0-3h.008v.008H6.75V12zm0-3h.008v.008H6.75V9zm0-3h.008v.008H6.75V6zm3 0h.008v.008H9.75V6zm0 3h.008v.008H9.75V9zm-3 3h.008v.008H6.75V12zm3 0h.008v.008H9.75V12z"
                />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
              Antigravity Calc
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
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
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === 'loan'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === 'compare'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
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
            </nav>
          </div>

          {/* Interactive Calculator Content Area */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-[#111219]/40 sm:p-8">
              {activeTab === 'loan' && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Traditional Loan Calculator</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Model auto, personal, or mortgage loans with interest rates and optional extra payments.
                  </p>
                  <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Calculator Inputs & Outputs Coming Soon</span>
                  </div>
                </div>
              )}

              {activeTab === 'card' && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Credit Card Payoff Calculator</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Simulate card interest compounding and compare minimum payment vs custom payoff plan.
                  </p>
                  <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Calculator Inputs & Outputs Coming Soon</span>
                  </div>
                </div>
              )}

              {activeTab === 'compare' && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Debt Consolidation Comparison</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Evaluate whether consolidating multiple high-interest cards into a personal loan saves money.
                  </p>
                  <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Calculator Inputs & Outputs Coming Soon</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
