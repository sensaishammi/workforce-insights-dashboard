'use client'

interface Employee {
  id: string
  name: string
}

interface EmployeeSelectorProps {
  employees: Employee[]
  selectedEmployeeId: string | null
  onEmployeeChange: (employeeId: string) => void
}

export function EmployeeSelector({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
}: EmployeeSelectorProps) {
  if (employees.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No employees found. Please upload attendance data first.
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
        Employee
      </label>
      <select
        id="employee"
        value={selectedEmployeeId || ''}
        onChange={(e) => onEmployeeChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
      >
        <option value="">Select an employee</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name}
          </option>
        ))}
      </select>
    </div>
  )
}

