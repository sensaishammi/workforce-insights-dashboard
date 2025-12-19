/**
 * Generate realistic sample CSV file for employee attendance
 * Run with: npx tsx scripts/generate-sample-csv.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const employees = [
  'John Smith',
  'Sarah Johnson',
  'Michael Chen',
  'Emily Davis'
]

const years = [2023, 2024, 2025]
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function getDayOfWeek(date: Date): number {
  return date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function generateAttendanceRecord(employee: string, date: Date): string[] {
  const dayOfWeek = getDayOfWeek(date)
  const day = date.getDate()
  const month = date.getMonth() + 1
  
  // Sunday - no attendance
  if (dayOfWeek === 0) {
    return [employee, formatDate(date), '', '']
  }
  
  // Saturday - half day (50% chance of attendance)
  if (dayOfWeek === 6) {
    if (Math.random() < 0.5) {
      // Half day: 10:00 AM to 2:00 PM
      return [employee, formatDate(date), '10:00', '14:00']
    } else {
      // Leave on Saturday
      return [employee, formatDate(date), '', '']
    }
  }
  
  // Monday to Friday - working days
  // 5% chance of leave (missing times)
  if (Math.random() < 0.05) {
    return [employee, formatDate(date), '', '']
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
  
  return [
    employee,
    formatDate(date),
    formatTime(inHour, inMinute),
    formatTime(outHour, outMinute)
  ]
}

function generateCSV(): string {
  const rows: string[] = []
  
  // Header
  rows.push('Employee Name,Date,In-Time,Out-Time')
  
  // Generate data for each employee and year
  for (const employee of employees) {
    for (const year of years) {
      for (const month of months) {
        const daysInMonth = new Date(year, month, 0).getDate()
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day)
          const record = generateAttendanceRecord(employee, date)
          rows.push(record.join(','))
        }
      }
    }
  }
  
  return rows.join('\n')
}

// Generate and save CSV
const csvContent = generateCSV()
const outputPath = path.join(process.cwd(), 'public', 'sample-attendance.csv')

fs.writeFileSync(outputPath, csvContent, 'utf-8')

console.log(`✅ Generated sample CSV file: ${outputPath}`)
console.log(`📊 Total records: ${csvContent.split('\n').length - 1} (excluding header)`)
console.log(`👥 Employees: ${employees.length}`)
console.log(`📅 Years: ${years.join(', ')}`)

