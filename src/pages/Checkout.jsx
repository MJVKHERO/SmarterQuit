import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

const STRIPE = "https://buy.stripe.com/7sYdRbakd1zY4eUdXN5Vu00"

export default function Checkout() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Start Your Program — SmarterQuit'
    try {
      let sid = sessionStorage.getItem('sq_sid')
      if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('sq_sid', sid) }
      const t0 = Date.now()
      sb.from('page_views').insert({ path: '/checkout', referrer: document.referrer||null, user_agent: navigator.userAgent, session_id: sid })
        .select('id').single().then(({ data }) => {
          if (!data?.id) return
          const send = () => { const s = Math.round((Date.now()-t0)/1000); navigator.sendBeacon(`https://srrxlvhggbhkoxiawcsg.supabase.co/rest/v1/page_views?id=eq.${data.id}`, new Blob([JSON.stringify({duration_seconds:s})],{type:'application/json'})) }
          window.addEventListener('beforeunload', send, {once:true})
          window.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') send() }, {once:true})
        })
    } catch(e) {}
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c10',
      color: '#f0f4f8',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c10; }
        .checkout-btn {
          display: block; width: 100%;
          background: #00e676; color: #000;
          border: none; border-radius: 14px;
          padding: 20px 24px; font-size: 18px; font-weight: 800;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          text-decoration: none; text-align: center;
          box-shadow: 0 8px 32px rgba(0,230,118,0.3);
          transition: transform .15s, box-shadow .15s;
        }
        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,230,118,0.4);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeUp .4s ease both; }
        .fade-1 { animation-delay: .05s; }
        .fade-2 { animation-delay: .1s; }
        .fade-3 { animation-delay: .15s; }
        .fade-4 { animation-delay: .2s; }
        .fade-5 { animation-delay: .25s; }
      `}</style>

      {/* Nav */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center' }}>
        <Link to="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, letterSpacing: '0.05em',
          color: 'rgba(240,244,248,0.5)', textDecoration: 'none',
        }}>
          SMARTER<span style={{ color: '#00e676' }}>QUIT</span>
        </Link>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 24px 80px' }}>

        {/* Header */}
        <div className="fade" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(30px, 6vw, 42px)',
            lineHeight: 1.15, marginBottom: 12,
          }}>
            You're one step away from<br/>
            <span style={{ color: '#00e676' }}>Day 1.</span>
          </h1>
          <p style={{ color: 'rgba(240,244,248,0.5)', fontSize: 16, lineHeight: 1.6 }}>
            Review what you're getting before you pay.
          </p>
        </div>

        {/* What you get */}
        <div className="fade fade-1" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: '#00e676', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            ✓ What's included
          </div>
          {[
            ['📊', 'Days 1–3: Awareness phase', 'You still smoke. You just map your habit. By day 3 you understand it better than you ever have.'],
            ['⏱️', '3-minute craving timer', 'Built in. Every craving peaks and passes in 3 minutes. This is the tool that gets you through.'],
            ['🧠', '21 days of daily content', 'Each day has a specific lesson based on the science of habit change. 5 minutes to read.'],
            ['📱', 'Works on any device', 'No download. Opens in your browser. Works on iPhone, Android, or your laptop.'],
            ['📧', 'Daily check-in emails', 'Optional. A personal message each morning based on where you are in the program.'],
          ].map(([emoji, title, sub]) => (
            <div key={title} style={{
              display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', lineHeight: 1.5 }}>{sub}</div>
              </div>
            </div>
          ))}
          {/* Last item without border */}
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>🔁</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Works for cigarettes & vaping</div>
              <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', lineHeight: 1.5 }}>Disposables, pods, roll-ups — the program adapts to your type.</div>
            </div>
          </div>
        </div>

        {/* Founder trust signal */}
        <div className="fade fade-2" style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          background: 'rgba(0,230,118,0.05)',
          border: '1px solid rgba(0,230,118,0.15)',
          borderRadius: 14, padding: '18px 20px',
          marginBottom: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            border: '2px solid rgba(0,230,118,0.3)',
          }}>
            <img src="/marc.jpg" alt="Marc" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f4f8', marginBottom: 4 }}>
              Marc, Founder
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', lineHeight: 1.6, margin: 0 }}>
              "I built this for myself after failing to quit multiple times. It worked. That's the only reason I'm selling it."
            </p>
          </div>
        </div>

        {/* Guarantee */}
        <div className="fade fade-3" style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '18px 20px',
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f4f8', marginBottom: 4 }}>
              Money-back guarantee
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', lineHeight: 1.6, margin: 0 }}>
              Complete all 21 days and still smoke? Email hello@smarterquit.com within 30 days. Full refund, no forms, no questions asked.
            </p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="fade fade-4">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 16, color: 'rgba(240,244,248,0.3)', textDecoration: 'line-through' }}>$49.99</span>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 52, color: '#00e676', lineHeight: 1,
              }}>$19.99</span>
              <span style={{
                background: 'rgba(255,214,0,0.12)',
                border: '1px solid rgba(255,214,0,0.3)',
                color: '#ffd600', fontSize: 11, fontWeight: 700,
                padding: '4px 10px', borderRadius: 6,
              }}>LAUNCH PRICE</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.3)' }}>
              One-time payment · No subscription · Yours forever
            </div>
          </div>

          <a href={STRIPE} className="checkout-btn">
            Pay $19.99 and start Day 1 tonight →
          </a>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(240,244,248,0.25)', lineHeight: 1.8 }}>
            🔒 Secure payment via Stripe &nbsp;·&nbsp; Visa, Mastercard, iDEAL accepted<br/>
            After payment you'll be taken directly to the program.
          </div>
        </div>

        {/* Back link */}
        <div className="fade fade-5" style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(240,244,248,0.2)', textDecoration: 'none' }}>
            ← Back to homepage
          </Link>
        </div>

      </div>
    </div>
  )
}
