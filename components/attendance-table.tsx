interface DailyRecord {
  date: string
  day: string
  workedHours: number | null
  status: 'present' | 'leave' | 'sunday'
}

interface AttendanceTableProps {
  records: DailyRecord[]
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'leave':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'sunday':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatHours = (hours: number | null) => {
    if (hours === null) return '-'
    return `${hours.toFixed(2)}h`
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/60">
      <table className="min-w-full divide-y divide-slate-200/60">
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Day
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Worked Hours
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-slate-200/60">
          {records.map((record, index) => (
            <tr key={index} className="hover:bg-slate-50/80 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                {formatDate(record.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                {record.day}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                {formatHours(record.workedHours)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(record.status)} transition-all duration-200`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

