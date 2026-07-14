/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route'

jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    text: JSON.stringify({ reply: "Test reply", highlightGate: "A" })
  })

  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: { OBJECT: 'OBJECT', STRING: 'STRING' },
    __mockGenerateContent: mockGenerateContent
  }
})

jest.mock('@/lib/rateLimit', () => ({
  chatRateLimiter: { check: jest.fn().mockReturnValue(true) }
}))

import { chatRateLimiter } from '@/lib/rateLimit'
import { GoogleGenAI } from '@google/genai'

describe('Chat API POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(chatRateLimiter.check as jest.Mock).mockReturnValue(true)
  })

  it('returns 429 if rate limit exceeded', async () => {
    ;(chatRateLimiter.check as jest.Mock).mockReturnValue(false)
    const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({}) })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('returns 400 for invalid request body', async () => {
    const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({ invalid: true }) })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns successful reply on valid request', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', text: 'Hello' }],
        language: 'English',
        accessibleRoute: true
      })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.reply).toBe('Test reply')
    expect(json.highlightGate).toBe('A')
  })

  it('handles Google API failures gracefully', async () => {
    // Access the exported mock function
    const { __mockGenerateContent } = require('@google/genai')
    
    __mockGenerateContent.mockRejectedValueOnce({ status: 503, message: '503 Service Unavailable' });
    __mockGenerateContent.mockRejectedValueOnce({ status: 503, message: '503 Service Unavailable' });
    __mockGenerateContent.mockRejectedValueOnce({ status: 503, message: '503 Service Unavailable' });
    // Since it retries 3 times, we reject 3 times to trigger the fallback

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] })
    })
    const res = await POST(req)
    expect(res.status).toBe(200) // Returns 200 with fallback message
    const json = await res.json()
    expect(json.reply).toContain('very high demand')
  })
  
  it('returns 500 on unexpected errors', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      // Trigger a JSON parse error by providing invalid body
      body: 'invalid-json' 
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
