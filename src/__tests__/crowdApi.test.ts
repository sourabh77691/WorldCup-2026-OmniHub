/**
 * @jest-environment node
 */
import { GET } from '@/app/api/crowd-predictions/route'

jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    text: JSON.stringify({
      incidentCount: 1,
      hotspots: [{ location: 'Test', estimatedWaitTime: '10m', severity: 'High' }],
      recommendations: ['Test']
    })
  })

  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: { OBJECT: 'OBJECT', STRING: 'STRING', INTEGER: 'INTEGER', ARRAY: 'ARRAY' },
    Schema: {},
    __mockGenerateContent: mockGenerateContent
  }
})

jest.mock('@/lib/rateLimit', () => ({
  crowdRateLimiter: { check: jest.fn().mockReturnValue(true) }
}))

import { crowdRateLimiter } from '@/lib/rateLimit'
import { GoogleGenAI } from '@google/genai'

describe('Crowd API GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(crowdRateLimiter.check as jest.Mock).mockReturnValue(true)
  })

  it('returns 429 if rate limit exceeded', async () => {
    ;(crowdRateLimiter.check as jest.Mock).mockReturnValue(false)
    const req = new Request('http://localhost/api/crowd-predictions', { method: 'GET' })
    const res = await GET(req)
    expect(res.status).toBe(429)
  })

  it('returns successful predictions on valid request', async () => {
    const req = new Request('http://localhost/api/crowd-predictions', { method: 'GET' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.incidentCount).toBe(1)
    expect(json.hotspots).toHaveLength(1)
  })

  it('handles Google API failures by returning fallback data', async () => {
    const { __mockGenerateContent } = require('@google/genai')
    __mockGenerateContent.mockRejectedValueOnce(new Error('Network error'))

    const req = new Request('http://localhost/api/crowd-predictions', { method: 'GET' })
    const res = await GET(req)
    // Should fallback to static data
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.incidentCount).toBe(2)
    expect(json.hotspots[0].location).toBe('Gate A')
  })
})
