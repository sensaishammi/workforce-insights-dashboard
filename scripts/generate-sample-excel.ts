import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'

const employees = [
  'John Smith',
  'Sarah Johnson',
  'Michael Chen'
]

const years = [2024, 2025]
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function getDayOfWeek(date: Date): number {
  return date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

function generateAttendanceRecord(employee: string, date: Date): { inTime: Date | null; outTime: Date | null } {
  const dayOfWeek = getDayOfWeek(date)
  
  // Sunday - no attendance
  if (dayOfWeek === 0) {
    return { inTime: null, outTime: null }
  }
  
  // Saturday - half day (50% chance of attendance)
  if (dayOfWeek === 6) {
    if (Math.random() < 0.5) {
      // Half day: 10:00 AM to 2:00 PM
      return {
        inTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0, 0),
        outTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0, 0)
      }
    } else {
      // Leave on Saturday
      return { inTime: null, outTime: null }
    }
  }
  
  // Monday to Friday - working days
  // 5% chance of leave (missing times)
  if (Math.random() < 0.05) {
    return { inTime: null, outTime: null }
  }
  
  // Normal working day
  // In-time: 9:45 AM to 10:30 AM (mostly around 10:00)
  let inHour = 10
  let inMinute = Math.floor(Math.random() * 45) // 0-44 minutes
  
  // 10% chance of late arrival (after 10:15)
  if (Math.random() < 0.1) {
    inMinute = 15 + Math.floor(Math.random() * 30) // 15-44 minutes
  }
  
  // Out-time: 6:00 PM to 6:45 PM (mostly around 6:30)
  let outHour = 18
  let outMinute = Math.floor(Math.random() * 45) // 0-44 minutes
  
  // 5% chance of early exit (before 6:00)
  if (Math.random() < 0.05) {
    outHour = 17
    outMinute = 30 + Math.floor(Math.random() * 30) // 30-59 minutes
  }
  
  // 5% chance of overtime (after 6:45)
  if (Math.random() < 0.05) {
    outHour = 19
    outMinute = Math.floor(Math.random() * 30) // 0-29 minutes
  }
  
  return {
    inTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), inHour, inMinute, 0),
    outTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), outHour, outMinute, 0)
  }
}

async function generateSampleExcel() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Attendance')

  // Add headers
  worksheet.addRow(['Employee Name', 'Date', 'In-Time', 'Out-Time'])

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  // Generate data for each employee and year
  for (const employee of employees) {
    for (const year of years) {
      for (const month of months) {
        const daysInMonth = new Date(year, month, 0).getDate()
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day)
          const record = generateAttendanceRecord(employee, date)
          
          if (record.inTime && record.outTime) {
            worksheet.addRow([employee, date, record.inTime, record.outTime])
          } else {
            // Leave or Sunday - empty times
            worksheet.addRow([employee, date, '', ''])
          }
        }
      }
    }
  }

  // Format date and time columns
  worksheet.getColumn(2).numFmt = 'yyyy-mm-dd' // Date column
  worksheet.getColumn(3).numFmt = 'hh:mm' // In-Time column
  worksheet.getColumn(4).numFmt = 'hh:mm' // Out-Time column

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = 20
    }
  })

  // Save file
  const outputPath = path.join(process.cwd(), 'public', 'sample-attendance.xlsx')
  await workbook.xlsx.writeFile(outputPath)
  
  const rowCount = worksheet.rowCount - 1 // Exclude header
  console.log(`✅ Generated sample Excel file: ${outputPath}`)
  console.log(`📊 Total records: ${rowCount} (excluding header)`)
  console.log(`👥 Employees: ${employees.length}`)
  console.log(`📅 Years: ${years.join(', ')}`)
}

generateSampleExcel().catch(console.error)

