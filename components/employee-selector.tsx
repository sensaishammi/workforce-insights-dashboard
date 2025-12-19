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
      <label htmlFor="employee" className="block text-sm font-semibold text-slate-700 mb-2">
        Employee
      </label>
      <select
        id="employee"
        value={selectedEmployeeId || ''}
        onChange={(e) => onEmployeeChange(e.target.value)}
        className="block w-full rounded-lg border-slate-300/60 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm px-4 py-2.5 border bg-white/80 backdrop-blur-sm text-slate-900 transition-all duration-200 hover:border-slate-400"
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

