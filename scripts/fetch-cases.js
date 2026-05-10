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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1) })
}
