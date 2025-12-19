import { NextResponse } from 'next/server'
import { getEmployees } from '@/actions/excel-processing'

export async function GET() {
  try {
    const result = await getEmployees()
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to fetch employees' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in employees API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
