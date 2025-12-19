'use server'

import ExcelJS from 'exceljs'
import { prisma } from '@/db/prisma'
import {
  parseExcelDate,
  parseExcelTime,
  combineDateAndTime,
  calculateWorkedHours,
  getAttendanceStatus,
  calculateExpectedHoursForMonth,
  calculateLeavesUsed,
  calculateProductivity,
  getDayInfo,
} from '@/lib/time-calculations'
import type { ProcessedExcelData } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Parse CSV content into rows
 */
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = []
  const lines = csvText.split('\n')

  for (const line of lines) {
    if (!line.trim()) continue

    const row: string[] = []
    let currentField = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        row.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }

    row.push(currentField.trim())
    rows.push(row)
  }

  return rows
}

/**
 * Convert ExcelJS CellValue to acceptable type for processing
 */
function convertCellValue(
  value: ExcelJS.CellValue
): string | number | Date | null | undefined {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value instanceof Date
  ) {
    return value
  }
  // Filter out booleans, null, undefined, and other unsupported types
  return null
}

/**
 * Process a single row of data
 */
function processRow(
  employeeNameValue: string | number | Date | null | undefined,
  dateValue: string | number | Date | null | undefined,
  inTimeValue: string | number | Date | null | undefined,
  outTimeValue: string | number | Date | null | undefined,
  employeeMap: Map<string, ProcessedExcelData>
): void {
  if (!employeeNameValue || !dateValue) return

  const employeeName = String(employeeNameValue).trim()
  if (!employeeName) return

  const parsedDate =
    typeof dateValue === 'string' ||
    typeof dateValue === 'number' ||
    dateValue instanceof Date
      ? parseExcelDate(dateValue)
      : null

  if (!parsedDate) return

  const date = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  )

  let inTime: Date | null = null
  let outTime: Date | null = null

  if (
    typeof inTimeValue === 'string' ||
    typeof inTimeValue === 'number' ||
    inTimeValue instanceof Date
  ) {
    const parsed = parseExcelTime(inTimeValue)
    if (parsed) inTime = combineDateAndTime(date, parsed)
  }

  if (
    typeof outTimeValue === 'string' ||
    typeof outTimeValue === 'number' ||
    outTimeValue instanceof Date
  ) {
    const parsed = parseExcelTime(outTimeValue)
    if (parsed) outTime = combineDateAndTime(date, parsed)
  }

  const workedHours = calculateWorkedHours(inTime, outTime)
  const status = getAttendanceStatus(date, workedHours)

  let employeeData = employeeMap.get(employeeName)
  if (!employeeData) {
    employeeData = { employeeId: '', employeeName, records: [] }
    employeeMap.set(employeeName, employeeData)
  }

  employeeData.records.push({
    date,
    inTime,
    outTime,
    workedHours,
    status,
  })
}

/**
 * Process uploaded file (Excel or CSV)
 */
export async function processExcelFile(formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, message: 'No file provided' }
  }

  const employeeMap = new Map<string, ProcessedExcelData>()
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    const text = await file.text()
    const rows = parseCSV(text)

    for (let i = 1; i < rows.length; i++) {
      const [name, date, inTime, outTime] = rows[i]
      processRow(name, date, inTime, outTime, employeeMap)
    }
  } else {
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return { success: false, message: 'Excel file is empty' }
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return

      const employeeNameCell = row.getCell(1)
      const dateCell = row.getCell(2)
      const inTimeCell = row.getCell(3)
      const outTimeCell = row.getCell(4)

      // Convert cell values to acceptable types, filtering out booleans
      const employeeName = convertCellValue(employeeNameCell.value)
      const date = convertCellValue(dateCell.value)
      const inTime = convertCellValue(inTimeCell.value)
      const outTime = convertCellValue(outTimeCell.value)

      processRow(employeeName, date, inTime, outTime, employeeMap)
    })
  }

  return {
    success: true,
    data: Array.from(employeeMap.values()),
    message: 'File processed successfully',
  }
}

export async function saveProcessedData(
  processedData: ProcessedExcelData[]
): Promise<{ success: boolean; message: string }> {
  try {
    for (const employeeData of processedData) {
      let employee = await prisma.employee.findFirst({
        where: { name: employeeData.employeeName },
      })

      if (!employee) {
        try {
          employee = await prisma.employee.create({
            data: {
              name: employeeData.employeeName,
              employeeId: null,
            },
          })
        } catch (error: any) {
          if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
            console.warn(
              `Unique constraint error for employee ${employeeData.employeeName} (initial create attempt), attempting to find existing employee...`
            )
            employee = await prisma.employee.findFirst({
              where: { name: employeeData.employeeName },
            })
            if (!employee) {
              const uniqueEmployeeId = uuidv4()
              console.warn(
                `Attempting to create employee ${employeeData.employeeName} with generated unique ID: ${uniqueEmployeeId}`
              )
              try {
                employee = await prisma.employee.create({
                  data: {
                    name: employeeData.employeeName,
                    employeeId: uniqueEmployeeId,
                  },
                })
              } catch (retryError: any) {
                console.error(
                  `Failed to create employee ${employeeData.employeeName} even with unique ID. Error: ${retryError.message}`
                )
                employee = await prisma.employee.findFirst({
                  where: { name: employeeData.employeeName },
                })
                if (!employee) {
                  console.error(
                    `Could not find employee ${employeeData.employeeName} after multiple create attempts. Skipping records for this employee.`
                  )
                  continue
                }
              }
            }
          } else {
            throw error
          }
        }
      }

      for (const record of employeeData.records) {
        const normalizedDate = new Date(record.date)
        normalizedDate.setHours(0, 0, 0, 0)

        await prisma.attendanceRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: employee.id,
              date: normalizedDate,
            },
          },
          create: {
            employeeId: employee.id,
            date: normalizedDate,
            inTime: record.inTime,
            outTime: record.outTime,
            workedHours: record.workedHours,
            status: record.status,
          },
          update: {
            inTime: record.inTime,
            outTime: record.outTime,
            workedHours: record.workedHours,
            status: record.status,
          },
        })
      }

      const recordsByMonth = new Map<string, typeof employeeData.records>()

      for (const record of employeeData.records) {
        const monthKey = `${record.date.getFullYear()}-${record.date.getMonth() + 1}`
        if (!recordsByMonth.has(monthKey)) {
          recordsByMonth.set(monthKey, [])
        }
        recordsByMonth.get(monthKey)!.push(record)
      }

      for (const [monthKey, records] of recordsByMonth.entries()) {
        const [year, month] = monthKey.split('-').map(Number)
        const firstRecord = records[0]!
        const date = firstRecord.date

        const expectedHours = calculateExpectedHoursForMonth(year, month)
        const actualWorkedHours = records.reduce((sum, r) => {
          return sum + (r.workedHours ?? 0)
        }, 0)
        const leavesUsed = calculateLeavesUsed(
          year,
          month,
          records.map((r) => ({ date: r.date, status: r.status }))
        )
        const productivity = calculateProductivity(actualWorkedHours, expectedHours)

        const dailyRecords = records.map((r) => {
          const dayInfo = getDayInfo(r.date)
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          return {
            date: r.date.toISOString(),
            day: dayNames[dayInfo.day],
            workedHours: r.workedHours,
            status: r.status,
          }
        })

        await prisma.processedData.upsert({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month,
              year,
            },
          },
          create: {
            employeeId: employee.id,
            month,
            year,
            expectedHours,
            actualWorkedHours: Math.round(actualWorkedHours * 100) / 100,
            leavesUsed,
            productivity,
            dailyRecords: dailyRecords as unknown as object,
          },
          update: {
            expectedHours,
            actualWorkedHours: Math.round(actualWorkedHours * 100) / 100,
            leavesUsed,
            productivity,
            dailyRecords: dailyRecords as unknown as object,
          },
        })
      }
    }

    return {
      success: true,
      message: 'Data saved successfully',
    }
  } catch (error) {
    console.error('Error saving processed data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to save data'
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return {
      success: false,
      message: `Error saving data: ${errorMessage}. Please check your database connection.`,
    }
  }
}

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    })
    return { success: true, data: employees }
  } catch (error) {
    console.error('Error fetching employees:', error)
    return { success: false, data: [], message: 'Failed to fetch employees' }
  }
}

export async function getMonthlySummary(employeeId: string, month: number, year: number) {
  try {
    const processedData = await prisma.processedData.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
    })

    if (!processedData) {
      return { success: false, data: null, message: 'No data found for this month' }
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    })

    if (!employee) {
      return { success: false, data: null, message: 'Employee not found' }
    }

    const dailyRecords = (processedData.dailyRecords as Array<{
      date: string
      day: string
      workedHours: number | null
      status: string
    }>).map((r) => ({
      date: r.date,
      day: r.day,
      workedHours: r.workedHours,
      status: r.status as 'present' | 'leave' | 'sunday',
    }))

    return {
      success: true,
      data: {
        employeeId: processedData.employeeId,
        employeeName: employee.name,
        month: processedData.month,
        year: processedData.year,
        expectedHours: processedData.expectedHours,
        actualWorkedHours: processedData.actualWorkedHours,
        leavesUsed: processedData.leavesUsed,
        productivity: processedData.productivity,
        dailyRecords,
      },
    }
  } catch (error) {
    console.error('Error fetching monthly summary:', error)
    return { success: false, data: null, message: 'Failed to fetch monthly summary' }
  }
}
