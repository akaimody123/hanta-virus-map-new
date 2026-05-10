export function MarkerPopup({ caseData }) {
  const { location, count, last_case_date, source, source_url } = caseData
  return (
    <div style={{ minWidth: '160px' }}>
      <strong style={{ fontSize: '13px', color: '#111827' }}>{location}</strong>
      <div style={{ marginTop: '6px', fontSize: '12px', color: '#374151' }}>
        {count} case{count !== 1 ? 's' : ''} reported
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
        Last case: {last_case_date}
      </div>
      <a
        href={source_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '11px', color: '#2563eb', marginTop: '6px', display: 'block' }}
      >
        Source: {source}
      </a>
    </div>
  )
}
