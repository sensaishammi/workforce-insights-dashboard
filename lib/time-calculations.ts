/**
 * Business logic for time calculations, leave tracking, and productivity metrics
 */

export interface DayInfo {
  day: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isWorkingDay: boolean
  expectedHours: number
}

/**
 * Get day information for a given date
 */
export function getDayInfo(date: Date): DayInfo {
  const day = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (day === 0) {
    // Sunday - off day
    return { day, isWorkingDay: false, expectedHours: 0 }
  } else if (day === 6) {
    // Saturday - 4 hours (10:00 AM - 2:00 PM)
    return { day, isWorkingDay: true, expectedHours: 4 }
  } else {
    // Monday to Friday - 8.5 hours (10:00 AM - 6:30 PM)
    return { day, isWorkingDay: true, expectedHours: 8.5 }
  }
}

/**
 * Calculate worked hours from in-time and out-time
 * Returns null if times are invalid or missing
 */
export function calculateWorkedHours(
  inTime: Date | null,
  outTime: Date | null
): number | null {
  if (!inTime || !outTime) {
    return null
  }

  const diffMs = outTime.getTime() - inTime.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  // Validate: worked hours should be positive and reasonable (max 12 hours)
  if (diffHours < 0 || diffHours > 12) {
    return null
  }

  return Math.round(diffHours * 100) / 100 // Round to 2 decimal places
}

/**
 * Determine attendance status for a given date
 */
export function getAttendanceStatus(
  date: Date,
  workedHours: number | null
): 'present' | 'leave' | 'sunday' {
  const dayInfo = getDayInfo(date)

  if (!dayInfo.isWorkingDay) {
    return 'sunday'
  }

  if (workedHours === null || workedHours === 0) {
    return 'leave'
  }

  return 'present'
}

/**
 * Calculate expected working hours for a given month
 */
export function calculateExpectedHoursForMonth(year: number, month: number): number {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  
  let totalHours = 0
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day)
    const dayInfo = getDayInfo(date)
    totalHours += dayInfo.expectedHours
  }
  
  return Math.round(totalHours * 100) / 100
}

/**
 * Calculate leaves used in a month
 * Each missing attendance on a working day counts as a leave
 */
export function calculateLeavesUsed(
  year: number,
  month: number,
  attendanceRecords: Array<{ date: Date; status: string }>
): number {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  
  let leavesUsed = 0
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day)
    const dayInfo = getDayInfo(date)
    
    if (dayInfo.isWorkingDay) {
      const record = attendanceRecords.find(
        (r) =>
          r.date.getDate() === day &&
          r.date.getMonth() === month - 1 &&
          r.date.getFullYear() === year
      )
      
      if (!record || record.status === 'leave') {
        leavesUsed++
      }
    }
  }
  
  return leavesUsed
}

/**
 * Calculate productivity percentage
 */
export function calculateProductivity(
  actualWorkedHours: number,
  expectedWorkingHours: number
): number {
  if (expectedWorkingHours === 0) {
    return 0
  }
  
  const productivity = (actualWorkedHours / expectedWorkingHours) * 100
  return Math.round(productivity * 100) / 100 // Round to 2 decimal places
}

/**
 * Parse date string from Excel (handles various formats)
 */
export function parseExcelDate(dateValue: string | number | Date): Date | null {
  try {
    if (dateValue instanceof Date) {
      return dateValue
    }
    
    if (typeof dateValue === 'number') {
      // Excel date serial number (days since Jan 1, 1900)
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000)
      return date
    }
    
    if (typeof dateValue === 'string') {
      // Try parsing as ISO string or common date formats
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Parse time string from Excel
 */
export function parseExcelTime(timeValue: string | number | Date): Date | null {
  try {
    if (timeValue instanceof Date) {
      return timeValue
    }
    
    if (typeof timeValue === 'number') {
      // Excel time as fraction of day (0.5 = noon)
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + timeValue * 24 * 60 * 60 * 1000)
      return date
    }
    
    if (typeof timeValue === 'string') {
      // Try parsing time strings like "10:00", "10:00 AM", etc.
      const timeStr = timeValue.trim()
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i)
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10)
        const minutes = parseInt(timeMatch[2], 10)
        const ampm = timeMatch[3]?.toUpperCase()
        
        if (ampm === 'PM' && hours !== 12) {
          hours += 12
        } else if (ampm === 'AM' && hours === 12) {
          hours = 0
        }
        
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        return date
      }
      
      // Try parsing as ISO string
      const date = new Date(timeValue)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Combine date and time into a single DateTime
 */
export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date)
  combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds())
  return combined
}

