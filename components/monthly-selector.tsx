'use client'

interface MonthlySelectorProps {
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number, year: number) => void
}

export function MonthlySelector({
  selectedMonth,
  selectedYear,
  onMonthChange,
}: MonthlySelectorProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Show only 2023, 2024, 2025
  const years = [2023, 2024, 2025]

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10)
    onMonthChange(month, selectedYear)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10)
    onMonthChange(selectedMonth, year)
  }

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label htmlFor="month" className="block text-sm font-semibold text-slate-700 mb-2">
          Month
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="block w-full rounded-lg border-slate-300/60 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm px-4 py-2.5 border bg-white/80 backdrop-blur-sm text-slate-900 transition-all duration-200 hover:border-slate-400"
        >
          {months.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-2">
          Year
        </label>
        <select
          id="year"
          value={selectedYear > 2025 ? 2025 : selectedYear < 2023 ? 2023 : selectedYear}
          onChange={handleYearChange}
          className="block w-full rounded-lg border-slate-300/60 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm px-4 py-2.5 border bg-white/80 backdrop-blur-sm text-slate-900 transition-all duration-200 hover:border-slate-400"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

