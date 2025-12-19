interface SummaryCardProps {
  title: string
  value: string | number
  unit?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function SummaryCard({ title, value, unit, variant = 'default' }: SummaryCardProps) {
  const variantStyles = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  }

  return (
    <div className={`rounded-lg border p-6 ${variantStyles[variant]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  )
}

