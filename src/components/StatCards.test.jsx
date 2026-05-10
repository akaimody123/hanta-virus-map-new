import { render, screen } from '@testing-library/react'
import { StatCards } from './StatCards'

const NOW = new Date('2026-05-10T12:00:00Z')

const cases = [
  { id: '1', location: 'Montana, USA', count: 2, last_case_date: '2026-04-01' },
  { id: '2', location: 'New Mexico, USA', count: 3, last_case_date: '2026-05-01' },
  { id: '3', location: 'Bavaria, Germany', count: 5, last_case_date: '2025-09-01' },
]

test('renders four stat card labels', () => {
  render(<StatCards cases={cases} now={NOW} />)
  expect(screen.getByText(/Cases 2026/i)).toBeInTheDocument()
  expect(screen.getByText('This Month')).toBeInTheDocument()
  expect(screen.getByText('Countries')).toBeInTheDocument()
  expect(screen.getByText('Fatality Rate')).toBeInTheDocument()
})

test('sums cases for the current year (2026)', () => {
  render(<StatCards cases={cases} now={NOW} />)
  // 2026 cases: 2 + 3 = 5; Germany case is 2025
  expect(screen.getByText('5')).toBeInTheDocument()
})

test('sums cases for the current month (2026-05)', () => {
  render(<StatCards cases={cases} now={NOW} />)
  // 2026-05: New Mexico = 3
  expect(screen.getByText('3')).toBeInTheDocument()
})

test('counts distinct countries', () => {
  render(<StatCards cases={cases} now={NOW} />)
  // USA, Germany = 2
  expect(screen.getByText('2')).toBeInTheDocument()
})

test('shows static fatality rate', () => {
  render(<StatCards cases={cases} now={NOW} />)
  expect(screen.getByText('36%')).toBeInTheDocument()
})
