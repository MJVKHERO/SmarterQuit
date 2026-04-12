// Simple in-memory rate limiter
// Max 5 attempts per IP per 15 minutes
const attempts = {}

function isRateLimited(ip) {
  const now = Date.now()
  const window = 15 * 60 * 1000 // 15 minutes
  
  if (!attempts[ip]) {
    attempts[ip] = { count: 1, first: now }
    return false
  }
  
  // Reset window if expired
  if (now - attempts[ip].first > window) {
    attempts[ip] = { count: 1, first: now }
    return false
  }
  
  attempts[ip].count++
  
  if (attempts[ip].count > 5) return true
  return false
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." })
  }

  const { password } = req.body
  const correct = process.env.ADMIN_PASSWORD

  if (!correct) {
    return res.status(500).json({ error: "Not configured" })
  }

  if (password === correct) {
    return res.status(200).json({ ok: true })
  }

  return res.status(401).json({ ok: false })
}
