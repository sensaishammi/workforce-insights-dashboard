/**
 * Utility script to clear all data from the database
 * Run with: npx tsx scripts/clear-database.ts
 * 
 * WARNING: This will delete ALL data from the database!
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from the database!')
    console.log('Starting database cleanup...\n')

    // Delete in order to respect foreign key constraints
    console.log('Deleting attendance records...')
    const attendanceCount = await prisma.attendanceRecord.deleteMany({})
    console.log(`✓ Deleted ${attendanceCount.count} attendance records`)

    console.log('Deleting processed data...')
    const processedCount = await prisma.processedData.deleteMany({})
    console.log(`✓ Deleted ${processedCount.count} processed data records`)

    console.log('Deleting employees...')
    const employeeCount = await prisma.employee.deleteMany({})
    console.log(`✓ Deleted ${employeeCount.count} employees`)

    console.log('\n✅ Database cleared successfully!')
    console.log('You can now upload fresh data using the upload page.')
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()

