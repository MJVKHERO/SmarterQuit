import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

const STRIPE_URL = "https://buy.stripe.com/7sYdRbakd1zY4eUdXN5Vu00"

// Track page view
const trackView = () => {
  try {
    let sid = sessionStorage.getItem('sq_sid')
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('sq_sid', sid) }
    sb.from('page_views').insert({ path: '/calc', referrer: document.referrer || null, user_agent: navigator.userAgent, session_id: sid }).then(() => {})
  } catch(e) {}
}

// Animated number counter
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  const raf = useRef(null)

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    const start = prev.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3) // ease out cubic
      const cur = Math.round(start + diff * ease)
      setVal(cur)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target])

  return val
}

function fmt(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + Math.round(n).toLocaleString()
  return '$' + Math.round(n).toLocaleString()
}

const THINGS = [
  { cost: 500,    label: "a weekend getaway" },
  { cost: 1200,   label: "a new iPhone" },
  { cost: 2500,   label: "a week in Europe" },
  { cost: 5000,   label: "a month in Southeast Asia" },
  { cost: 8000,   label: "a year of gym memberships" },
  { cost: 15000,  label: "a down payment on a car" },
  { cost: 30000,  label: "a year of university tuition" },
  { cost: 50000,  label: "a brand new car" },
  { cost: 100000, label: "a year of early retirement" },
]

function getThing(yearly, years) {
  const total = yearly * years
  let best = THINGS[0]
  for (const t of THINGS) {
    if (total >= t.cost) best = t
  }
  return best
}

export default function Calc() {
  const [cigs, setCigs] = useState('')
  const [spend, setSpend] = useState('')
  const [years, setYears] = useState('')
  const [showResult, setShowResult] = useState(false)
  const resultRef = useRef(null)

  useEffect(() => {
    document.title = 'How Much Is Smoking Costing You? — Free Calculator'
    trackView()
  }, [])

  const weeklySpend = parseFloat(spend) || 0
  const yearlySpend = weeklySpend * 52
  const cigsPerDay  = parseFloat(cigs) || 0
  const smokeYears  = parseFloat(years) || 0
  const totalSpent  = yearlySpend * smokeYears
  const next10      = yearlySpend * 10
  const next5       = yearlySpend * 5
  const monthlySpend = weeklySpend * 4.33
  const cigsTotal   = cigsPerDay * 365 * smokeYears

  const yearlyAnim = useCountUp(showResult ? Math.round(yearlySpend) : 0)
  const totalAnim  = useCountUp(showResult ? Math.round(totalSpent) : 0, 1200)
  const next10Anim = useCountUp(showResult ? Math.round(next10) : 0, 1000)

  const thing = getThing(yearlySpend, 10)
  const hasData = weeklySpend > 0

  const handleCalculate = () => {
    if (!weeklySpend) return
    setShowResult(true)
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

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

        .calc-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          color: #f0f4f8;
          padding: 18px 20px;
          font-size: 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          outline: none;
          transition: border-color .2s, background .2s;
          -webkit-appearance: none;
        }
        .calc-input:focus {
          border-color: #00e676;
          background: rgba(0,230,118,0.06);
        }
        .calc-input::placeholder { color: rgba(240,244,248,0.2); font-weight: 400; }

        .result-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 24px;
        }

        .big-num {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.02em;
          line-height: 0.9;
        }

        .cta-btn {
          display: block;
          width: 100%;
          background: #00e676;
          color: #000;
          border: none;
          border-radius: 16px;
          padding: 22px;
          font-size: 19px;
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 8px 32px rgba(0,230,118,0.3);
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,230,118,0.4);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fadeup { animation: fadeUp .5s ease both; }
        .fadeup-1 { animation-delay: .1s; }
        .fadeup-2 { animation-delay: .2s; }
        .fadeup-3 { animation-delay: .3s; }
        .fadeup-4 { animation-delay: .4s; }
        .fadeup-5 { animation-delay: .5s; }
        .fadeup-6 { animation-delay: .6s; }

        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,230,118,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(0,230,118,0); }
        }
        .pulse { animation: pulse-green 2.5s ease infinite; }
      `}</style>

      {/* Top nav — minimal */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center' }}>
        <Link to="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          letterSpacing: '0.05em',
          color: 'rgba(240,244,248,0.5)',
          textDecoration: 'none',
        }}>
          SMARTER<span style={{ color: '#00e676' }}>QUIT</span>
        </Link>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Hero */}
        <div className="fadeup fadeup-1" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,82,82,0.1)',
            border: '1px solid rgba(255,82,82,0.25)',
            color: '#ff8a80',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            💸 The real cost of your habit
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(36px, 8vw, 52px)',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            How much is smoking<br/>actually costing you?
          </h1>
          <p style={{ color: 'rgba(240,244,248,0.55)', fontSize: 17, lineHeight: 1.65 }}>
            Most people have no idea. Fill in two numbers and find out yours.
          </p>
        </div>

        {/* Input form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>

          <div className="fadeup fadeup-2">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(240,244,248,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              What do you spend per week on cigarettes or vaping?
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 22, color: 'rgba(240,244,248,0.3)', fontWeight: 700 }}>$</span>
              <input
                className="calc-input"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={spend}
                onChange={e => setSpend(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
            </div>
            {weeklySpend > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,230,118,0.7)', fontWeight: 500 }}>
                = ${monthlySpend.toFixed(0)}/month &nbsp;·&nbsp; ${yearlySpend.toLocaleString()}/year
              </div>
            )}
          </div>

          <div className="fadeup fadeup-3">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(240,244,248,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              How many cigarettes or puffs per day?
            </label>
            <input
              className="calc-input"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 20"
              value={cigs}
              onChange={e => setCigs(e.target.value)}
            />
          </div>

          <div className="fadeup fadeup-4">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(240,244,248,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              How many years have you smoked or vaped?
            </label>
            <input
              className="calc-input"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 10"
              value={years}
              onChange={e => setYears(e.target.value)}
            />
          </div>

          <div className="fadeup fadeup-5">
            <button
              onClick={handleCalculate}
              disabled={!hasData}
              className={hasData ? 'cta-btn pulse' : ''}
              style={!hasData ? {
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(240,244,248,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 22,
                fontSize: 17,
                fontWeight: 700,
                cursor: 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
              } : {}}
            >
              Show me the real cost →
            </button>
          </div>

        </div>

        {/* RESULTS */}
        {showResult && (
          <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Hero number — yearly */}
            <div className="fadeup result-card" style={{
              background: 'linear-gradient(135deg, rgba(255,82,82,0.12), rgba(255,82,82,0.05))',
              border: '1px solid rgba(255,82,82,0.25)',
              textAlign: 'center',
              padding: '32px 24px',
            }}>
              <div style={{ fontSize: 13, color: 'rgba(255,138,128,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                You're spending per year
              </div>
              <div className="big-num" style={{ fontSize: 'clamp(72px, 18vw, 96px)', color: '#ff5252' }}>
                {fmt(yearlyAnim)}
              </div>
              <div style={{ color: 'rgba(240,244,248,0.45)', fontSize: 15, marginTop: 8 }}>
                on cigarettes or vaping
              </div>
            </div>

            {/* What you've already spent */}
            {smokeYears > 0 && (
              <div className="fadeup fadeup-1 result-card" style={{ textAlign: 'center', padding: '28px 24px' }}>
                <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Already spent in {Math.round(smokeYears)} years
                </div>
                <div className="big-num" style={{ fontSize: 'clamp(52px, 14vw, 72px)', color: '#ffd600' }}>
                  {fmt(totalAnim)}
                </div>
                {cigsTotal > 0 && (
                  <div style={{ color: 'rgba(240,244,248,0.4)', fontSize: 14, marginTop: 8 }}>
                    {Math.round(cigsTotal).toLocaleString()} cigarettes smoked
                  </div>
                )}
              </div>
            )}

            {/* Next 10 years */}
            <div className="fadeup fadeup-2 result-card" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                If you don't stop — next 10 years
              </div>
              <div className="big-num" style={{ fontSize: 'clamp(52px, 14vw, 72px)', color: '#ff8a80' }}>
                {fmt(next10Anim)}
              </div>
              <div style={{ color: 'rgba(240,244,248,0.45)', fontSize: 15, marginTop: 8 }}>
                gone. That's enough for {thing.label}.
              </div>
            </div>

            {/* Comparison grid */}
            <div className="fadeup fadeup-3 result-card">
              <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                What ${fmt(next10Anim).replace('$','')} could buy instead
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { emoji: '✈️', what: `${Math.floor(next10 / 2500)} European holidays` },
                  { emoji: '🏖️', what: `${Math.floor(next10 / 5000)} months abroad` },
                  { emoji: '🚗', what: `${Math.floor(next10 / 25000)} new cars` },
                  { emoji: '💎', what: `${Math.floor(next10 / 1200)} luxury watches` },
                ].filter(i => {
                  const n = parseInt(i.what.split(' ')[0])
                  return n >= 1
                }).slice(0, 4).map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                    <span style={{ fontSize: 14, color: 'rgba(240,244,248,0.75)', lineHeight: 1.3 }}>{item.what}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The dividing line */}
            <div className="fadeup fadeup-4" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }}/>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                fontSize: 22,
                color: 'rgba(240,244,248,0.7)',
                lineHeight: 1.6,
                marginBottom: 8,
              }}>
                The habit costs you {fmt(yearlySpend)} a year<br/>and your health on top.
              </p>
              <p style={{ color: 'rgba(240,244,248,0.4)', fontSize: 15, lineHeight: 1.6 }}>
                SmarterQuit costs $19.99. One time. Less than a week of what you're spending now.
              </p>
            </div>

            {/* CTA */}
            <div className="fadeup fadeup-5">
              <a href={STRIPE_URL} className="cta-btn" style={{ marginBottom: 12 }}>
                Stop spending. Start your 21-day program →
              </a>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(240,244,248,0.3)', lineHeight: 1.6 }}>
                $19.99 one-time · Money-back guarantee · No download needed
              </div>
            </div>

            {/* Secondary — learn more */}
            <div className="fadeup fadeup-6" style={{ textAlign: 'center', paddingTop: 8 }}>
              <Link to="/" style={{ fontSize: 14, color: 'rgba(0,230,118,0.6)', textDecoration: 'none' }}>
                Learn how the program works first →
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
