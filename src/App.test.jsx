import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('./components/Map', () => ({
  Map: () => <div data-testid="map" />,
}))
vi.mock('./components/AdUnit', () => ({
  AdUnit: () => <div data-testid="ad-unit" />,
}))

import App from './App'

const mockData = {
  last_updated: '2026-05-09T00:00:00Z',
  cases: [
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
  ],
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
})

test('renders error message when fetch fails', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
  render(<App />)
  expect(await screen.findByText(/Failed to load data/i)).toBeInTheDocument()
})

test('renders site title', async () => {
  render(<App />)
  expect(await screen.findByText('HantaTracker')).toBeInTheDocument()
})

test('renders last updated date after data loads', async () => {
  render(<App />)
  expect(await screen.findByText(/Updated/i)).toBeInTheDocument()
})

test('renders the map', async () => {
  render(<App />)
  expect(await screen.findByTestId('map')).toBeInTheDocument()
})

test('renders two ad units', async () => {
  render(<App />)
  const ads = await screen.findAllByTestId('ad-unit')
  expect(ads).toHaveLength(2)
})

test('renders hantavirus footer blurb', async () => {
  render(<App />)
  expect(await screen.findByText(/spread through contact/i)).toBeInTheDocument()
})

test('renders LIVE badge when data is fresh', async () => {
  render(<App />)
  expect(await screen.findByText(/● LIVE/)).toBeInTheDocument()
})
