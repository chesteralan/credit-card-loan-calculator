import React, { useState } from 'react';

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  endingBalance: number;
}

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  title?: string;
  hasExtraColumn?: boolean;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  schedule,
  title = 'Payment Schedule',
  hasExtraColumn = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12); // 12 months = 1 year per page
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Group months into years (1-12 is Year 1, 13-24 is Year 2, etc.)
  const maxYears = Math.ceil(schedule.length / 12);
  const years = Array.from({ length: maxYears }, (_, i) => i + 1);

  // Filter schedule by selected year
  const filteredSchedule = schedule.filter((row) => {
    if (yearFilter === 'all') return true;
    const rowYear = Math.ceil(row.month / 12);
    return rowYear === yearFilter;
  });

  // Calculate paginated index
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Reset pagination page when filter changes to prevent out of bounds
  React.useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter]);

  const currentRows = filteredSchedule.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredSchedule.length / rowsPerPage);

  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Beginning Balance',
      'Payment',
      'Principal Paid',
      'Interest Paid',
      hasExtraColumn ? 'Extra Payment' : '',
      'Ending Balance',
    ].filter(Boolean);

    const rows = schedule.map((row) =>
      [
        row.month,
        row.beginningBalance.toFixed(2),
        row.monthlyPayment.toFixed(2),
        row.principalPaid.toFixed(2),
        row.interestPaid.toFixed(2),
        hasExtraColumn ? row.extraPayment.toFixed(2) : '',
        row.endingBalance.toFixed(2),
      ].filter((v) => v !== '')
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${title.toLowerCase().replace(/\s+/g, '_')}_schedule.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Filter:
            </span>
            <select
              value={yearFilter}
              onChange={(e) => {
                const val = e.target.value;
                setYearFilter(val === 'all' ? 'all' : parseInt(val));
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/60"
              aria-label="Filter schedule by year"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            disabled={schedule.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
            aria-label="Export schedule to CSV file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-3.5 w-3.5 text-indigo-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/30 dark:border-slate-800/80 dark:bg-black/10">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="dark:border-slate-850 border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-950/20 dark:text-slate-500">
              <th className="px-4 py-3 text-center">Month</th>
              <th className="px-4 py-3 text-right">Beginning Balance</th>
              <th className="px-4 py-3 text-right">Monthly Payment</th>
              <th className="px-4 py-3 text-right">Principal Paid</th>
              <th className="px-4 py-3 text-right">Interest Paid</th>
              {hasExtraColumn && (
                <th className="px-4 py-3 text-right">Extra Payment</th>
              )}
              <th className="px-4 py-3 text-right">Ending Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-900 dark:text-slate-300">
            {currentRows.map((row) => (
              <tr
                key={row.month}
                className="transition-colors hover:bg-slate-50/30 dark:hover:bg-white/5"
              >
                <td className="px-4 py-2.5 text-center font-bold text-slate-400 dark:text-slate-500">
                  {row.month}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatCurrency(row.beginningBalance)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatCurrency(row.monthlyPayment)}
                </td>
                <td className="px-4 py-2.5 text-right text-emerald-600 tabular-nums dark:text-emerald-400">
                  {formatCurrency(row.principalPaid)}
                </td>
                <td className="px-4 py-2.5 text-right text-rose-600 tabular-nums dark:text-rose-400">
                  {formatCurrency(row.interestPaid)}
                </td>
                {hasExtraColumn && (
                  <td className="px-4 py-2.5 text-right font-semibold text-indigo-600 tabular-nums dark:text-indigo-400">
                    {row.extraPayment > 0
                      ? formatCurrency(row.extraPayment)
                      : '—'}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatCurrency(row.endingBalance)}
                </td>
              </tr>
            ))}

            {schedule.length === 0 && (
              <tr>
                <td
                  colSpan={hasExtraColumn ? 7 : 6}
                  className="py-8 text-center font-semibold text-slate-400 dark:text-slate-500"
                >
                  No data available. Fill in the calculator values above to
                  generate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 dark:border-slate-900 dark:text-slate-400">
          <span>
            Showing Year {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
