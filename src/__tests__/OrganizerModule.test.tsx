import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrganizerModule } from '@/components/OrganizerModule'

// Mock the hook
jest.mock('@/hooks/useCrowdPredictions', () => ({
  useCrowdPredictions: jest.fn()
}))

import { useCrowdPredictions } from '@/hooks/useCrowdPredictions'

describe('OrganizerModule', () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCrowdPredictions as jest.Mock).mockReturnValue({
      predictions: {
        hotspots: [{ location: "Test Gate", estimatedWaitTime: "10m", severity: "High" }],
        recommendations: ["Test recommendation"],
        incidentCount: 1
      },
      isLoading: false,
      isError: undefined,
      mutate: mockMutate
    })
  })

  it('renders the dashboard statistics', () => {
    render(<OrganizerModule />)
    expect(screen.getByText('Total Stadium Capacity')).toBeInTheDocument()
    expect(screen.getByText('GenAI Crowd Management Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Test Gate')).toBeInTheDocument()
    expect(screen.getByText('Test recommendation')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    ;(useCrowdPredictions as jest.Mock).mockReturnValue({
      predictions: null,
      isLoading: true,
      isError: undefined,
      mutate: mockMutate
    })
    
    render(<OrganizerModule />)
    expect(screen.getByText('Loading predictions...')).toBeInTheDocument()
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument()
  })

  it('calls mutate when refresh button is clicked', () => {
    render(<OrganizerModule />)
    const refreshButton = screen.getByRole('button', { name: /Refresh Intelligence/i })
    fireEvent.click(refreshButton)
    expect(mockMutate).toHaveBeenCalledTimes(1)
  })
})
