import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

const S = {
  bg: '#080c10', bg2: '#0d1117', bg3: '#111820',
  green: '#00e676', white: '#f0f4f8', muted: '#5a7a96',
  border: 'rgba(255,255,255,0.07)',
}

const CATEGORIES = {
  'how-to-quit-smoking-21-days':        { tag: 'Guide',     color: '#00e676' },
  'why-willpower-doesnt-work-quit-smoking': { tag: 'Science', color: '#40c4ff' },
  'how-to-quit-vaping':                 { tag: 'Vaping',    color: '#ff9800' },
  'what-happens-body-stop-smoking':     { tag: 'Health',    color: '#ff5252' },
}

const trackView = (path) => {
  try {
    let sid = sessionStorage.getItem('sq_sid')
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('sq_sid', sid) }
    const t0 = Date.now()
    sb.from('page_views').insert({ path, referrer: document.referrer||null, user_agent: navigator.userAgent, session_id: sid })
      .select('id').single().then(({ data }) => {
        if (!data?.id) return
        const send = () => { const s = Math.round((Date.now()-t0)/1000); navigator.sendBeacon(`https://srrxlvhggbhkoxiawcsg.supabase.co/rest/v1/page_views?id=eq.${data.id}`, new Blob([JSON.stringify({duration_seconds:s})],{type:'application/json'})) }
        window.addEventListener('beforeunload', send, {once:true})
        window.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') send() }, {once:true})
      })
  } catch(e) {}
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Blog — SmarterQuit | Quit Smoking & Vaping'
    trackView('/blog')
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Science-based guides on quitting smoking and vaping. How to quit, what happens to your body, why willpower fails, and more.')
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await sb
        .from('blog_posts')
        .select('slug, title, excerpt, reading_time, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (e) {
      console.error('Blog load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.white, fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.border}`, maxWidth: 900, margin: '0 auto' }}>
        <Link to="/" style={{ textDecoration: 'none', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, letterSpacing: '0.05em', color: S.white }}>
          Smarter<span style={{ color: S.green }}>Quit</span>
        </Link>
        <Link to="/" style={{ background: S.green, color: '#000', textDecoration: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 700 }}>
          Start for $19.99
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48, maxWidth: 600 }}>
          <div style={{ fontSize: 11, color: S.green, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            SmarterQuit Blog
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Science-based guides to quitting smoking and vaping
          </h1>
          <p style={{ color: S.muted, fontSize: 17, lineHeight: 1.7 }}>
            Evidence-backed articles on smoking cessation, vaping, nicotine addiction, and the neuroscience of habit change.
          </p>
        </div>

        {/* Posts grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: S.bg3, borderRadius: 16, height: 240, opacity: 0.4 }}/>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {posts.map((post) => {
              const cat = CATEGORIES[post.slug] || { tag: 'Article', color: S.muted }
              return (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article style={{
                    background: S.bg3,
                    border: `1px solid ${S.border}`,
                    borderRadius: 16,
                    padding: 24,
                    height: '100%',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = S.border}
                  >
                    {/* Category tag */}
                    <div style={{
                      display: 'inline-block',
                      background: `${cat.color}18`,
                      border: `1px solid ${cat.color}44`,
                      color: cat.color,
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 14,
                    }}>
                      {cat.tag}
                    </div>

                    <h2 style={{
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: S.white,
                      marginBottom: 12,
                    }}>
                      {post.title}
                    </h2>

                    <p style={{
                      color: S.muted,
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}>
                      {post.excerpt}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: S.muted }}>
                      <span>{fmtDate(post.published_at)}</span>
                      <span>{post.reading_time} min read</span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 64, background: S.bg3, border: `1px solid rgba(0,230,118,0.2)`, borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚭</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 24, marginBottom: 10 }}>
            Ready to quit for good?
          </h2>
          <p style={{ color: S.muted, fontSize: 16, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
            The 21-day science-based program. Built around your habits, your triggers, your reasons.
          </p>
          <Link to="/" style={{ display: 'inline-block', background: S.green, color: '#000', textDecoration: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 16, fontWeight: 800 }}>
            Start for $19.99 →
          </Link>
          <p style={{ color: S.muted, fontSize: 13, marginTop: 10 }}>Money-back guarantee</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['/', 'Home'], ['/blog', 'Blog'], ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/refund', 'Refund']].map(([href, label]) => (
            <Link key={href} to={href} style={{ color: S.muted, textDecoration: 'none', fontSize: 13 }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
