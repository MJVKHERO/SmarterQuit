import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

// Password is verified server-side via /api/admin-auth
// Set ADMIN_PASSWORD in Vercel → Settings → Environment Variables (no VITE_ prefix)

const T = {
  bg:"#080c10", bg2:"#0d1117", bg3:"#111820", bg4:"#161e28",
  green:"#00e676", greenDim:"rgba(0,230,118,0.10)", greenBorder:"rgba(0,230,118,0.25)",
  white:"#f0f4f8", muted:"#5a7a96", red:"#ff5252", gold:"#ffd600",
  blue:"#40c4ff", border:"rgba(255,255,255,0.07)",
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtMoney = (n) => n ? '$' + (n < 100 ? Number(n).toFixed(2) : Math.round(n).toLocaleString()) : '—'

function Stat({label, value, color}) {
  return (
    <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:'16px 20px',textAlign:'center'}}>
      <div style={{fontSize:28,fontWeight:800,color:color||T.white,lineHeight:1,marginBottom:4}}>{value}</div>
      <div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>
    </div>
  )
}

function Badge({children, color}) {
  return (
    <span style={{background:`${color}18`,border:`1px solid ${color}44`,color,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700,letterSpacing:'0.04em'}}>
      {children}
    </span>
  )
}

// ─── REVIEWS TAB ──────────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('pending') // pending | approved | all
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReviews() }, [filter])

  const loadReviews = async () => {
    setLoading(true)
    let q = sb.from('reviews').select('*').order('created_at', {ascending: false})
    if (filter === 'pending') q = q.eq('approved', false)
    if (filter === 'approved') q = q.eq('approved', true)
    const { data } = await q
    setReviews(data || [])
    setLoading(false)
  }

  const approve = async (id) => {
    await sb.from('reviews').update({approved: true}).eq('id', id)
    loadReviews()
  }

  const reject = async (id) => {
    if (!confirm('Delete this review?')) return
    await sb.from('reviews').delete().eq('id', id)
    loadReviews()
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[['pending','Pending'],['approved','Approved'],['all','All']].map(([v,l]) => (
          <button key={v} onClick={()=>setFilter(v)} style={{
            background:filter===v?T.green:T.bg3,
            color:filter===v?'#000':T.muted,
            border:`1px solid ${filter===v?T.green:T.border}`,
            borderRadius:8,padding:'7px 16px',fontSize:13,fontWeight:600,
            cursor:'pointer',fontFamily:'inherit'
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <p style={{color:T.muted}}>Loading...</p>
      ) : reviews.length === 0 ? (
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:32,textAlign:'center'}}>
          <p style={{color:T.muted}}>No {filter} reviews yet.</p>
        </div>
      ) : (
        reviews.map(r => (
          <div key={r.id} style={{background:T.bg3,border:`1px solid ${r.approved?T.greenBorder:T.border}`,borderRadius:12,padding:20,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:15}}>{r.name}</span>
                  {r.location && <span style={{fontSize:12,color:T.muted}}>📍 {r.location}</span>}
                  <span style={{color:T.gold,fontSize:13}}>{'★'.repeat(r.rating||5)}</span>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {r.days_completed && <Badge color={T.blue}>{r.days_completed} days free</Badge>}
                  {r.quit_type && <Badge color={T.green}>{r.quit_type}</Badge>}
                  {r.weekly_spend && <Badge color={T.gold}>${Math.round(r.weekly_spend*52)}/yr saved</Badge>}
                  <span style={{fontSize:11,color:T.muted}}>{fmtDate(r.created_at)}</span>
                </div>
              </div>
              {r.approved ? (
                <Badge color={T.green}>✓ Live</Badge>
              ) : (
                <Badge color={T.gold}>Pending</Badge>
              )}
            </div>

            <p style={{color:'rgba(240,244,248,0.85)',fontSize:14,lineHeight:1.7,fontStyle:'italic',marginBottom:14}}>
              "{r.review_text}"
            </p>

            <div style={{display:'flex',gap:8}}>
              {!r.approved && (
                <button onClick={()=>approve(r.id)} style={{
                  background:T.greenDim,border:`1px solid ${T.greenBorder}`,color:T.green,
                  borderRadius:8,padding:'7px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'
                }}>✓ Approve & publish</button>
              )}
              <button onClick={()=>reject(r.id)} style={{
                background:'rgba(255,82,82,0.08)',border:'1px solid rgba(255,82,82,0.2)',color:T.red,
                borderRadius:8,padding:'7px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'
              }}>✕ Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── ANALYTICS TAB ───────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7) // days

  useEffect(() => { loadAnalytics() }, [range])

  // Auto-refresh every 30 seconds for "live" feel
  useEffect(() => {
    const i = setInterval(loadAnalytics, 30000)
    return () => clearInterval(i)
  }, [range])

  const loadAnalytics = async () => {
    try {
      const since = new Date(Date.now() - range * 864e5).toISOString()

      // Total views in range
      const { count: totalViews } = await sb.from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since)

      // Unique sessions in range
      const { data: sessions } = await sb.from('page_views')
        .select('session_id')
        .gte('created_at', since)
      const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size

      // Views per page
      const { data: allViews } = await sb.from('page_views')
        .select('path, created_at, session_id, referrer')
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      const pageCounts = {}
      allViews?.forEach(v => {
        pageCounts[v.path] = (pageCounts[v.path] || 0) + 1
      })
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)

      // Views per hour (last 24h)
      const last24h = allViews?.filter(v =>
        new Date(v.created_at) > new Date(Date.now() - 864e5)
      )
      const hourBuckets = Array(24).fill(0)
      last24h?.forEach(v => {
        hourBuckets[new Date(v.created_at).getHours()]++
      })

      // Views per day in range
      const dayBuckets = {}
      allViews?.forEach(v => {
        const day = v.created_at?.split('T')[0]
        if (day) dayBuckets[day] = (dayBuckets[day] || 0) + 1
      })
      const dayData = Object.entries(dayBuckets).sort((a,b) => a[0].localeCompare(b[0]))

      // Top referrers
      const refCounts = {}
      allViews?.forEach(v => {
        if (v.referrer) {
          try {
            const host = new URL(v.referrer).hostname.replace('www.','')
            refCounts[host] = (refCounts[host] || 0) + 1
          } catch(e) {}
        }
      })
      const topRefs = Object.entries(refCounts).sort((a,b) => b[1]-a[1]).slice(0,5)

      // Live visitors (last 5 minutes)
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString()
      const { count: liveCount } = await sb.from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fiveMinsAgo)

      // Landing page conversion (views vs /app views)
      const landingViews = pageCounts['/'] || 0
      const appViews = pageCounts['/app'] || 0
      const convRate = landingViews > 0 ? ((appViews / landingViews) * 100).toFixed(1) : 0

      // Recent visits
      const recent = allViews?.slice(0, 20) || []

      setData({ totalViews, uniqueSessions, topPages, hourBuckets, dayData, topRefs, liveCount, landingViews, appViews, convRate, recent })
    } catch(e) {
      console.error('Analytics error:', e)
    }
    setLoading(false)
  }

  const fmtPath = (p) => p === '/' ? '🏠 Home' : p === '/app' ? '📱 App' : p.startsWith('/blog/') ? `📝 ${p.replace('/blog/','')}` : p

  const fmtHour = (h) => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' })

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })

  if (loading) return <p style={{color:T.muted,padding:'20px 0'}}>Loading analytics...</p>
  if (!data) return <p style={{color:T.red}}>Failed to load analytics.</p>

  const maxHour = Math.max(...data.hourBuckets, 1)
  const maxDay = Math.max(...data.dayData.map(d => d[1]), 1)

  return (
    <div>
      {/* Range selector + live indicator */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#00e676',boxShadow:'0 0 8px #00e676'}}/>
          <span style={{fontSize:13,color:T.green,fontWeight:700}}>
            {data.liveCount} visitor{data.liveCount !== 1 ? 's' : ''} in last 5 min
          </span>
        </div>
        <div style={{display:'flex',gap:6}}>
          {[[1,'24h'],[7,'7d'],[30,'30d']].map(([v,l]) => (
            <button key={v} onClick={() => setRange(v)} style={{
              background: range===v ? T.green : T.bg3,
              color: range===v ? '#000' : T.muted,
              border: `1px solid ${range===v ? T.green : T.border}`,
              borderRadius: 7, padding: '6px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
        {[
          {label:'Total views', value:data.totalViews||0, color:T.white},
          {label:'Unique visitors', value:data.uniqueSessions||0, color:T.blue},
          {label:'Landing views', value:data.landingViews||0, color:T.muted},
          {label:'App opens', value:data.appViews||0, color:T.green},
          {label:'Est. conv. rate', value:`${data.convRate}%`, color:data.convRate>2?T.green:T.gold},
        ].map(({label,value,color})=>(
          <div key={label} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
            <div style={{fontSize:26,fontWeight:800,color,lineHeight:1,marginBottom:4}}>{value}</div>
            <div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Hourly chart — last 24h */}
      <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:20,marginBottom:16}}>
        <div style={{fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:14}}>
          Visitors by hour (last 24h)
        </div>
        <div style={{display:'flex',alignItems:'flex-end',gap:3,height:60}}>
          {data.hourBuckets.map((v,i) => (
            <div key={i} title={`${fmtHour(i)}: ${v} views`} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{
                width:'100%',
                height: v > 0 ? `${Math.max(4,(v/maxHour)*56)}px` : '3px',
                background: v > 0 ? (v===Math.max(...data.hourBuckets)?T.green:'rgba(0,230,118,0.45)') : 'rgba(255,255,255,0.05)',
                borderRadius:2,
                transition:'height 0.3s',
              }}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:T.muted,marginTop:6}}>
          {['12am','3am','6am','9am','12pm','3pm','6pm','9pm'].map(l=>(
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      {/* Daily chart */}
      {data.dayData.length > 1 && (
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:14}}>
            Daily views
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:60}}>
            {data.dayData.map(([day,v]) => (
              <div key={day} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <div style={{
                  width:'100%',
                  height:`${Math.max(4,(v/maxDay)*56)}px`,
                  background:T.blue,borderRadius:2,
                }} title={`${fmtDate(day)}: ${v}`}/>
                <div style={{fontSize:8,color:T.muted,transform:'rotate(-45deg)',transformOrigin:'top left',whiteSpace:'nowrap',marginTop:2}}>
                  {fmtDate(day)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Top pages */}
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>Top pages</div>
          {data.topPages.length === 0 ? (
            <p style={{color:T.muted,fontSize:13}}>No data yet</p>
          ) : data.topPages.map(([path,count]) => {
            const maxCount = data.topPages[0][1]
            return (
              <div key={path} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:3}}>
                  <span style={{color:T.white,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'75%'}}>{fmtPath(path)}</span>
                  <span style={{color:T.green,fontWeight:700,flexShrink:0}}>{count}</span>
                </div>
                <div style={{height:4,background:T.bg2,borderRadius:2}}>
                  <div style={{height:'100%',width:`${(count/maxCount)*100}%`,background:T.green,borderRadius:2}}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Top referrers */}
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>Top sources</div>
          {data.topRefs.length === 0 ? (
            <p style={{color:T.muted,fontSize:13}}>No referrer data yet</p>
          ) : data.topRefs.map(([ref,count]) => (
            <div key={ref} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,fontSize:13}}>
              <span style={{color:T.white}}>{ref}</span>
              <span style={{color:T.blue,fontWeight:700}}>{count}</span>
            </div>
          ))}
          {data.topRefs.length > 0 && (
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:8,marginTop:4}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:T.muted}}>Direct / unknown</span>
                <span style={{color:T.muted}}>{(data.totalViews||0) - data.topRefs.reduce((a,[,c])=>a+c,0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent visits */}
      <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
        <div style={{fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>
          Recent visits (live — refreshes every 30s)
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead>
              <tr>
                {['Time','Page','Source'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'6px 10px',color:T.muted,fontWeight:600,borderBottom:`1px solid ${T.border}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent.map((v,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:'8px 10px',color:T.muted,whiteSpace:'nowrap'}}>{fmtTime(v.created_at)}</td>
                  <td style={{padding:'8px 10px',color:T.white}}>{fmtPath(v.path)}</td>
                  <td style={{padding:'8px 10px',color:T.muted,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {v.referrer ? (() => { try { return new URL(v.referrer).hostname.replace('www.','') } catch(e) { return 'direct' } })() : 'direct'}
                  </td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr><td colSpan={3} style={{padding:'16px 10px',color:T.muted,textAlign:'center'}}>No visits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── USERS TAB ────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({total:0, completed:0, active:0})

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const [intakeRes, progressRes] = await Promise.all([
        sb.from('intake').select('*').order('created_at', {ascending:false}).limit(100),
        sb.from('progress').select('session_token, completed_tasks, welcomed'),
      ])
      const intake = intakeRes.data || []
      const progress = progressRes.data || []
      const progMap = {}
      progress.forEach(p => { progMap[p.session_token] = p })

      const merged = intake.map(u => ({
        ...u,
        progress: progMap[u.session_token] || null,
        tasksCount: (progMap[u.session_token]?.completed_tasks || []).length,
      }))

      setUsers(merged)
      setStats({
        total: merged.length,
        completed: merged.filter(u => u.tasksCount >= 21).length,
        active: merged.filter(u => {
          const d = u.start_date || u.startDate
          if (!d) return false
          const days = Math.floor((Date.now() - new Date(d).getTime()) / 864e5)
          return days <= 21
        }).length,
      })
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }

  const daysSince = (d) => d ? Math.floor((Date.now()-new Date(d).getTime())/864e5) : null

  return (
    <div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        <Stat label="Total users" value={stats.total} color={T.white}/>
        <Stat label="Active (≤21 days)" value={stats.active} color={T.blue}/>
        <Stat label="Completed program" value={stats.completed} color={T.green}/>
      </div>

      {loading ? <p style={{color:T.muted}}>Loading...</p> : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Email','Type','Started','Day','Tasks','Spend/wk','Status'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'8px 12px',color:T.muted,fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i) => {
                const startDate = u.start_date || u.startDate
                const dayNum = startDate ? Math.min(daysSince(startDate)+1, 21) : null
                const isActive = startDate && daysSince(startDate) <= 21
                const isComplete = u.tasksCount >= 21
                return (
                  <tr key={u.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?'transparent':T.bg2}}>
                    <td style={{padding:'10px 12px',color:T.white}}>{u.email || <span style={{color:T.muted}}>—</span>}</td>
                    <td style={{padding:'10px 12px'}}>{u.quit_type || u.quitType ? <Badge color={T.green}>{u.quit_type||u.quitType}</Badge> : '—'}</td>
                    <td style={{padding:'10px 12px',color:T.muted}}>{fmtDate(startDate || u.created_at)}</td>
                    <td style={{padding:'10px 12px',color:T.blue,fontWeight:700}}>{dayNum ? `${dayNum}/21` : '—'}</td>
                    <td style={{padding:'10px 12px',color:T.white}}>{u.tasksCount}/21</td>
                    <td style={{padding:'10px 12px',color:T.gold}}>{fmtMoney(u.weekly_spend||u.weeklySpend)}</td>
                    <td style={{padding:'10px 12px'}}>
                      {isComplete ? <Badge color={T.green}>Complete</Badge>
                        : isActive ? <Badge color={T.blue}>Active</Badge>
                        : <Badge color={T.muted}>Inactive</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── BLOGS TAB ────────────────────────────────────────────────────────
function BlogsTab() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | post object
  const [form, setForm] = useState({slug:'',title:'',meta_description:'',excerpt:'',content:'',reading_time:5,published:true})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    setLoading(true)
    const { data } = await sb.from('blog_posts').select('id,slug,title,published,reading_time,published_at').order('published_at',{ascending:false})
    setPosts(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setForm({slug:'',title:'',meta_description:'',excerpt:'',content:'',reading_time:5,published:true})
    setEditing('new')
    setMsg('')
  }

  const openEdit = async (post) => {
    const { data } = await sb.from('blog_posts').select('*').eq('id', post.id).single()
    if (data) { setForm(data); setEditing(data) }
    setMsg('')
  }

  const save = async () => {
    if (!form.title || !form.slug || !form.content) { setMsg('Title, slug and content are required.'); return }
    setSaving(true)
    setMsg('')
    try {
      if (editing === 'new') {
        const { error } = await sb.from('blog_posts').insert({...form, published_at: new Date().toISOString()})
        if (error) throw error
        setMsg('✅ Post published!')
      } else {
        const { error } = await sb.from('blog_posts').update(form).eq('id', editing.id)
        if (error) throw error
        setMsg('✅ Post updated!')
      }
      loadPosts()
      setTimeout(() => setEditing(null), 1200)
    } catch(e) {
      setMsg(`❌ Error: ${e.message}`)
    }
    setSaving(false)
  }

  const togglePublish = async (post) => {
    await sb.from('blog_posts').update({published: !post.published}).eq('id', post.id)
    loadPosts()
  }

  const deletePost = async (post) => {
    if (!confirm(`Delete "${post.title}"?`)) return
    await sb.from('blog_posts').delete().eq('id', post.id)
    loadPosts()
  }

  const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

  if (editing !== null) return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>setEditing(null)} style={{background:T.bg3,border:`1px solid ${T.border}`,color:T.muted,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>← Back</button>
        <h2 style={{fontSize:18,fontWeight:700}}>{editing==='new'?'New post':'Edit post'}</h2>
      </div>

      {[
        ['Title', 'title', 'text', 'How to Quit Smoking in 21 Days'],
        ['Slug (URL)', 'slug', 'text', 'how-to-quit-smoking-21-days'],
        ['Meta description (SEO)', 'meta_description', 'text', '160 chars max'],
        ['Excerpt (shown in blog list)', 'excerpt', 'text', '1-2 sentences'],
      ].map(([label, field, type, placeholder]) => (
        <div key={field} style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{label}</label>
          <input
            type={type} value={form[field]||''} placeholder={placeholder}
            onChange={e => {
              const val = e.target.value
              setForm(f => ({...f, [field]: val, ...(field==='title'&&editing==='new'?{slug:slugify(val)}:{})}))
            }}
            style={{width:'100%',background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,color:T.white,padding:'10px 14px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
          />
        </div>
      ))}

      <div style={{marginBottom:16}}>
        <label style={{display:'block',fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>
          Content (HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;)
        </label>
        <textarea
          value={form.content||''} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
          rows={18} placeholder="<h2>Introduction</h2><p>Your content here...</p>"
          style={{width:'100%',background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,color:T.white,padding:'10px 14px',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box',resize:'vertical'}}
        />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div>
          <label style={{display:'block',fontSize:12,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Reading time (min)</label>
          <input type="number" value={form.reading_time||5} onChange={e=>setForm(f=>({...f,reading_time:+e.target.value}))}
            style={{width:'100%',background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,color:T.white,padding:'10px 14px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{display:'flex',alignItems:'flex-end',paddingBottom:2}}>
          <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:18,height:18,accentColor:T.green}}/>
            <span style={{fontSize:14,color:T.white}}>Published (visible on site)</span>
          </label>
        </div>
      </div>

      {msg && <p style={{color:msg.startsWith('✅')?T.green:T.red,fontSize:14,marginBottom:12}}>{msg}</p>}

      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>setEditing(null)} style={{background:T.bg3,border:`1px solid ${T.border}`,color:T.muted,borderRadius:10,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
        <button onClick={save} disabled={saving} style={{background:T.green,color:'#000',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.6:1}}>
          {saving?'Saving...':'Save post'}
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <p style={{color:T.muted,fontSize:14}}>{posts.length} posts total</p>
        <button onClick={openNew} style={{background:T.green,color:'#000',border:'none',borderRadius:8,padding:'8px 18px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
          + New post
        </button>
      </div>

      {loading ? <p style={{color:T.muted}}>Loading...</p> : posts.map(post => (
        <div key={post.id} style={{background:T.bg3,border:`1px solid ${post.published?T.border:'rgba(255,82,82,0.2)'}`,borderRadius:12,padding:'14px 16px',marginBottom:10,display:'flex',alignItems:'center',gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:14,color:T.white,marginBottom:3}}>{post.title}</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,color:T.muted}}>/blog/{post.slug}</span>
              <span style={{fontSize:11,color:T.muted}}>·</span>
              <span style={{fontSize:11,color:T.muted}}>{post.reading_time} min</span>
              <span style={{fontSize:11,color:T.muted}}>·</span>
              <span style={{fontSize:11,color:T.muted}}>{fmtDate(post.published_at)}</span>
            </div>
          </div>
          <Badge color={post.published?T.green:T.red}>{post.published?'Live':'Draft'}</Badge>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>openEdit(post)} style={{background:T.bg2,border:`1px solid ${T.border}`,color:T.muted,borderRadius:7,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Edit</button>
            <button onClick={()=>togglePublish(post)} style={{background:T.bg2,border:`1px solid ${T.border}`,color:post.published?T.red:T.green,borderRadius:7,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{post.published?'Unpublish':'Publish'}</button>
            <button onClick={()=>deletePost(post)} style={{background:'rgba(255,82,82,0.08)',border:'1px solid rgba(255,82,82,0.2)',color:T.red,borderRadius:7,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ADMIN APP ────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    if (sessionStorage.getItem('sq_admin')) setAuthed(true)
  }, [])

  useEffect(() => {
    if (authed && tab === 'overview') loadOverview()
  }, [authed, tab])

  const login = async () => {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.status === 429) {
        setPwError('too_many')
        return
      }
      const data = await res.json()
      if (data.ok) {
        sessionStorage.setItem('sq_admin', '1')
        setAuthed(true)
        setPwError(false)
      } else {
        setPwError('wrong')
      }
    } catch(e) {
      setPwError('wrong')
    }
  }

  const loadOverview = async () => {
    try {
      const [usersRes, reviewsRes, postsRes, cravingsRes] = await Promise.all([
        sb.from('intake').select('id', {count:'exact',head:true}),
        sb.from('reviews').select('id,approved', {count:'exact'}),
        sb.from('blog_posts').select('id,published', {count:'exact'}),
        sb.from('cravings').select('id', {count:'exact',head:true}),
      ])
      const reviews = reviewsRes.data || []
      setOverview({
        users: usersRes.count || 0,
        pendingReviews: reviews.filter(r=>!r.approved).length,
        approvedReviews: reviews.filter(r=>r.approved).length,
        publishedPosts: (postsRes.data||[]).filter(p=>p.published).length,
        totalCravings: cravingsRes.count || 0,
      })
    } catch(e) { console.error(e) }
  }

  // Login screen
  if (!authed) return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:360,width:'100%'}}>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:'0.05em',color:T.white,marginBottom:32,textAlign:'center'}}>
          Smarter<span style={{color:T.green}}>Quit</span> <span style={{color:T.muted,fontSize:16}}>Admin</span>
        </div>
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:16,padding:28}}>
          <input
            type="password" value={pw} onChange={e=>setPw(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&login()}
            placeholder="Admin password"
            style={{width:'100%',background:T.bg2,border:`1px solid ${pwError?T.red:T.border}`,borderRadius:10,color:T.white,padding:'14px 16px',fontSize:16,fontFamily:'inherit',outline:'none',boxSizing:'border-box',marginBottom:12}}
          />
          {pwError === 'wrong' && <p style={{color:T.red,fontSize:13,marginBottom:12}}>Wrong password</p>}
          {pwError === 'too_many' && <p style={{color:T.red,fontSize:13,marginBottom:12}}>Too many attempts. Try again in 15 minutes.</p>}
          <button onClick={login} style={{width:'100%',background:T.green,color:'#000',border:'none',borderRadius:10,padding:'14px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            Enter →
          </button>
        </div>
      </div>
    </div>
  )

  const TABS = [
    {id:'overview',  label:'📊 Overview'},
    {id:'analytics', label:'📈 Analytics'},
    {id:'users',     label:'👥 Users'},
    {id:'reviews',   label:'⭐ Reviews'},
    {id:'blog',      label:'📝 Blog'},
  ]

  return (
    <div style={{minHeight:'100vh',background:T.bg,color:T.white,fontFamily:'system-ui,sans-serif'}}>

      {/* Header */}
      <div style={{borderBottom:`1px solid ${T.border}`,padding:'0 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:20,letterSpacing:'0.05em'}}>
            Smarter<span style={{color:T.green}}>Quit</span> <span style={{color:T.muted,fontSize:14,fontFamily:'system-ui'}}>Admin</span>
          </div>
          <div style={{display:'flex',gap:4}}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:tab===t.id?T.bg3:'none',
                color:tab===t.id?T.white:T.muted,
                border:`1px solid ${tab===t.id?T.border:'transparent'}`,
                borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:tab===t.id?600:400,
                cursor:'pointer',fontFamily:'inherit',
              }}>{t.label}</button>
            ))}
          </div>
          <button onClick={()=>{sessionStorage.removeItem('sq_admin');setAuthed(false)}} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>

        {/* OVERVIEW */}
        {tab==='overview'&&(
          <div>
            <h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Overview</h1>
            {!overview ? <p style={{color:T.muted}}>Loading...</p> : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:32}}>
                  <Stat label="Total users" value={overview.users} color={T.white}/>
                  <Stat label="Cravings logged" value={overview.totalCravings} color={T.blue}/>
                  <Stat label="Pending reviews" value={overview.pendingReviews} color={overview.pendingReviews>0?T.gold:T.muted}/>
                  <Stat label="Live reviews" value={overview.approvedReviews} color={T.green}/>
                  <Stat label="Blog posts live" value={overview.publishedPosts} color={T.green}/>
                </div>

                {overview.pendingReviews > 0 && (
                  <div style={{background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.25)',borderRadius:12,padding:16,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:20}}>⭐</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,color:T.gold,marginBottom:2}}>{overview.pendingReviews} review{overview.pendingReviews>1?'s':''} waiting for approval</div>
                      <div style={{fontSize:13,color:T.muted}}>Go to the Reviews tab to approve or reject them.</div>
                    </div>
                    <button onClick={()=>setTab('reviews')} style={{background:'rgba(255,214,0,0.15)',border:'1px solid rgba(255,214,0,0.3)',color:T.gold,borderRadius:8,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                      Review now →
                    </button>
                  </div>
                )}

                <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:20}}>
                  <h3 style={{fontSize:14,fontWeight:600,color:T.muted,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Quick links</h3>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    {[
                      ['View live site', 'https://smarterquit.com'],
                      ['Supabase dashboard', 'https://supabase.com/dashboard'],
                      ['Stripe dashboard', 'https://dashboard.stripe.com'],
                      ['Resend emails', 'https://resend.com'],
                    ].map(([l,h]) => (
                      <a key={h} href={h} target="_blank" rel="noreferrer" style={{background:T.bg2,border:`1px solid ${T.border}`,color:T.muted,borderRadius:8,padding:'7px 14px',fontSize:13,textDecoration:'none'}}>
                        {l} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab==='users'     && <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Users</h1><UsersTab/></div>}
        {tab==='analytics' && <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Analytics</h1><AnalyticsTab/></div>}
        {tab==='reviews'   && <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Reviews</h1><ReviewsTab/></div>}
        {tab==='blog'      && <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Blog</h1><BlogsTab/></div>}

      </div>
    </div>
  )
}
