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

/**
 * Process uploaded Excel file and extract attendance data
 */
export async function processExcelFile(
  formData: FormData
): Promise<{
  success: boolean
  message: string
  data?: ProcessedExcelData[]
}> {
  try {
    const file = formData.get('file') as File | null
    if (!file || !(file instanceof File)) {
      return { success: false, message: 'No file provided. Please select an Excel file.' }
    }
    
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return { success: false, message: 'Excel file is empty' }
    }

    const rows: ProcessedExcelData[] = []
    const employeeMap = new Map<string, ProcessedExcelData>()

    // Skip header row (assuming first row is headers)
    let rowIndex = 2 // Start from row 2 (1-indexed, but we'll iterate)

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header row

      try {
        const employeeNameCell = row.getCell(1)
        const dateCell = row.getCell(2)
        const inTimeCell = row.getCell(3)
        const outTimeCell = row.getCell(4)

        // Validate required cells
        if (!employeeNameCell.value || !dateCell.value) {
          return // Skip invalid rows
        }

        // Extract cell values safely
        const employeeNameValue = employeeNameCell.value
        const dateValue = dateCell.value
        const inTimeValue = inTimeCell.value
        const outTimeValue = outTimeCell.value

        // Skip if value types are not supported
        if (
          typeof employeeNameValue === 'boolean' ||
          typeof dateValue === 'boolean' ||
          (inTimeValue && typeof inTimeValue === 'boolean') ||
          (outTimeValue && typeof outTimeValue === 'boolean')
        ) {
          return // Skip rows with boolean values
        }

        const employeeName = String(employeeNameValue).trim()
        if (!employeeName) {
          return
        }

        // Parse date - only accept string, number, or Date
        const dateParsed =
          typeof dateValue === 'string' || typeof dateValue === 'number' || dateValue instanceof Date
            ? parseExcelDate(dateValue)
            : null

        if (!dateParsed) {
          return // Skip rows with invalid dates
        }

        // Normalize date to start of day (remove time component)
        const date = new Date(dateParsed.getFullYear(), dateParsed.getMonth(), dateParsed.getDate())

        // Parse times
        let inTime: Date | null = null
        let outTime: Date | null = null

        if (inTimeValue && (typeof inTimeValue === 'string' || typeof inTimeValue === 'number' || inTimeValue instanceof Date)) {
          const parsedInTime = parseExcelTime(inTimeValue)
          if (parsedInTime) {
            inTime = combineDateAndTime(date, parsedInTime)
          }
        }

        if (outTimeValue && (typeof outTimeValue === 'string' || typeof outTimeValue === 'number' || outTimeValue instanceof Date)) {
          const parsedOutTime = parseExcelTime(outTimeValue)
          if (parsedOutTime) {
            outTime = combineDateAndTime(date, parsedOutTime)
          }
        }

        // Calculate worked hours
        const workedHours = calculateWorkedHours(inTime, outTime)
        const status = getAttendanceStatus(date, workedHours)

        // Get or create employee data structure
        let employeeData = employeeMap.get(employeeName)
        if (!employeeData) {
          employeeData = {
            employeeId: '', // Will be set after employee creation
            employeeName,
            records: [],
          }
          employeeMap.set(employeeName, employeeData)
        }

        employeeData.records.push({
          date,
          inTime,
          outTime,
          workedHours,
          status,
        })
      } catch (error) {
        // Skip rows that cause errors
        console.error(`Error processing row ${rowNumber}:`, error)
      }
    })

    if (employeeMap.size === 0) {
      return { success: false, message: 'No valid data found in Excel file' }
    }

    // Convert map to array
    const processedData = Array.from(employeeMap.values())

    return {
      success: true,
      message: `Processed ${processedData.length} employee(s) with ${processedData.reduce((sum, emp) => sum + emp.records.length, 0)} attendance records`,
      data: processedData,
    }
  } catch (error) {
    console.error('Error processing Excel file:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process Excel file'
    return {
      success: false,
      message: `Error processing file: ${errorMessage}. Please ensure the file is a valid Excel file (.xlsx or .xls)`,
    }
  }
}

/**
 * Save processed Excel data to database
 */
export async function saveProcessedData(
  processedData: ProcessedExcelData[]
): Promise<{ success: boolean; message: string }> {
  try {
    for (const employeeData of processedData) {
      // Find or create employee - handle race conditions and unique constraint issues
      let employee = await prisma.employee.findFirst({
        where: { name: employeeData.employeeName },
      })

      if (!employee) {
        try {
          // First attempt: Try creating with employeeId as null
          // MongoDB allows multiple nulls in unique indexes
          employee = await prisma.employee.create({
            data: {
              name: employeeData.employeeName,
              employeeId: null,
            },
          })
        } catch (error: any) {
          // Handle unique constraint error on employeeId
          if (error?.code === 'P2002' && error?.message?.includes('employeeId')) {
            // If null employeeId conflicts, generate a unique one
            try {
              const uniqueEmployeeId = `EMP_${employeeData.employeeName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
              employee = await prisma.employee.create({
                data: {
                  name: employeeData.employeeName,
                  employeeId: uniqueEmployeeId,
                },
              })
            } catch (retryError: any) {
              // If that also fails, try to find existing employee by name
              employee = await prisma.employee.findFirst({
                where: { name: employeeData.employeeName },
              })
              if (!employee) {
                throw new Error(
                  `Failed to create employee "${employeeData.employeeName}". ` +
                  `Unique constraint violation on employeeId. Please check for duplicate employeeId values in your database.`
                )
              }
            }
          } else if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
            // Other unique constraint errors - try to find existing employee
            console.warn(`Unique constraint error for employee ${employeeData.employeeName}, attempting to find existing employee...`)
            employee = await prisma.employee.findFirst({
              where: { name: employeeData.employeeName },
            })
            if (!employee) {
              throw new Error(
                `Failed to create or find employee "${employeeData.employeeName}". ` +
                `Error: ${error.message}`
              )
            }
          } else {
            // Re-throw non-constraint errors
            throw error
          }
        }
      }

      // Save attendance records
      for (const record of employeeData.records) {
        // Normalize date to start of day for consistent storage
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

      // Process and save monthly summaries
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

        // Calculate expected hours
        const expectedHours = calculateExpectedHoursForMonth(year, month)

        // Calculate actual worked hours
        const actualWorkedHours = records.reduce((sum, r) => {
          return sum + (r.workedHours ?? 0)
        }, 0)

        // Calculate leaves used
        const leavesUsed = calculateLeavesUsed(
          year,
          month,
          records.map((r) => ({ date: r.date, status: r.status }))
        )

        // Calculate productivity
        const productivity = calculateProductivity(actualWorkedHours, expectedHours)

        // Create daily records for JSON storage
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

        // Save processed data
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

/**
 * Get all employees
 */
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

/**
 * Get monthly summary for an employee
 */
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

    // Fetch employee separately (MongoDB doesn't support relations)
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

