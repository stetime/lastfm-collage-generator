import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'

const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
})

export default limiter
