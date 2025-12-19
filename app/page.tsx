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
  const [selectedYear, setSelectedYear] = useState(getDefaultYear())
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
          if (!selectedEmployeeId || !result.data.find(e => e.id === selectedEmployeeId)) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leave & Productivity Analyzer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze employee attendance, leave usage, and productivity metrics
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Upload Data
          </Link>
        </div>

        {/* Empty State - No Employees */}
        {!loading && employees.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center mb-6">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No Employees Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get started by uploading an Excel file with attendance data.
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload Attendance Data
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filters - Only show when employees exist */}
        {employees.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && employees.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">{error}</p>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Daily Attendance - {monthlyData.employeeName}
              </h2>
              <AttendanceTable records={monthlyData.dailyRecords} />
            </div>
          </>
        )}

        {/* Empty State - No monthly data but employee selected */}
        {!monthlyData && !loading && !error && selectedEmployeeId && employees.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No Data for Selected Period</h3>
              <p className="mt-2 text-sm text-gray-600">
                No attendance data found for <strong>{employees.find(e => e.id === selectedEmployeeId)?.name || 'this employee'}</strong> in <strong>{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try selecting a different month/year from the dropdown above, or upload data for this period.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
