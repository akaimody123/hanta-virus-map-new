export function StatCards({ cases, now = new Date() }) {
  const currentYear = now.getFullYear().toString()
  const currentMonth = now.toISOString().slice(0, 7)

  const totalThisYear = cases
    .filter(c => c.last_case_date.startsWith(currentYear))
    .reduce((sum, c) => sum + c.count, 0)

  const thisMonth = cases
    .filter(c => c.last_case_date.startsWith(currentMonth))
    .reduce((sum, c) => sum + c.count, 0)

  const countries = new Set(
    cases.map(c => c.location.split(', ').at(-1))
  ).size

  const stats = [
    { label: `Cases ${currentYear}`, value: totalThisYear, color: '#dc2626' },
    { label: 'This Month', value: thisMonth, color: '#f59e0b' },
    { label: 'Countries', value: countries, color: '#6366f1' },
    { label: 'Fatality Rate', value: '36%', color: '#dc2626' },
  ]

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: '#fafafa' }}>
      {stats.map(stat => (
        <div
          key={stat.label}
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}
        >
          <div style={{ color: stat.color, fontSize: '22px', fontWeight: 800 }}>
            {stat.value}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
