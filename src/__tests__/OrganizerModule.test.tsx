import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { OrganizerModule } from '@/components/OrganizerModule'

// Mock fetch for the API call
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      hotspots: [{ location: "Test Gate", estimatedWaitTime: "10m", severity: "High" }],
      recommendations: ["Test recommendation"],
      incidentCount: 1
    }),
  })
) as jest.Mock;

describe('OrganizerModule', () => {
  it('renders the dashboard statistics', async () => {
    await act(async () => {
      render(<OrganizerModule />)
    })
    expect(screen.getByText('Total Stadium Capacity')).toBeInTheDocument()
    expect(screen.getByText('GenAI Crowd Management Intelligence')).toBeInTheDocument()
  })
})
