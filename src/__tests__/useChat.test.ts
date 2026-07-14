import { renderHook, act } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'

// Mock global fetch
global.fetch = jest.fn()

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('ai')
    expect(result.current.input).toBe('')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.activeGate).toBeNull()
  })

  it('updates input state', () => {
    const { result } = renderHook(() => useChat())
    act(() => {
      result.current.setInput('Hello')
    })
    expect(result.current.input).toBe('Hello')
  })

  it('sends a message successfully and updates state', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Test AI response', highlightGate: 'B' })
    })

    const { result } = renderHook(() => useChat())
    
    act(() => {
      result.current.setInput('Where is gate B?')
    })

    await act(async () => {
      await result.current.sendMessage()
    })

    expect(result.current.messages).toHaveLength(3) // initial + user + ai
    expect(result.current.messages[1].role).toBe('user')
    expect(result.current.messages[1].text).toBe('Where is gate B?')
    expect(result.current.messages[2].role).toBe('ai')
    expect(result.current.messages[2].text).toBe('Test AI response')
    expect(result.current.activeGate).toBe('B')
    expect(result.current.input).toBe('')
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rate limited' })
    })

    const { result } = renderHook(() => useChat())
    
    await act(async () => {
      await result.current.sendMessage('Hello test')
    })

    expect(result.current.messages[2].role).toBe('system')
    expect(result.current.messages[2].text).toContain('Rate limited')
  })

  it('handles network failures gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network disconnected'))

    const { result } = renderHook(() => useChat())
    
    await act(async () => {
      await result.current.sendMessage('Hello test')
    })

    expect(result.current.messages[2].role).toBe('system')
    expect(result.current.messages[2].text).toContain('Network disconnected')
  })
})
