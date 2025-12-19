/**
 * Utility script to fix employeeId conflicts in the database
 * Run with: npx tsx scripts/fix-employee-ids.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEmployeeIds() {
  try {
    console.log('Checking for employees with null or empty employeeId...')
    
    // Find all employees
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        employeeId: true,
      },
    })

    console.log(`Found ${allEmployees.length} total employees`)

    // Find employees with null or empty employeeId
    const employeesWithNullId = allEmployees.filter(
      (emp) => emp.employeeId === null || emp.employeeId === ''
    )

    console.log(`Found ${employeesWithNullId.length} employees with null or empty employeeId`)

    if (employeesWithNullId.length === 0) {
      console.log('No employees need fixing!')
      return
    }

    // Fix each employee by generating a unique employeeId
    let fixedCount = 0
    for (const employee of employeesWithNullId) {
      const uniqueEmployeeId = `EMP_${employee.name.replace(/\s+/g, '_').toUpperCase()}_${employee.id.substring(0, 8)}`
      
      try {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { employeeId: uniqueEmployeeId },
        })
        console.log(`✓ Fixed employee "${employee.name}" with ID: ${uniqueEmployeeId}`)
        fixedCount++
      } catch (error: any) {
        if (error?.code === 'P2002') {
          // If unique constraint still fails, try with a more unique ID
          const moreUniqueId = `${uniqueEmployeeId}_${Date.now()}`
          await prisma.employee.update({
            where: { id: employee.id },
            data: { employeeId: moreUniqueId },
          })
          console.log(`✓ Fixed employee "${employee.name}" with ID: ${moreUniqueId}`)
          fixedCount++
        } else {
          console.error(`✗ Failed to fix employee "${employee.name}":`, error.message)
        }
      }
    }

    console.log(`\nFixed ${fixedCount} out of ${employeesWithNullId.length} employees`)
    console.log('Done!')
  } catch (error) {
    console.error('Error fixing employee IDs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmployeeIds()

