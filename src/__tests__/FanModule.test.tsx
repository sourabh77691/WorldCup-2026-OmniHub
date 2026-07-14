import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FanModule } from '@/components/FanModule'

// Mock the useChat hook to isolate FanModule testing
jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn()
}))

import { useChat } from '@/hooks/useChat'

describe('FanModule', () => {
  const mockSendMessage = jest.fn()
  const mockSetInput = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [{ role: 'ai', text: 'Welcome to the WorldCup 2026 OmniHub!' }],
      input: '',
      setInput: mockSetInput,
      isLoading: false,
      activeGate: null,
      sendMessage: mockSendMessage
    })
  })

  it('renders the chat interface with accessibility toggles', () => {
    render(<FanModule />)
    expect(screen.getByText('OmniBot Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E.g., How do I get to Gate A?')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Wheelchair Accessible Route')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument() // Default language
  })

  it('allows user to type a message', () => {
    render(<FanModule />)
    const input = screen.getByPlaceholderText('E.g., How do I get to Gate A?') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Where is the bathroom?' } })
    expect(mockSetInput).toHaveBeenCalledWith('Where is the bathroom?')
  })

  it('submits a message with default language and accessibility settings', async () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [{ role: 'ai', text: 'Welcome to the WorldCup 2026 OmniHub!' }],
      input: 'Where is the bathroom?',
      setInput: mockSetInput,
      isLoading: false,
      activeGate: null,
      sendMessage: mockSendMessage
    })

    render(<FanModule />)
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(undefined, "English", false)
    })
  })

  it('submits a message with customized language and accessibility settings', async () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [{ role: 'ai', text: 'Welcome to the WorldCup 2026 OmniHub!' }],
      input: 'Where is the bathroom?',
      setInput: mockSetInput,
      isLoading: false,
      activeGate: null,
      sendMessage: mockSendMessage
    })

    render(<FanModule />)
    
    // Toggle Accessibility
    const accToggle = screen.getByText(/Accessible Route/i)
    fireEvent.click(accToggle)

    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)

    await waitFor(() => {
      // accessibleRoute should be true
      expect(mockSendMessage).toHaveBeenCalledWith(undefined, "English", true)
    })
  })
})
