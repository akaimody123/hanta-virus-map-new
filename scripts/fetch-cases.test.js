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
    expect(result.last_case_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
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
