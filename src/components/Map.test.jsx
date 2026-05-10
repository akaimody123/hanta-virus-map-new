import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div data-testid="circle-marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}))

vi.mock('./MarkerPopup', () => ({
  MarkerPopup: ({ caseData }) => <div data-testid="marker-popup">{caseData.location}</div>,
}))

import { Map } from './Map'

const cases = [
  {
    id: '1',
    location: 'Montana, USA',
    lat: 46.87,
    lng: -110.36,
    count: 2,
    last_case_date: '2026-04-01',
    source: 'CDC',
    source_url: 'https://cdc.gov',
  },
  {
    id: '2',
    location: 'Bavaria, Germany',
    lat: 48.79,
    lng: 11.49,
    count: 8,
    last_case_date: '2025-09-22',
    source: 'HealthMap',
    source_url: 'https://healthmap.org',
  },
]

test('renders the map container', () => {
  render(<Map cases={cases} />)
  expect(screen.getByTestId('map-container')).toBeInTheDocument()
})

test('renders one circle marker per case', () => {
  render(<Map cases={cases} />)
  expect(screen.getAllByTestId('circle-marker')).toHaveLength(2)
})

test('renders popup content for each marker', () => {
  render(<Map cases={cases} />)
  expect(screen.getByText('Montana, USA')).toBeInTheDocument()
  expect(screen.getByText('Bavaria, Germany')).toBeInTheDocument()
})
