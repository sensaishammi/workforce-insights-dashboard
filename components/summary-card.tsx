interface SummaryCardProps {
  title: string
  value: string | number
  unit?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function SummaryCard({ title, value, unit, variant = 'default' }: SummaryCardProps) {
  const variantStyles = {
    default: 'border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md',
    success: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-green-50/60 backdrop-blur-sm shadow-sm hover:shadow-md',
    warning: 'border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 backdrop-blur-sm shadow-sm hover:shadow-md',
    danger: 'border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-red-50/60 backdrop-blur-sm shadow-sm hover:shadow-md',
  }

  const textColors = {
    default: 'text-slate-600',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-rose-700',
  }

  const valueColors = {
    default: 'text-slate-900',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    danger: 'text-rose-900',
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 ${variantStyles[variant]}`}>
      <h3 className={`text-sm font-medium mb-3 ${textColors[variant]}`}>{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${valueColors[variant]}`}>{value}</span>
        {unit && <span className={`text-sm font-medium ${textColors[variant]} opacity-70`}>{unit}</span>}
      </div>
    </div>
  )
}

