import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { MarkerPopup } from './MarkerPopup'

function markerColor(lastCaseDate) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return new Date(lastCaseDate) > sixMonthsAgo ? '#dc2626' : '#f59e0b'
}

function markerRadius(count) {
  return Math.max(5, Math.min(20, count * 3))
}

export function Map({ cases }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {cases.map(c => (
        <CircleMarker
          key={c.id}
          center={[c.lat, c.lng]}
          radius={markerRadius(c.count)}
          pathOptions={{
            color: markerColor(c.last_case_date),
            fillColor: markerColor(c.last_case_date),
            fillOpacity: 0.6,
          }}
        >
          <Popup>
            <MarkerPopup caseData={c} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
