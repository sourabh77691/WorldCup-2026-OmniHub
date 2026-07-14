import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { FanModule } from '@/components/FanModule'

describe('FanModule', () => {
  it('renders the chat interface', () => {
    render(<FanModule />)
    expect(screen.getByText('OmniBot Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E.g., How do I get to Gate A?')).toBeInTheDocument()
  })

  it('allows user to type a message', () => {
    render(<FanModule />)
    const input = screen.getByPlaceholderText('E.g., How do I get to Gate A?') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Where is the bathroom?' } })
    expect(input.value).toBe('Where is the bathroom?')
  })
})
