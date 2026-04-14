import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

const STRIPE = "https://buy.stripe.com/7sYdRbakd1zY4eUdXN5Vu00"

const track = () => {
  try {
    let sid = sessionStorage.getItem('sq_sid')
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('sq_sid', sid) }
    const t0 = Date.now()
    sb.from('page_views').insert({ path: '/quiz', referrer: document.referrer || null, user_agent: navigator.userAgent, session_id: sid })
      .select('id').single().then(({ data }) => {
        if (!data?.id) return
        const send = () => { const s = Math.round((Date.now()-t0)/1000); navigator.sendBeacon(`https://srrxlvhggbhkoxiawcsg.supabase.co/rest/v1/page_views?id=eq.${data.id}`, new Blob([JSON.stringify({duration_seconds:s})],{type:'application/json'})) }
        window.addEventListener('beforeunload', send, {once:true})
        window.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') send() }, {once:true})
      })=>{})
  } catch(e) {}
}

// ─── QUESTIONS ────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'q1',
    text: "How would you honestly describe your relationship with smoking or vaping right now?",
    sub: "Choose the one that hits closest.",
    options: [
      { id: 'a', emoji: '🔁', text: "I keep going back even when I genuinely don't want to" },
      { id: 'b', emoji: '😤', text: "I want to stop but stress always pulls me back in" },
      { id: 'c', emoji: '🌫️', text: "Half the time I light up without really deciding to" },
      { id: 'd', emoji: '🚪', text: "I'm so close to done — I just keep missing the exit" },
    ]
  },
  {
    id: 'q2',
    text: "Think back to the last time you tried to stop, or the last time you told yourself you would. What actually happened?",
    sub: "Be honest — this is where the insight comes from.",
    options: [
      { id: 'a', emoji: '📉', text: "Things went okay for a few days — then one stressful moment sent me back to day one" },
      { id: 'b', emoji: '🌀', text: "I got through withdrawal but never felt in control — it was just waiting to relapse" },
      { id: 'c', emoji: '🧱', text: "I didn't really have a plan. I just decided to stop and hoped willpower would be enough" },
      { id: 'd', emoji: '🔄', text: "I've stopped and restarted so many times I stopped counting" },
    ]
  },
  {
    id: 'q3',
    text: "Be honest — what does smoking or vaping actually do for you in the moment?",
    sub: "Not what you wish it did. What it actually does.",
    options: [
      { id: 'a', emoji: '🧘', text: "It's the only 5 minutes of the day that feel like mine — a pause the world can't take" },
      { id: 'b', emoji: '💨', text: "It takes the edge off when nothing else works. It's not enjoyment — it's relief" },
      { id: 'c', emoji: '🤝', text: "It's tied to everything social — coffee, drinks, the end of a meal, being outside with someone" },
      { id: 'd', emoji: '🤖', text: "Honestly? Nothing anymore. I don't even enjoy it. It just happens" },
    ]
  },
  {
    id: 'q4',
    text: "Picture yourself 6 months from now, completely free. No cravings, no habits, no pull. What's your honest first reaction?",
    sub: "There's no right answer. The gut reaction is the useful one.",
    options: [
      { id: 'a', emoji: '😮‍💨', text: "Relief. I'm exhausted by this. I want it gone." },
      { id: 'b', emoji: '😟', text: "Loss. Like I'd be giving something up, even if I know it's irrational" },
      { id: 'c', emoji: '🤔', text: "Disbelief. I've wanted that for years but I genuinely don't know if I can get there" },
      { id: 'd', emoji: '⚡', text: "Motivation. Something clicked — I'm more ready than I've ever been" },
    ]
  },
  {
    id: 'q5',
    text: "What's the real reason you haven't stopped yet — the honest one, not the polished answer?",
    sub: "The one you maybe haven't said out loud.",
    options: [
      { id: 'a', emoji: '🗓️', text: "I keep waiting for the right moment — less stress, the right time — and it never comes" },
      { id: 'b', emoji: '😰', text: "I'm afraid of who I'll be without it. I don't have another way to deal with certain things" },
      { id: 'c', emoji: '🔧', text: "I know the why. I just don't have the right structure. Every attempt I do it alone with no system" },
      { id: 'd', emoji: '💔', text: "Part of me still doesn't want to. I know that's a problem, but it's true" },
    ]
  },
]

// ─── RESULTS ─────────────────────────────────────────────────────────
const RESULTS = {
  coping: {
    type: "The Coping Mechanism Smoker",
    emoji: "🔴",
    color: "#ff5252",
    colorDim: "rgba(255,82,82,0.1)",
    colorBorder: "rgba(255,82,82,0.25)",
    headline: "You don't smoke because you're addicted to nicotine. You smoke because it works.",
    body: "Every time you've tried to stop, you removed the cigarette without replacing what it did. The stress still came. The edge was still there. And the only thing that reliably worked was the one thing you were trying to quit.\n\nThis isn't a willpower problem. It's an engineering problem. You need a specific replacement for the specific moments — not generic advice about deep breathing, but a 3-minute protocol built around your exact trigger pattern.\n\nThat's what the awareness days are for. Three days of logging every smoke before you light it, so you can see your actual trigger map — not a guess, your real data. Then when you stop, you stop with a plan for the hard moments. Not a prayer.",
    insight: "Most people who smoke to cope try to quit by removing the cigarette. The habit stays intact. The trigger stays intact. The need stays intact. The only thing missing is the solution — which is why they go back.",
    cta: "Start the 21-day program built around your patterns",
  },
  sleepwalker: {
    type: "The Sleepwalker",
    emoji: "🌫️",
    color: "#40c4ff",
    colorDim: "rgba(64,196,255,0.1)",
    colorBorder: "rgba(64,196,255,0.25)",
    headline: "You stopped choosing to smoke. At some point it started choosing you.",
    body: "The cigarette is already between your fingers before your brain registered wanting one. After coffee. After a meal. Between tasks. On the way somewhere. The habit doesn't ask permission anymore — it just happens.\n\nWillpower can't fight what it can't see. That's why every attempt based on 'just deciding to stop' unravels in the first week. You're not fighting a craving. You're fighting an automatic sequence that runs below conscious thought.\n\nThe awareness days exist specifically for this. Three days of logging every smoke before it happens — the time, the trigger, the context. By day 3, you can see the pattern you've been living inside without knowing it. That map is the only thing that makes the next step possible.",
    insight: "Research on habit loops shows that automatic behaviors are the hardest to interrupt with willpower — and the easiest to interrupt once the trigger is identified. Awareness isn't a soft first step. It's the actual intervention.",
    cta: "See your habit map before you try to stop",
  },
  almostfree: {
    type: "The Almost-Free Quitter",
    emoji: "🏁",
    color: "#00e676",
    colorDim: "rgba(0,230,118,0.1)",
    colorBorder: "rgba(0,230,118,0.25)",
    headline: "You've already done the hard part. Multiple times. You just keep missing the same exit.",
    body: "You know what withdrawal feels like. You've been through the first three days before — the fog, the irritability, the constant low-level pull. You know it passes. That's not your problem.\n\nYour problem is a specific moment. Stress arrives. Or alcohol. Or a bad day when everything feels slightly wrong and the old solution is right there. And in that moment, the days of progress feel abstract and the cigarette feels immediate. So you take it. And then the count restarts.\n\nYou don't need to learn how to quit. You need a specific protocol for that one moment — the moment you already know is coming. The 3-minute craving timer exists for exactly this. By the time it's over, the moment has passed. The decision is made on the other side, not in the middle of it.",
    insight: "Studies on relapse patterns show that most long-term quitters don't fail on day 1. They fail on a specific high-stress day between days 7 and 21. Preparing for that moment in advance — not in the moment — is what separates successful quits from resets.",
    cta: "Build the system for the moment you know is coming",
  },
  identity: {
    type: "The Identity Smoker",
    emoji: "🪞",
    color: "#ffd600",
    colorDim: "rgba(255,214,0,0.1)",
    colorBorder: "rgba(255,214,0,0.25)",
    headline: "Smoking is woven into who you are — not just what you do. That's the real thing to solve.",
    body: "You're not just giving up a chemical. You're giving up something that feels like part of your personality, your social life, your breaks, your rituals. When you imagine stopping, there's a version of you that you're not sure exists on the other side.\n\nThat feeling is real. And every quit method that ignores it fails eventually — because it treats the problem as physical when yours is mostly psychological.\n\nThe program has a specific phase for this. Day 14 is called the mirror: the shift from 'I'm trying to quit smoking' to 'I don't smoke.' Not as an affirmation. As an identity update. Research consistently shows that identity-based change has a higher success rate than goal-based change. You're not removing something. You're stepping into someone you already are — someone who just hasn't had the right framework yet.",
    insight: "Habit research shows that identity-based change outlasts motivation-based change. 'I don't smoke' is fundamentally different from 'I'm trying to quit.' One requires constant effort. The other just requires a decision to be consistent with who you already decided you are.",
    cta: "Start the identity shift — not just the habit change",
  },
}

// ─── SCORING ─────────────────────────────────────────────────────────
function getResult(answers) {
  const scores = { coping: 0, sleepwalker: 0, almostfree: 0, identity: 0 }

  const map = {
    q1: { a: 'almostfree', b: 'coping', c: 'sleepwalker', d: 'almostfree' },
    q2: { a: 'coping',     b: 'almostfree', c: 'sleepwalker', d: 'almostfree' },
    q3: { a: 'identity',   b: 'coping',    c: 'identity',    d: 'sleepwalker' },
    q4: { a: 'coping',     b: 'identity',  c: 'almostfree',  d: 'almostfree' },
    q5: { a: 'sleepwalker',b: 'identity',  c: 'almostfree',  d: 'identity' },
  }

  Object.entries(answers).forEach(([q, a]) => {
    const type = map[q]?.[a]
    if (type) scores[type]++
  })

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < current ? 24 : 8,
          height: 8,
          borderRadius: 4,
          background: i < current ? '#00e676' : i === current ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.4s ease',
        }}/>
      ))}
    </div>
  )
}

// ─── ANALYZING SCREEN ─────────────────────────────────────────────────
function AnalyzingScreen({ onDone }) {
  const [step, setStep] = useState(0)
  const steps = [
    "Reading your answers…",
    "Mapping your trigger patterns…",
    "Identifying your quit archetype…",
    "Your result is ready.",
  ]

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 900),
      setTimeout(() => setStep(2), 1900),
      setTimeout(() => setStep(3), 2900),
      setTimeout(() => onDone(), 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 40px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: i * 16,
            borderRadius: '50%',
            border: `2px solid rgba(0,230,118,${0.6 - i * 0.15})`,
            animation: `spin ${2 + i * 0.5}s linear infinite`,
          }}/>
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>🧠</div>
      </div>

      {steps.map((s, i) => (
        <div key={i} style={{
          fontSize: i === step ? 18 : 14,
          fontWeight: i === step ? 700 : 400,
          color: i < step ? 'rgba(0,230,118,0.5)' : i === step ? '#f0f4f8' : 'rgba(240,244,248,0.2)',
          marginBottom: 12,
          transition: 'all 0.4s ease',
        }}>
          {i < step ? '✓ ' : ''}{s}
        </div>
      ))}
    </div>
  )
}

// ─── RESULT SCREEN ───────────────────────────────────────────────────
function ResultScreen({ resultKey }) {
  const r = RESULTS[resultKey]
  const paragraphs = r.body.split('\n\n')

  return (
    <div style={{ animation: 'fadeUp 0.6s ease both' }}>
      {/* Type badge */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-block',
          background: r.colorDim,
          border: `1px solid ${r.colorBorder}`,
          borderRadius: 100,
          padding: '6px 18px',
          fontSize: 12,
          fontWeight: 700,
          color: r.color,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>Your quit archetype</div>

        <div style={{ fontSize: 52, marginBottom: 12 }}>{r.emoji}</div>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(26px, 6vw, 36px)',
          color: r.color,
          lineHeight: 1.2,
          marginBottom: 8,
        }}>{r.type}</h2>
      </div>

      {/* Headline */}
      <div style={{
        background: r.colorDim,
        border: `1px solid ${r.colorBorder}`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontStyle: 'italic',
          fontSize: 20,
          lineHeight: 1.55,
          color: '#f0f4f8',
          margin: 0,
        }}>{r.headline}</p>
      </div>

      {/* Body paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: 'rgba(240,244,248,0.75)',
            margin: 0,
          }}>{p}</p>
        ))}
      </div>

      {/* Research insight */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 11, color: '#40c4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🔬 The research behind this</div>
        <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.55)', lineHeight: 1.7, margin: 0 }}>{r.insight}</p>
      </div>

      {/* CTA */}
      <div style={{
        background: 'rgba(0,230,118,0.06)',
        border: '1px solid rgba(0,230,118,0.2)',
        borderRadius: 18,
        padding: '24px',
        marginBottom: 16,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', marginBottom: 4 }}>
          SmarterQuit is built around your exact pattern.
        </p>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 19, color: '#f0f4f8', marginBottom: 20, lineHeight: 1.4 }}>
          21 days. Built around you.<br/>Less than $20. Money-back guarantee.
        </p>
        <a href={STRIPE} style={{
          display: 'block',
          background: '#00e676',
          color: '#000',
          textDecoration: 'none',
          borderRadius: 14,
          padding: '18px 24px',
          fontSize: 17,
          fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 10,
          boxShadow: '0 8px 32px rgba(0,230,118,0.3)',
        }}>
          {r.cta} →
        </a>
        <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.25)' }}>
          $19.99 one-time · No download · Money-back guarantee
        </div>
      </div>

      {/* Learn more */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: 14, color: 'rgba(0,230,118,0.5)', textDecoration: 'none' }}>
          Learn how the full program works →
        </Link>
      </div>

      {/* Retake */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/quiz" onClick={() => window.location.reload()} style={{ fontSize: 13, color: 'rgba(240,244,248,0.2)', textDecoration: 'none' }}>
          Retake the quiz
        </Link>
      </div>
    </div>
  )
}

// ─── MAIN QUIZ ────────────────────────────────────────────────────────
export default function Quiz() {
  const [screen, setScreen] = useState('intro') // intro | question | analyzing | result
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [resultKey, setResultKey] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const topRef = useRef(null)

  useEffect(() => {
    document.title = 'Why You Keep Going Back — Find Your Quit Pattern'
    track()
  }, [])

  const currentQ = QUESTIONS[qIndex]

  const handleStart = () => {
    setScreen('question')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelect = (optId) => {
    setSelected(optId)
  }

  const handleNext = () => {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setLeaving(true)

    setTimeout(() => {
      setLeaving(false)
      setSelected(null)
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1)
        topRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else {
        setScreen('analyzing')
      }
    }, 300)
  }

  const handleAnalysisDone = () => {
    const key = getResult(answers)
    setResultKey(key)
    setScreen('result')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
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

        .opt {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 20px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all .2s ease;
          text-align: left;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          color: #f0f4f8;
        }
        .opt:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.18);
          transform: translateX(4px);
        }
        .opt.selected {
          background: rgba(0,230,118,0.1);
          border-color: #00e676;
        }
        .opt-emoji {
          font-size: 22px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .opt-text {
          font-size: 15px;
          line-height: 1.5;
          font-weight: 500;
        }

        .next-btn {
          width: 100%;
          background: #00e676;
          color: #000;
          border: none;
          border-radius: 14px;
          padding: 18px;
          font-size: 16px;
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .15s;
          box-shadow: 0 6px 24px rgba(0,230,118,0.25);
        }
        .next-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(240,244,248,0.2);
          box-shadow: none;
          cursor: not-allowed;
        }
        .next-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(0,230,118,0.35);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-16px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fadeup { animation: fadeUp .45s ease both; }
        .fadeout { animation: fadeOut .25s ease both; }
      `}</style>

      {/* Nav */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center' }} ref={topRef}>
        <Link to="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          letterSpacing: '0.05em',
          color: 'rgba(240,244,248,0.4)',
          textDecoration: 'none',
        }}>
          SMARTER<span style={{ color: '#00e676' }}>QUIT</span>
        </Link>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '16px 24px 80px' }}>

        {/* ── INTRO ── */}
        {screen === 'intro' && (
          <div className="fadeup">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 100,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240,244,248,0.4)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}>5 questions · 2 minutes</div>

              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(34px, 8vw, 50px)',
                lineHeight: 1.1,
                marginBottom: 20,
              }}>
                Why do you keep<br/>going back —<br/><span style={{ color: '#00e676' }}>even when you<br/>don't want to?</span>
              </h1>

              <p style={{ color: 'rgba(240,244,248,0.5)', fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
                This isn't a generic personality test. These 5 questions are designed to identify the specific pattern that explains every failed attempt — and what to do about it.
              </p>
            </div>

            {/* What you'll get */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {[
                ['🎯', 'Your exact quit archetype', 'Which of the 4 smoking patterns describes you'],
                ['🔍', 'Why your past attempts failed', 'The specific moment where every quit unravels for your type'],
                ['🗺️', 'Your personal quit roadmap', 'What actually works for your pattern — not generic advice'],
              ].map(([emoji, title, sub]) => (
                <div key={title} style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleStart} className="next-btn">
              Find out your quit type →
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(240,244,248,0.2)', marginTop: 12 }}>
              Free · No email required · 2 minutes
            </p>
          </div>
        )}

        {/* ── QUESTION ── */}
        {screen === 'question' && (
          <div className={leaving ? 'fadeout' : 'fadeup'} key={qIndex}>
            <ProgressDots total={QUESTIONS.length} current={qIndex} />

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                Question {qIndex + 1} of {QUESTIONS.length}
              </div>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 5vw, 28px)',
                lineHeight: 1.35,
                marginBottom: 8,
              }}>{currentQ.text}</h2>
              <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.4)', lineHeight: 1.5 }}>{currentQ.sub}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {currentQ.options.map(opt => (
                <button
                  key={opt.id}
                  className={`opt ${selected === opt.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                >
                  <span className="opt-emoji">{opt.emoji}</span>
                  <span className="opt-text">{opt.text}</span>
                  {selected === opt.id && (
                    <span style={{ marginLeft: 'auto', color: '#00e676', fontSize: 18, flexShrink: 0 }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <button className="next-btn" onClick={handleNext} disabled={!selected}>
              {qIndex < QUESTIONS.length - 1 ? 'Next question →' : 'See my result →'}
            </button>
          </div>
        )}

        {/* ── ANALYZING ── */}
        {screen === 'analyzing' && (
          <AnalyzingScreen onDone={handleAnalysisDone} />
        )}

        {/* ── RESULT ── */}
        {screen === 'result' && resultKey && (
          <ResultScreen resultKey={resultKey} />
        )}

      </div>
    </div>
  )
}
