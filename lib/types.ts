/**
 * Type definitions for the application
 */

export interface ExcelRow {
  employeeName: string
  date: Date
  inTime: Date | null
  outTime: Date | null
}

export interface DailyAttendanceRecord {
  date: Date
  day: string
  workedHours: number | null
  status: 'present' | 'leave' | 'sunday'
}

export interface MonthlySummary {
  employeeId: string
  employeeName: string
  month: number
  year: number
  expectedHours: number
  actualWorkedHours: number
  leavesUsed: number
  productivity: number
  dailyRecords: DailyAttendanceRecord[]
}

export interface ProcessedExcelData {
  employeeId: string
  employeeName: string
  records: Array<{
    date: Date
    inTime: Date | null
    outTime: Date | null
    workedHours: number | null
    status: 'present' | 'leave' | 'sunday'
  }>
}

