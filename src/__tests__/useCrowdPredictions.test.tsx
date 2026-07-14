import { renderHook, waitFor } from '@testing-library/react'
import { useCrowdPredictions } from '@/hooks/useCrowdPredictions'
import { SWRConfig } from 'swr'
import React from 'react'

// Mock global fetch
global.fetch = jest.fn()

describe('useCrowdPredictions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  )

  it('fetches crowd predictions successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ incidentCount: 5, hotspots: [] })
    })

    const { result } = renderHook(() => useCrowdPredictions(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.predictions).toEqual({ incidentCount: 5, hotspots: [] })
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBeUndefined()
  })

  it('handles fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    })

    const { result } = renderHook(() => useCrowdPredictions(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBeDefined()
    })
    
    expect(result.current.predictions).toBeUndefined()
  })
})
