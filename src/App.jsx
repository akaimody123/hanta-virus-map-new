import { useEffect, useState } from 'react'
import { StatCards } from './components/StatCards'
import { Map } from './components/Map'
import { AdUnit } from './components/AdUnit'
import 'leaflet/dist/leaflet.css'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/cases.json')
      .then(r => r.json())
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#dc2626', fontFamily: 'system-ui, sans-serif' }}>
        Failed to load data. Please try refreshing.
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontFamily: 'system-ui, sans-serif' }}>
        Loading...
      </div>
    )
  }

  const ageMs = Date.now() - new Date(data.last_updated).getTime()
  const isStale = ageMs > 7 * 24 * 60 * 60 * 1000
  const badge = isStale
    ? { color: '#9ca3af', label: '● STALE' }
    : { color: '#16a34a', label: '● LIVE' }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
          <span aria-hidden="true">🦠 </span>HantaTracker
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Updated {new Date(data.last_updated).toLocaleDateString()}
          </span>
          <span style={{ fontSize: '11px', color: badge.color, fontWeight: 600 }}>{badge.label}</span>
        </div>
      </div>

      {/* Stat cards */}
      <StatCards cases={data.cases} />

      {/* Ad: leaderboard between cards and map */}
      <div style={{ padding: '0 16px' }}>
        <AdUnit slot="1234567890" style={{ height: '90px' }} />
      </div>

      {/* Map */}
      <Map cases={data.cases} />

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        padding: '20px 16px',
        borderTop: '1px solid #f3f4f6',
        background: '#fafafa',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
            What is Hantavirus?
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Hantavirus is a rare but serious illness spread through contact with infected rodents or their droppings.
            Early symptoms resemble flu; severe cases can cause life-threatening lung or kidney failure.{' '}
            <a href="https://www.cdc.gov/hantavirus" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>CDC</a>
            {' · '}
            <a href="https://www.who.int/news-room/fact-sheets/detail/hantavirus-disease" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>WHO</a>
          </p>
        </div>
        {/* Ad: rectangle in footer */}
        <AdUnit slot="0987654321" style={{ width: '300px', height: '250px', flexShrink: 0 }} />
      </div>
    </div>
  )
}
