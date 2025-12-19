'use client'

import { useState } from 'react'
import { SummaryCard } from '@/components/summary-card'
import { AttendanceTable } from '@/components/attendance-table'
import { MonthlySelector } from '@/components/monthly-selector'
import { EmployeeSelector } from '@/components/employee-selector'

export interface Employee {
  id: string
  name: string
}

export interface MonthlyData {
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

interface DashboardProps {
  initialEmployees: Employee[]
  initialMonthlyData: MonthlyData | null
  initialSelectedEmployeeId: string | null
  initialMonth: number
  initialYear: number
}

export function Dashboard({
  initialEmployees,
  initialMonthlyData,
  initialSelectedEmployeeId,
  initialMonth,
  initialYear,
}: DashboardProps) {
  const [employees] = useState(initialEmployees)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialSelectedEmployeeId)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(initialMonthlyData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMonthChange = async (month: number, year: number) => {
    if (!selectedEmployeeId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/monthly-summary?employeeId=${selectedEmployeeId}&month=${month}&year=${year}`)
      if (!response.ok) {
        throw new Error('Failed to fetch monthly summary')
      }
      const result = await response.json()
      
      if (result.success && result.data) {
        setMonthlyData(result.data)
        setSelectedMonth(month)
        setSelectedYear(year)
      } else {
        setError(result.message || 'No data found')
        setMonthlyData(null)
      }
    } catch (err) {
      setError('Failed to load monthly summary')
      setMonthlyData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeChange = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    
    if (employeeId) {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/monthly-summary?employeeId=${employeeId}&month=${selectedMonth}&year=${selectedYear}`)
        if (!response.ok) {
          throw new Error('Failed to fetch monthly summary')
        }
        const result = await response.json()
        
        if (result.success && result.data) {
          setMonthlyData(result.data)
        } else {
          setError(result.message || 'No data found')
          setMonthlyData(null)
        }
      } catch (err) {
        setError('Failed to load monthly summary')
        setMonthlyData(null)
      } finally {
        setLoading(false)
      }
    } else {
      setMonthlyData(null)
    }
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
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/upload"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Upload Data
          </a>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmployeeSelector
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeChange={handleEmployeeChange}
            />
            <MonthlySelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
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
      </div>
    </div>
  )
}
