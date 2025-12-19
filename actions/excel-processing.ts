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

      const employeeNameValue =
        typeof employeeNameCell.value === 'string' ||
        typeof employeeNameCell.value === 'number' ||
        employeeNameCell.value instanceof Date
          ? employeeNameCell.value
          : null

      const dateValue =
        typeof dateCell.value === 'string' ||
        typeof dateCell.value === 'number' ||
        dateCell.value instanceof Date
          ? dateCell.value
          : null

      const inTimeValue =
        typeof inTimeCell.value === 'string' ||
        typeof inTimeCell.value === 'number' ||
        inTimeCell.value instanceof Date
          ? inTimeCell.value
          : null

      const outTimeValue =
        typeof outTimeCell.value === 'string' ||
        typeof outTimeCell.value === 'number' ||
        outTimeCell.value instanceof Date
          ? outTimeCell.value
          : null

      processRow(
        employeeNameValue,
        dateValue,
        inTimeValue,
        outTimeValue,
        employeeMap
      )
    })
  }

  return {
    success: true,
    data: Array.from(employeeMap.values()),
    message: 'File processed successfully',
  }
}
