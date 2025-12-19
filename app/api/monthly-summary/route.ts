import { NextResponse } from 'next/server'
import { getMonthlySummary } from '@/actions/excel-processing'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const result = await getMonthlySummary(
      employeeId,
      parseInt(month, 10),
      parseInt(year, 10)
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to fetch monthly summary' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in monthly summary API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
