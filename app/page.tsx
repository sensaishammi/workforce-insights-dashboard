'use client'

import { useState, useEffect } from 'react'
import { getEmployees, getMonthlySummary } from '@/actions/excel-processing'
import { SummaryCard } from '@/components/summary-card'
import { AttendanceTable } from '@/components/attendance-table'
import { MonthlySelector } from '@/components/monthly-selector'
import { EmployeeSelector } from '@/components/employee-selector'
import { FileUpload } from '@/components/file-upload'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
}

interface MonthlyData {
  employeeId: string
  employeeName: string
  month: number
  year: number
  expectedHours: number
  actualWorkedHours: number
  leavesUsed: number
  productivity: number
  dailyRecords: Array<{
    date: string
    day: string
    workedHours: number | null
    status: 'present' | 'leave' | 'sunday'
  }>
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  // Default to current year if between 2023-2025, otherwise use 2024
  const getDefaultYear = () => {
    const currentYear = new Date().getFullYear()
    if (currentYear >= 2023 && currentYear <= 2025) {
      return currentYear
    }
    return 2024 // Default to 2024 if outside range
  }
  const [selectedYear, setSelectedYear] = useState(() => {
    const defaultYear = getDefaultYear()
    // Ensure it's within valid range
    if (defaultYear < 2023) return 2023
    if (defaultYear > 2025) return 2025
    return defaultYear
  })
  
  // Ensure selectedYear stays within valid range
  useEffect(() => {
    if (selectedYear < 2023) {
      setSelectedYear(2023)
    } else if (selectedYear > 2025) {
      setSelectedYear(2025)
    }
  }, [selectedYear])
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load employees on mount
  useEffect(() => {
    loadEmployees()
  }, [])

  // Load monthly summary when employee, month, or year changes
  useEffect(() => {
    if (selectedEmployeeId) {
      loadMonthlySummary()
    } else {
      setMonthlyData(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, selectedMonth, selectedYear])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const result = await getEmployees()
      if (result.success && result.data) {
        setEmployees(result.data)
        // Auto-select first employee if available and none selected
        if (result.data.length > 0) {
          // Always set the first employee if none is selected
          // This ensures data loads after upload
          const firstEmployeeId = result.data[0].id
          if (!selectedEmployeeId || !result.data.find((e: Employee) => e.id === selectedEmployeeId)) {
            setSelectedEmployeeId(firstEmployeeId)
          }
        } else {
          // No employees, clear selection
          setSelectedEmployeeId(null)
          setMonthlyData(null)
        }
      } else {
        setEmployees([])
        setSelectedEmployeeId(null)
        setMonthlyData(null)
      }
    } catch (err) {
      console.error('Error loading employees:', err)
      setEmployees([])
      setSelectedEmployeeId(null)
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlySummary = async () => {
    if (!selectedEmployeeId) {
      setMonthlyData(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getMonthlySummary(selectedEmployeeId, selectedMonth, selectedYear)
      if (result.success && result.data) {
        setMonthlyData(result.data)
        setError(null)
      } else {
        // No data for this month/year is not necessarily an error
        // Only show error if it's a real error, not just "no data found"
        if (result.message && !result.message.includes('No data found')) {
          setError(result.message)
        } else {
          setError(null) // Clear error for "no data" case
        }
        setMonthlyData(null)
      }
    } catch (err) {
      console.error('Error loading monthly summary:', err)
      setError('Failed to load monthly summary')
      setMonthlyData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Elegant Introduction Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Leave & Productivity Analyzer
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            Transform attendance data into actionable insights. Track employee productivity, manage leave patterns, and make data-driven decisions with ease.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8 flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="px-5 py-2.5 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow font-medium text-sm"
          >
            Upload Data
          </Link>
        </div>

        {/* Empty State - No Employees */}
        {!loading && employees.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center mb-6">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No Employees Found</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Get started by uploading an Excel or CSV file with attendance data.
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  Upload Attendance Data
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filters - Only show when employees exist */}
        {employees.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmployeeSelector
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onEmployeeChange={setSelectedEmployeeId}
              />
              <MonthlySelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-slate-600 font-medium">Loading data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && employees.length > 0 && (
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        {monthlyData && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <SummaryCard
                title="Expected Hours"
                value={monthlyData.expectedHours.toFixed(2)}
                unit="hours"
              />
              <SummaryCard
                title="Actual Worked Hours"
                value={monthlyData.actualWorkedHours.toFixed(2)}
                unit="hours"
              />
              <SummaryCard
                title="Leaves Used"
                value={`${monthlyData.leavesUsed} / 2`}
                variant={monthlyData.leavesUsed > 2 ? 'danger' : monthlyData.leavesUsed === 2 ? 'warning' : 'success'}
              />
              <SummaryCard
                title="Productivity"
                value={monthlyData.productivity.toFixed(2)}
                unit="%"
                variant={
                  monthlyData.productivity >= 100
                    ? 'success'
                    : monthlyData.productivity >= 80
                    ? 'warning'
                    : 'danger'
                }
              />
            </div>

            {/* Attendance Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                Daily Attendance - {monthlyData.employeeName}
              </h2>
              <AttendanceTable records={monthlyData.dailyRecords} />
            </div>
          </>
        )}

        {/* Empty State - No monthly data but employee selected */}
        {!monthlyData && !loading && !error && selectedEmployeeId && employees.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No Data for Selected Period</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                No attendance data found for <strong className="text-slate-900">{employees.find(e => e.id === selectedEmployeeId)?.name || 'this employee'}</strong> in <strong className="text-slate-900">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try selecting a different month/year from the dropdown above, or upload data for this period.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  Upload More Data
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
