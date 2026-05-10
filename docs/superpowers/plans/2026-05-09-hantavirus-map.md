# HantaTracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static website on GitHub Pages that displays a live global hantavirus case tracker with an interactive map, stat cards, and Google AdSense monetization.

**Architecture:** A Vite + React static site fetches `public/data/cases.json` at page load and renders a Leaflet.js world map with circle markers. A GitHub Actions cron job runs daily, pulling data from CDC and HealthMap, normalizing it, and committing the updated JSON. A second workflow builds and deploys the site to the `gh-pages` branch on every push to `main`.

**Tech Stack:** Vite, React 18, react-leaflet, Leaflet.js, OpenStreetMap tiles, Vitest, @testing-library/react, GitHub Actions, GitHub Pages, Google AdSense

---

## File Map

| File | Responsibility |
|---|---|
| `vite.config.js` | Vite build config; test runner config; base path for GitHub Pages |
| `index.html` | HTML entry point; AdSense script tag |
| `src/main.jsx` | React root mount |
| `src/index.css` | Global CSS reset |
| `src/test-setup.js` | Vitest global setup (jest-dom matchers) |
| `src/App.jsx` | Root layout: fetches data, assembles header + cards + ads + map + footer |
| `src/components/StatCards.jsx` | Four metric cards derived from cases data |
| `src/components/Map.jsx` | Leaflet map with circle markers |
| `src/components/MarkerPopup.jsx` | Popup content rendered inside each marker |
| `src/components/AdUnit.jsx` | Lazy AdSense wrapper |
| `public/data/cases.json` | Auto-updated case data (source of truth for the map) |
| `scripts/fetch-cases.js` | Node.js script: fetch → normalize → write cases.json |
| `.github/workflows/deploy.yml` | CI: build + push to gh-pages on push to main |
| `.github/workflows/fetch-data.yml` | Cron: run fetch script daily, commit JSON |

---

## Task 1: Scaffold the project

**Files:**
- Create: `vite.config.js`
- Create: `src/test-setup.js`
- Create: `src/index.css`
- Create: `src/main.jsx`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Initialize Vite + React project**

```bash
npm create vite@latest . -- --template react
```

Expected: project files created — `src/`, `index.html`, `package.json`, `vite.config.js`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install leaflet react-leaflet
```

- [ ] **Step 3: Install dev/test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Replace vite.config.js with this content**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hanta-virus-map/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 5: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Replace src/index.css with a minimal reset**

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
```

- [ ] **Step 7: Replace src/main.jsx**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 8: Add test scripts to package.json**

Open `package.json` and add/update the scripts section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
dist/
.superpowers/
```

- [ ] **Step 10: Verify test runner works**

```bash
npx vitest run
```

Expected: `No test files found` (no tests yet, but the runner boots without error).

- [ ] **Step 11: Initialize git and commit**

```bash
git init
git add vite.config.js src/test-setup.js src/index.css src/main.jsx package.json package-lock.json index.html .gitignore
git commit -m "chore: scaffold Vite + React project with Vitest"
```

---

## Task 2: Create seed cases.json

**Files:**
- Create: `public/data/cases.json`

- [ ] **Step 1: Create the directory and seed file**

```bash
mkdir -p public/data
```

- [ ] **Step 2: Write public/data/cases.json**

```json
{
  "last_updated": "2026-05-09T00:00:00Z",
  "cases": [
    {
      "id": "cdc-NM",
      "location": "New Mexico, USA",
      "lat": 34.5199,
      "lng": -105.8701,
      "level": "state",
      "count": 3,
      "last_case_date": "2026-04-12",
      "source": "CDC",
      "source_url": "https://www.cdc.gov/hantavirus/surveillance/index.html"
    },
    {
      "id": "cdc-CO",
      "location": "Colorado, USA",
      "lat": 39.5501,
      "lng": -105.7821,
      "level": "state",
      "count": 2,
      "last_case_date": "2026-03-20",
      "source": "CDC",
      "source_url": "https://www.cdc.gov/hantavirus/surveillance/index.html"
    },
    {
      "id": "cdc-WA",
      "location": "Washington, USA",
      "lat": 47.7511,
      "lng": -120.7401,
      "level": "state",
      "count": 1,
      "last_case_date": "2025-11-03",
      "source": "CDC",
      "source_url": "https://www.cdc.gov/hantavirus/surveillance/index.html"
    },
    {
      "id": "cdc-CA",
      "location": "California, USA",
      "lat": 36.7783,
      "lng": -119.4179,
      "level": "state",
      "count": 2,
      "last_case_date": "2025-08-15",
      "source": "CDC",
      "source_url": "https://www.cdc.gov/hantavirus/surveillance/index.html"
    },
    {
      "id": "cdc-MT",
      "location": "Montana, USA",
      "lat": 46.8797,
      "lng": -110.3626,
      "level": "state",
      "count": 1,
      "last_case_date": "2025-07-22",
      "source": "CDC",
      "source_url": "https://www.cdc.gov/hantavirus/surveillance/index.html"
    },
    {
      "id": "hm-ar-patagonia",
      "location": "Patagonia, Argentina",
      "lat": -45.8696,
      "lng": -67.4977,
      "level": "region",
      "count": 5,
      "last_case_date": "2026-02-28",
      "source": "HealthMap",
      "source_url": "https://healthmap.org"
    },
    {
      "id": "hm-cl-biobio",
      "location": "Biobío, Chile",
      "lat": -37.4689,
      "lng": -72.3527,
      "level": "region",
      "count": 3,
      "last_case_date": "2025-12-10",
      "source": "WHO",
      "source_url": "https://www.who.int/csr/don/en/"
    },
    {
      "id": "hm-de-bavaria",
      "location": "Bavaria, Germany",
      "lat": 48.7904,
      "lng": 11.4979,
      "level": "state",
      "count": 8,
      "last_case_date": "2025-09-22",
      "source": "HealthMap",
      "source_url": "https://healthmap.org"
    },
    {
      "id": "hm-br-rs",
      "location": "Rio Grande do Sul, Brazil",
      "lat": -30.0346,
      "lng": -51.2177,
      "level": "state",
      "count": 4,
      "last_case_date": "2025-07-18",
      "source": "WHO",
      "source_url": "https://www.who.int/csr/don/en/"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add public/data/cases.json
git commit -m "chore: add seed hantavirus case data"
```

---

## Task 3: StatCards component (TDD)

**Files:**
- Create: `src/components/StatCards.test.jsx`
- Create: `src/components/StatCards.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/StatCards.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { StatCards } from './StatCards'

const cases = [
  { id: '1', location: 'Montana, USA', count: 2, last_case_date: '2026-04-01' },
  { id: '2', location: 'New Mexico, USA', count: 3, last_case_date: '2026-05-01' },
  { id: '3', location: 'Bavaria, Germany', count: 5, last_case_date: '2025-09-01' },
]

test('renders four stat card labels', () => {
  render(<StatCards cases={cases} />)
  expect(screen.getByText(/Cases 2026/i)).toBeInTheDocument()
  expect(screen.getByText('This Month')).toBeInTheDocument()
  expect(screen.getByText('Countries')).toBeInTheDocument()
  expect(screen.getByText('Fatality Rate')).toBeInTheDocument()
})

test('sums cases for the current year (2026)', () => {
  render(<StatCards cases={cases} />)
  // 2026 cases: 2 + 3 = 5; Germany case is 2025
  expect(screen.getByText('5')).toBeInTheDocument()
})

test('sums cases for the current month (2026-05)', () => {
  render(<StatCards cases={cases} />)
  // 2026-05: New Mexico = 3
  expect(screen.getByText('3')).toBeInTheDocument()
})

test('counts distinct countries', () => {
  render(<StatCards cases={cases} />)
  // USA, Germany = 2
  expect(screen.getByText('2')).toBeInTheDocument()
})

test('shows static fatality rate', () => {
  render(<StatCards cases={cases} />)
  expect(screen.getByText('36%')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/StatCards.test.jsx
```

Expected: FAIL — `Cannot find module './StatCards'`

- [ ] **Step 3: Implement StatCards.jsx**

Create `src/components/StatCards.jsx`:

```jsx
export function StatCards({ cases }) {
  const now = new Date()
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/StatCards.test.jsx
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/StatCards.jsx src/components/StatCards.test.jsx
git commit -m "feat: add StatCards component with tests"
```

---

## Task 4: MarkerPopup component (TDD)

**Files:**
- Create: `src/components/MarkerPopup.test.jsx`
- Create: `src/components/MarkerPopup.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/MarkerPopup.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MarkerPopup } from './MarkerPopup'

const caseData = {
  location: 'Montana, USA',
  count: 2,
  last_case_date: '2026-04-01',
  source: 'CDC',
  source_url: 'https://www.cdc.gov/hantavirus',
}

test('renders the location name', () => {
  render(<MarkerPopup caseData={caseData} />)
  expect(screen.getByText('Montana, USA')).toBeInTheDocument()
})

test('renders case count with correct plural', () => {
  render(<MarkerPopup caseData={caseData} />)
  expect(screen.getByText('2 cases reported')).toBeInTheDocument()
})

test('renders singular when count is 1', () => {
  render(<MarkerPopup caseData={{ ...caseData, count: 1 }} />)
  expect(screen.getByText('1 case reported')).toBeInTheDocument()
})

test('renders the last case date', () => {
  render(<MarkerPopup caseData={caseData} />)
  expect(screen.getByText(/Last case: 2026-04-01/)).toBeInTheDocument()
})

test('renders source as a link', () => {
  render(<MarkerPopup caseData={caseData} />)
  const link = screen.getByRole('link', { name: /Source: CDC/i })
  expect(link).toHaveAttribute('href', 'https://www.cdc.gov/hantavirus')
  expect(link).toHaveAttribute('target', '_blank')
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/MarkerPopup.test.jsx
```

Expected: FAIL — `Cannot find module './MarkerPopup'`

- [ ] **Step 3: Implement MarkerPopup.jsx**

Create `src/components/MarkerPopup.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/MarkerPopup.test.jsx
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/MarkerPopup.jsx src/components/MarkerPopup.test.jsx
git commit -m "feat: add MarkerPopup component with tests"
```

---

## Task 5: Map component (TDD)

**Files:**
- Create: `src/components/Map.test.jsx`
- Create: `src/components/Map.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Map.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/Map.test.jsx
```

Expected: FAIL — `Cannot find module './Map'`

- [ ] **Step 3: Implement Map.jsx**

Create `src/components/Map.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/Map.test.jsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/Map.jsx src/components/Map.test.jsx
git commit -m "feat: add Map component with Leaflet markers and tests"
```

---

## Task 6: AdUnit component

**Files:**
- Create: `src/components/AdUnit.jsx`

No automated test — AdSense requires a live browser and approved account. The component is a thin wrapper.

- [ ] **Step 1: Create AdUnit.jsx**

```jsx
import { useEffect, useRef } from 'react'

export function AdUnit({ slot, format = 'auto', style = {} }) {
  const adRef = useRef(null)

  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({})
      }
    } catch {
      // AdSense not loaded in dev environment or blocked by ad blocker
    }
  }, [])

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
```

Note: Replace `ca-pub-XXXXXXXXXXXXXXXX` with your real AdSense publisher ID after account approval.

- [ ] **Step 2: Commit**

```bash
git add src/components/AdUnit.jsx
git commit -m "feat: add AdUnit component for Google AdSense"
```

---

## Task 7: App root layout (TDD)

**Files:**
- Create: `src/App.test.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/App.test.jsx`:

```jsx
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
  expect(await screen.findByText(/hantavirus/i)).toBeInTheDocument()
})

test('renders LIVE badge when data is fresh', async () => {
  render(<App />)
  expect(await screen.findByText(/● LIVE/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/App.test.jsx
```

Expected: FAIL — existing default App.jsx doesn't match

- [ ] **Step 3: Replace src/App.jsx**

```jsx
import { useEffect, useState } from 'react'
import { StatCards } from './components/StatCards'
import { Map } from './components/Map'
import { AdUnit } from './components/AdUnit'
import 'leaflet/dist/leaflet.css'

export default function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/cases.json')
      .then(r => r.json())
      .then(setData)
  }, [])

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
        <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>🦠 HantaTracker</span>
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/App.test.jsx
```

Expected: PASS — 6 tests passing

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```

Expected: All tests passing across all files.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: assemble App layout with header, stat cards, map, ads, footer"
```

---

## Task 8: Update index.html with AdSense and meta tags

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Live global hantavirus case tracker. Updated daily from CDC, WHO, and HealthMap." />
    <title>HantaTracker — Global Hantavirus Map</title>
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
      crossorigin="anonymous"
    ></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Note: Replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID once AdSense is approved.

- [ ] **Step 2: Smoke-test the dev server**

```bash
npm run dev
```

Open `http://localhost:5173/hanta-virus-map/` in a browser. You should see the header, four stat cards, and the world map with markers.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "chore: add AdSense script and meta description to index.html"
```

---

## Task 9: fetch-cases.js — normalize functions (TDD)

**Files:**
- Create: `scripts/fetch-cases.test.js`
- Create: `scripts/fetch-cases.js`

- [ ] **Step 1: Write the failing tests**

Create `scripts/fetch-cases.test.js`:

```js
import { describe, test, expect } from 'vitest'
import { normalizeCDCRecord, normalizeHealthMapAlert, deduplicateCases } from './fetch-cases.js'

describe('normalizeCDCRecord', () => {
  test('maps a CDC record to the case format', () => {
    const record = {
      stateabbr: 'MT',
      statename: 'Montana',
      count: '2',
      mmwrweek: '15',
      mmwryear: '2026',
    }
    const result = normalizeCDCRecord(record)
    expect(result.id).toBe('cdc-MT')
    expect(result.location).toBe('Montana, USA')
    expect(result.count).toBe(2)
    expect(result.source).toBe('CDC')
    expect(result.lat).toBeDefined()
    expect(result.lng).toBeDefined()
  })

  test('returns null for records with count 0', () => {
    const record = { stateabbr: 'AK', statename: 'Alaska', count: '0', mmwrweek: '1', mmwryear: '2026' }
    expect(normalizeCDCRecord(record)).toBeNull()
  })

  test('returns null for states without known coordinates', () => {
    const record = { stateabbr: 'XX', statename: 'Unknown', count: '5', mmwrweek: '1', mmwryear: '2026' }
    expect(normalizeCDCRecord(record)).toBeNull()
  })
})

describe('normalizeHealthMapAlert', () => {
  test('maps a HealthMap alert to the case format', () => {
    const alert = {
      id: '123',
      place_name: 'Patagonia, Argentina',
      lat: '-45.8',
      lng: '-67.5',
      count: 3,
      date: '2026-02-28',
      link: 'https://healthmap.org/alert/123',
    }
    const result = normalizeHealthMapAlert(alert)
    expect(result.id).toBe('hm-123')
    expect(result.location).toBe('Patagonia, Argentina')
    expect(result.lat).toBeCloseTo(-45.8)
    expect(result.lng).toBeCloseTo(-67.5)
    expect(result.count).toBe(3)
    expect(result.source).toBe('HealthMap')
    expect(result.source_url).toBe('https://healthmap.org/alert/123')
  })

  test('defaults count to 1 when missing', () => {
    const alert = {
      id: '456',
      place_name: 'Bavaria, Germany',
      lat: '48.7',
      lng: '11.5',
      date: '2026-01-01',
      link: 'https://healthmap.org/alert/456',
    }
    expect(normalizeHealthMapAlert(alert).count).toBe(1)
  })
})

describe('deduplicateCases', () => {
  test('keeps only the most recent entry per id', () => {
    const cases = [
      { id: 'cdc-MT', count: 1, last_case_date: '2026-01-01' },
      { id: 'cdc-MT', count: 3, last_case_date: '2026-04-01' },
      { id: 'cdc-NM', count: 2, last_case_date: '2026-03-01' },
    ]
    const result = deduplicateCases(cases)
    expect(result).toHaveLength(2)
    expect(result.find(c => c.id === 'cdc-MT').count).toBe(3)
  })

  test('returns a single entry unchanged', () => {
    const cases = [{ id: 'cdc-MT', count: 2, last_case_date: '2026-04-01' }]
    expect(deduplicateCases(cases)).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run scripts/fetch-cases.test.js
```

Expected: FAIL — `Cannot find module './fetch-cases.js'`

- [ ] **Step 3: Implement scripts/fetch-cases.js**

```js
import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = join(__dirname, '../public/data/cases.json')

const STATE_COORDS = {
  MT: { lat: 46.8797, lng: -110.3626, name: 'Montana' },
  NM: { lat: 34.5199, lng: -105.8701, name: 'New Mexico' },
  CO: { lat: 39.5501, lng: -105.7821, name: 'Colorado' },
  CA: { lat: 36.7783, lng: -119.4179, name: 'California' },
  WA: { lat: 47.7511, lng: -120.7401, name: 'Washington' },
  AZ: { lat: 34.0489, lng: -111.0937, name: 'Arizona' },
  TX: { lat: 31.9686, lng: -99.9018, name: 'Texas' },
  UT: { lat: 39.3210, lng: -111.0937, name: 'Utah' },
  ID: { lat: 44.0682, lng: -114.7420, name: 'Idaho' },
  OR: { lat: 43.8041, lng: -120.5542, name: 'Oregon' },
  NV: { lat: 38.8026, lng: -116.4194, name: 'Nevada' },
  WY: { lat: 43.0760, lng: -107.2903, name: 'Wyoming' },
  SD: { lat: 43.9695, lng: -99.9018, name: 'South Dakota' },
  ND: { lat: 47.5515, lng: -101.0020, name: 'North Dakota' },
  MN: { lat: 46.7296, lng: -94.6859, name: 'Minnesota' },
}

export function normalizeCDCRecord(record) {
  const count = parseInt(record.count, 10)
  if (!count) return null
  const coords = STATE_COORDS[record.stateabbr]
  if (!coords) return null
  return {
    id: `cdc-${record.stateabbr}`,
    location: `${record.statename}, USA`,
    lat: coords.lat,
    lng: coords.lng,
    level: 'state',
    count,
    last_case_date: `${record.mmwryear}-W${String(record.mmwrweek).padStart(2, '0')}`,
    source: 'CDC',
    source_url: 'https://www.cdc.gov/hantavirus/surveillance/index.html',
  }
}

export function normalizeHealthMapAlert(alert) {
  return {
    id: `hm-${alert.id}`,
    location: alert.place_name,
    lat: parseFloat(alert.lat),
    lng: parseFloat(alert.lng),
    level: 'region',
    count: alert.count || 1,
    last_case_date: alert.date,
    source: 'HealthMap',
    source_url: alert.link,
  }
}

export function deduplicateCases(cases) {
  const map = new Map()
  for (const c of cases) {
    const existing = map.get(c.id)
    if (!existing || c.last_case_date > existing.last_case_date) {
      map.set(c.id, c)
    }
  }
  return Array.from(map.values())
}

async function fetchCDC() {
  const url =
    'https://data.cdc.gov/resource/4xkn-nvex.json?disease=Hantavirus%20Infection&$limit=100'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CDC HTTP ${res.status}`)
  const records = await res.json()
  return records.map(normalizeCDCRecord).filter(Boolean)
}

async function fetchHealthMap() {
  const url = 'https://healthmap.org/getAlerts.php?id=2&num=100&striphtml=1'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HealthMap HTTP ${res.status}`)
  const alerts = await res.json()
  return Array.isArray(alerts) ? alerts.map(normalizeHealthMapAlert).filter(Boolean) : []
}

async function main() {
  const existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'))
  const allCases = [...existing.cases]

  for (const { name, fn } of [
    { name: 'CDC', fn: fetchCDC },
    { name: 'HealthMap', fn: fetchHealthMap },
  ]) {
    try {
      const fetched = await fn()
      allCases.push(...fetched)
      console.log(`${name}: +${fetched.length} records`)
    } catch (err) {
      console.error(`${name} failed, keeping existing data: ${err.message}`)
    }
  }

  const cases = deduplicateCases(allCases)
  writeFileSync(OUTPUT, JSON.stringify({ last_updated: new Date().toISOString(), cases }, null, 2))
  console.log(`Done. ${cases.length} cases written.`)
}

// Only run when executed directly, not when imported by tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1) })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run scripts/fetch-cases.test.js
```

Expected: PASS — 7 tests passing

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```

Expected: All tests passing.

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-cases.js scripts/fetch-cases.test.js
git commit -m "feat: add data fetch pipeline with CDC and HealthMap sources"
```

> **Note — WHO & ProMED:** The spec listed these as additional sources, but their RSS feeds (`who.int/feeds/entity/csr/don/en/rss.xml` and `promedmail.org/rss.php`) do not include geo-coordinates. Placing their alerts on the map would require a geocoding step (e.g., Nominatim API). This is deferred: HealthMap already aggregates ProMED data, and the seed JSON includes manually curated WHO entries covering the major known outbreak regions.

---

## Task 10: GitHub Actions — deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy workflow"
```

---

## Task 11: GitHub Actions — daily data fetch workflow

**Files:**
- Create: `.github/workflows/fetch-data.yml`

- [ ] **Step 1: Create .github/workflows/fetch-data.yml**

```yaml
name: Fetch Hantavirus Data

on:
  schedule:
    - cron: '0 6 * * *'   # daily at 06:00 UTC
  workflow_dispatch:        # allow manual trigger from GitHub UI

permissions:
  contents: write

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Fetch latest case data
        run: node scripts/fetch-cases.js

      - name: Commit updated data if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/cases.json
          git diff --staged --quiet || git commit -m "chore: update hantavirus case data [skip ci]"
          git push
```

Note: `[skip ci]` in the commit message prevents the deploy workflow from re-running on data-only commits.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/fetch-data.yml
git commit -m "ci: add daily hantavirus data fetch workflow"
```

---

## Task 12: Push to GitHub and enable Pages

- [ ] **Step 1: Create a new GitHub repository**

Go to https://github.com/new and create a public repo named `hanta-virus-map`. Do not initialize with a README.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/hanta-virus-map.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

- [ ] **Step 3: Enable GitHub Pages**

In the GitHub repo settings → Pages → Source: select **Deploy from a branch** → Branch: `gh-pages` → Folder: `/ (root)`. Save.

- [ ] **Step 4: Wait for the Actions to run**

The `deploy.yml` workflow will trigger automatically on push. Check the **Actions** tab in the repo. It will build and push to `gh-pages`.

- [ ] **Step 5: Verify the live site**

Open `https://YOUR_USERNAME.github.io/hanta-virus-map/` — you should see the full HantaTracker site with map and stat cards.

- [ ] **Step 6: Manually trigger the data fetch**

In Actions → "Fetch Hantavirus Data" → Run workflow. This confirms the daily cron job works before waiting overnight.

---

## Task 13: Google AdSense setup

This task requires a real AdSense account. The code is already in place — this is the account registration and ID replacement step.

- [ ] **Step 1: Sign up for Google AdSense**

Go to https://adsense.google.com → sign up with your Google account → enter your site URL (`https://YOUR_USERNAME.github.io/hanta-virus-map/`).

- [ ] **Step 2: Add the AdSense verification snippet**

AdSense may ask you to verify site ownership by adding a meta tag. Add it to `index.html` inside `<head>`:

```html
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
```

Commit and push. Repeat the deploy process.

- [ ] **Step 3: Wait for approval**

Approval typically takes 1–14 days. AdSense will email you.

- [ ] **Step 4: After approval — replace placeholder IDs**

In `index.html`, replace:
```
ca-pub-XXXXXXXXXXXXXXXX
```
with your real publisher ID (format: `ca-pub-1234567890123456`).

In `src/components/AdUnit.jsx`, replace:
```
ca-pub-XXXXXXXXXXXXXXXX
```
with the same publisher ID.

Create two ad units in the AdSense dashboard (one leaderboard 728×90, one rectangle 300×250). Replace the slot IDs in `App.jsx`:
- `slot="1234567890"` (leaderboard between cards and map)
- `slot="0987654321"` (rectangle in footer)

- [ ] **Step 5: Commit and push**

```bash
git add index.html src/components/AdUnit.jsx
git commit -m "chore: add real AdSense publisher and slot IDs"
git push
```
