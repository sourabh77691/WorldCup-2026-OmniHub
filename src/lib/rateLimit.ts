export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing timestamps for this IP, filter out old ones
    let userTimestamps = this.timestamps.get(ip) || [];
    userTimestamps = userTimestamps.filter(t => t > windowStart);

    if (userTimestamps.length >= this.maxRequests) {
      this.timestamps.set(ip, userTimestamps); // update state before blocking
      return false; // Rate limit exceeded
    }

    userTimestamps.push(now);
    this.timestamps.set(ip, userTimestamps);
    return true; // Allowed
  }
}

// Global instance for simple in-memory rate limiting across the Vercel lambda lifecycle
export const chatRateLimiter = new RateLimiter(15, 60000); // 15 requests per minute
export const crowdRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
