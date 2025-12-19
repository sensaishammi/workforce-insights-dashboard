import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'

async function generateSampleExcel() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Attendance')

  // Add headers
  worksheet.addRow(['Employee Name/ID', 'Date', 'In-Time', 'Out-Time'])

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  // Sample data for January 2024
  const employees = ['John Doe', 'Jane Smith', 'Bob Johnson']
  const year = 2024
  const month = 1 // January

  for (const employee of employees) {
    const daysInMonth = new Date(year, month, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()

      // Skip Sundays
      if (dayOfWeek === 0) continue

      // Randomly mark some days as leave (about 10% chance)
      const isLeave = Math.random() < 0.1

      if (isLeave) {
        // Leave - no in-time or out-time
        worksheet.addRow([employee, date, '', ''])
      } else {
        // Regular working day
        let inTime: Date
        let outTime: Date

        if (dayOfWeek === 6) {
          // Saturday: 10:00 AM - 2:00 PM
          inTime = new Date(year, month - 1, day, 10, 0, 0)
          outTime = new Date(year, month - 1, day, 14, 0, 0)
        } else {
          // Monday-Friday: 10:00 AM - 6:30 PM
          // Add some variation (±15 minutes)
          const inTimeVariation = Math.floor(Math.random() * 31) - 15 // -15 to +15 minutes
          const outTimeVariation = Math.floor(Math.random() * 31) - 15

          inTime = new Date(year, month - 1, day, 10, 0 + inTimeVariation, 0)
          outTime = new Date(year, month - 1, day, 18, 30 + outTimeVariation, 0)
        }

        worksheet.addRow([employee, date, inTime, outTime])
      }
    }
  }

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = 20
    }
  })

  // Save file
  const outputPath = path.join(process.cwd(), 'public', 'sample-attendance.xlsx')
  await workbook.xlsx.writeFile(outputPath)
  console.log(`Sample Excel file generated at: ${outputPath}`)
}

generateSampleExcel().catch(console.error)

