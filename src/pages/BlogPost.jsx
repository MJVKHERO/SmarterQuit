import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPost()
    window.scrollTo(0, 0)
    try {
      let sid = sessionStorage.getItem('sq_sid')
      if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('sq_sid', sid) }
      sb.from('page_views').insert({ path: `/blog/${slug}`, referrer: document.referrer||null, user_agent: navigator.userAgent, session_id: sid }).then(()=>{})
    } catch(e) {}
  }, [slug])

  const loadPost = async () => {
    setLoading(true)
    try {
      // Load current post
      const { data, error } = await sb
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle()

      if (error || !data) { navigate('/blog'); return }

      setPost(data)
      document.title = `${data.title} — SmarterQuit`
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', data.meta_description || data.excerpt || '')

      // Add canonical link
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = `https://smarterquit.com/blog/${slug}`

      // Load related posts
      const { data: rel } = await sb
        .from('blog_posts')
        .select('slug, title, excerpt, reading_time')
        .eq('published', true)
        .neq('slug', slug)
        .limit(3)
      setRelated(rel || [])

    } catch (e) {
      console.error('Post load error:', e)
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, color: S.white }}>
        Smarter<span style={{ color: S.green }}>Quit</span>
      </div>
    </div>
  )

  if (!post) return null

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.white, fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.border}` }}>
        <Link to="/" style={{ textDecoration: 'none', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, letterSpacing: '0.05em', color: S.white }}>
          Smarter<span style={{ color: S.green }}>Quit</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/blog" style={{ color: S.muted, textDecoration: 'none', fontSize: 14 }}>← Blog</Link>
          <Link to="/" style={{ background: S.green, color: '#000', textDecoration: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 700 }}>
            Start for $7.99
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: S.muted }}>{fmtDate(post.published_at)}</span>
          <span style={{ color: S.border }}>·</span>
          <span style={{ fontSize: 12, color: S.muted }}>{post.reading_time} min read</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginBottom: 20, color: S.white }}>
          {post.title}
        </h1>

        {/* Excerpt */}
        <p style={{ fontSize: 18, color: S.muted, lineHeight: 1.7, marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${S.border}` }}>
          {post.excerpt}
        </p>

        {/* Content */}
        <div
          style={{ lineHeight: 1.8, fontSize: 17 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Style injection for article content */}
        <style>{`
          article h2 {
            font-family: Georgia, serif;
            font-style: italic;
            font-size: 26px;
            font-weight: 700;
            color: #f0f4f8;
            margin: 44px 0 16px;
            line-height: 1.3;
          }
          article h3 {
            font-size: 20px;
            font-weight: 700;
            color: #f0f4f8;
            margin: 32px 0 12px;
          }
          article p {
            color: #8a9ab0;
            margin: 0 0 20px;
          }
          article ul, article ol {
            color: #8a9ab0;
            padding-left: 24px;
            margin: 0 0 20px;
          }
          article li {
            margin-bottom: 10px;
            line-height: 1.7;
          }
          article strong {
            color: #f0f4f8;
            font-weight: 700;
          }
          article em {
            color: #c0d0e0;
          }
          article a {
            color: #00e676;
          }
        `}</style>

        {/* CTA mid-article */}
        <div style={{ background: S.bg3, border: `1px solid rgba(0,230,118,0.2)`, borderRadius: 16, padding: '28px 24px', margin: '48px 0', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, marginBottom: 8 }}>
            Ready to use this method?
          </h3>
          <p style={{ color: S.muted, fontSize: 15, marginBottom: 20 }}>
            SmarterQuit is the 21-day program built on the science in this article. $7.99. Money-back guarantee.
          </p>
          <Link to="/" style={{ display: 'inline-block', background: S.green, color: '#000', textDecoration: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 800 }}>
            Start My Quit Journey →
          </Link>
        </div>

      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>More articles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {related.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: S.bg3, border: `1px solid ${S.border}`, borderRadius: 12, padding: 18, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = S.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = S.border}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: S.white, lineHeight: 1.4, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: S.muted }}>{p.reading_time} min read</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
