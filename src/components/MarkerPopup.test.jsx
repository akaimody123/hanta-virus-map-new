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
