import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  "https://srrxlvhggbhkoxiawcsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU"
)

const C = {
  bg:'#f6f6f7', surface:'#ffffff', border:'#e3e3e8', border2:'#d1d1d6',
  text:'#1a1a1a', text2:'#6b7280', text3:'#9ca3af',
  green:'#008060', greenBg:'#f0faf7', greenBd:'#b7dfd5',
  blue:'#2563eb', blueBg:'#eff6ff', blueBd:'#bfdbfe',
  red:'#dc2626', redBg:'#fef2f2', redBd:'#fecaca',
  gold:'#d97706', goldBg:'#fffbeb', goldBd:'#fde68a',
  nav:'#1a1a2e', navText:'rgba(255,255,255,0.6)', navActive:'#ffffff',
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',-apple-system,sans-serif;background:${C.bg};color:${C.text};-webkit-font-smoothing:antialiased}
  .lay{display:flex;min-height:100vh}
  .nav{width:232px;background:${C.nav};flex-shrink:0;position:fixed;top:0;left:0;bottom:0;z-index:50;display:flex;flex-direction:column}
  .main{margin-left:232px;flex:1}
  .hdr{background:#fff;border-bottom:1px solid ${C.border};padding:0 28px;height:54px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40}
  .wrap{padding:28px;max-width:1200px}
  .card{background:#fff;border:1px solid ${C.border};border-radius:12px}
  .card-h{padding:14px 20px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .card-b{padding:20px}
  .ch{padding:14px 20px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .cb{padding:20px}
  .ch{padding:14px 20px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .cb{padding:20px}
  .bgg{background:${C.bg}}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${C.text2};padding:0 16px 10px}
  td{padding:11px 16px;border-top:1px solid ${C.border};font-size:13px;color:${C.text}}
  tr:hover td{background:${C.bg}}
  input,textarea,select{font-family:'Inter',sans-serif}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 3px ${C.greenBd}}50%{box-shadow:0 0 0 6px ${C.greenBd}}}
  @keyframes livepulse{0%,100%{opacity:1}50%{opacity:.3}}
  .fade{animation:fadein .25s ease both}
`

const fmtMoney = n => n ? '$'+( n<100 ? Number(n).toFixed(2) : Math.round(n).toLocaleString() ) : '—'
const fmtDate  = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtTime  = d => d ? new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '—'
const fmtHour  = h => h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`
const fmtPath  = p => p==='/'?'Home':p==='/app'?'App':p.startsWith('/blog/')?`Blog: ${p.replace('/blog/','')}`:p

const Badge = ({type,children}) => {
  const map={green:`background:${C.greenBg};color:${C.green};border:1px solid ${C.greenBd}`,blue:`background:${C.blueBg};color:${C.blue};border:1px solid #bfdbfe`,red:`background:${C.redBg};color:${C.red};border:1px solid #fecaca`,gold:`background:${C.goldBg};color:${C.gold};border:1px solid #fde68a`,gray:'background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb'}
  return <span style={{...(()=>{const s={};(map[type]||map.gray).split(';').forEach(r=>{const[k,v]=r.split(':');if(k&&v){const key=k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());s[key]=v}});return s})(),display:'inline-flex',alignItems:'center',borderRadius:6,padding:'3px 8px',fontSize:11,fontWeight:600}}>{children}</span>
}

const Btn = ({variant='primary',children,onClick,disabled,style={}}) => {
  const base={border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:disabled?'not-allowed':'pointer',fontFamily:'inherit',opacity:disabled?.6:1,transition:'all .15s',...style}
  const v={primary:{background:C.green,color:'#fff'},secondary:{background:'#fff',color:C.text,border:`1px solid ${C.border2}`},danger:{background:C.redBg,color:C.red,border:'1px solid #fecaca'}}
  return <button style={{...base,...(v[variant]||v.primary)}} onClick={onClick} disabled={disabled}>{children}</button>
}

function Spinner(){return <div style={{width:16,height:16,border:`2px solid ${C.border}`,borderTopColor:C.green,borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}

function NavItem({icon,label,active,onClick,badge}){
  return(
    <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',background:active?'rgba(255,255,255,0.12)':'transparent',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',color:active?C.navActive:C.navText,fontSize:13,fontWeight:active?600:400,transition:'all .15s',marginBottom:2}}>
      <span style={{fontSize:16,width:22,textAlign:'center'}}>{icon}</span>
      <span style={{flex:1,textAlign:'left'}}>{label}</span>
      {badge>0&&<span style={{background:'#ef4444',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{badge}</span>}
    </button>
  )
}

function Sparkline({data,color=C.green,h=36,w=100}){
  if(!data||data.length<2)return null
  const max=Math.max(...data,1)
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-(v/max)*(h-4)}`).join(' ')
  return <svg width={w} height={h} style={{overflow:'visible'}}><polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/></svg>
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────
function AnalyticsTab(){
  const [d,setD]=useState(null)
  const [loading,setLoading]=useState(true)
  const [range,setRange]=useState(7)
  const [stamp,setStamp]=useState(null)

  const load=useCallback(async()=>{
    try{
      const since=new Date(Date.now()-range*864e5).toISOString()
      const fiveMin=new Date(Date.now()-5*60000).toISOString()
      const[{data:all,error:qErr},{data:liveRows}]=await Promise.all([
        sb.from('page_views').select('path,created_at,session_id,referrer').gte('created_at',since).order('created_at',{ascending:false}),
        sb.from('page_views').select('session_id').gte('created_at',fiveMin),
      ])
      if(qErr)throw qErr
      const views=all||[]

      // Duration data — fetched separately, gracefully handles missing column
      let durViews=[]
      try{
        const{data:dv}=await sb.from('page_views').select('path,duration_seconds,session_id').gte('created_at',since).not('duration_seconds','is',null)
        durViews=dv||[]
      }catch(e){}

      // Live unique visitors
      const liveUnique=new Set((liveRows||[]).map(v=>v.session_id)).size

      // Unique sessions
      const uniqueSessions=new Set(views.map(v=>v.session_id)).size

      // Page counts
      const pageCounts={}
      views.forEach(v=>{pageCounts[v.path]=(pageCounts[v.path]||0)+1})
      const topPages=Object.entries(pageCounts).sort((a,b)=>b[1]-a[1]).slice(0,8)

      // Hourly (last 24h)
      const last24=views.filter(v=>new Date(v.created_at)>new Date(Date.now()-864e5))
      const hourBuckets=Array(24).fill(0)
      last24.forEach(v=>{hourBuckets[new Date(v.created_at).getHours()]++})

      // Daily unique
      const dayUniq={}
      views.forEach(v=>{
        const dd=v.created_at?.split('T')[0]
        if(dd){if(!dayUniq[dd])dayUniq[dd]=new Set();dayUniq[dd].add(v.session_id)}
      })
      const dayArr=Object.entries(dayUniq).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,s])=>[d,s.size])

      // Referrers — with Pinterest highlighted
      const refMap={}
      views.forEach(v=>{if(v.referrer){try{const h=new URL(v.referrer).hostname.replace('www.','');refMap[h]=(refMap[h]||0)+1}catch(e){}}})
      const topRefs=Object.entries(refMap).sort((a,b)=>b[1]-a[1]).slice(0,8)
      const pinterestViews=views.filter(v=>v.referrer&&v.referrer.includes('pinterest')).length

      // Conversions
      const land=pageCounts['/']||0
      const calcV=pageCounts['/calc']||0
      const quizV=pageCounts['/quiz']||0
      const app=pageCounts['/app']||0
      const blogTotal=Object.entries(pageCounts).filter(([p])=>p.startsWith('/blog/')).reduce((a,[,c])=>a+c,0)
      const conv=land>0?((app/land)*100).toFixed(1):'—'

      // Bounce rate — sessions with only 1 page view
      const sessionPages={}
      views.forEach(v=>{if(!sessionPages[v.session_id])sessionPages[v.session_id]=new Set();sessionPages[v.session_id].add(v.path)})
      const bounced=Object.values(sessionPages).filter(s=>s.size===1).length
      const bounceRate=uniqueSessions>0?Math.round((bounced/uniqueSessions)*100):0

      // Avg duration per page — uses separate durViews fetch
      const durByPage={}
      durViews.forEach(v=>{
        if(v.duration_seconds>0&&v.duration_seconds<3600){
          if(!durByPage[v.path])durByPage[v.path]=[]
          durByPage[v.path].push(v.duration_seconds)
        }
      })
      const avgDur={}
      Object.entries(durByPage).forEach(([p,arr])=>{avgDur[p]=Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)})
      const overallAvgDur=Object.values(avgDur).length>0?Math.round(Object.values(avgDur).reduce((a,b)=>a+b,0)/Object.values(avgDur).length):null

      // Sparkline
      const spark=Array(7).fill(0)
      const tod=new Date();tod.setHours(0,0,0,0)
      views.forEach(v=>{const dd=new Date(v.created_at);dd.setHours(0,0,0,0);const diff=Math.floor((tod-dd)/864e5);if(diff>=0&&diff<7)spark[6-diff]++})

      setD({total:views.length,uniqueSessions,liveUnique,topPages,hourBuckets,dayArr,topRefs,land,calcV,quizV,app,blogTotal,conv,bounceRate,avgDur,overallAvgDur,spark,pinterestViews,recent:views.slice(0,40)})
      setStamp(new Date())
    }catch(e){console.error(e)}
    setLoading(false)
  },[range])

  useEffect(()=>{setLoading(true);load()},[load])
  useEffect(()=>{const i=setInterval(load,30000);return()=>clearInterval(i)},[load])

  if(loading)return <div style={{display:'flex',alignItems:'center',gap:10,padding:'48px 0',color:C.text2}}><div className="spin"/><span>Loading analytics…</span></div>
  if(!d)return <p style={{color:C.red}}>Failed to load.</p>

  const maxH=Math.max(...d.hourBuckets,1)
  const maxD=Math.max(...d.dayArr.map(r=>r[1]),1)
  const curHour=new Date().getHours()
  const fmtDur=(s)=>{if(!s)return'—';if(s<60)return`${s}s`;return`${Math.floor(s/60)}m ${s%60}s`}

  return(
    <div className="fade">

      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:8,padding:'8px 16px'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:C.green,display:'inline-block',animation:'livepulse 2s ease infinite'}}/>
          <span style={{fontSize:13,fontWeight:600,color:C.green}}>
            {d.liveUnique} unique visitor{d.liveUnique!==1?'s':''} right now
          </span>
          <span style={{fontSize:11,color:C.green,opacity:.65}}>· last 5 min{stamp?` · ${fmtTime(stamp)}`:''}</span>
        </div>
        <div style={{display:'flex',gap:4}}>
          {[[1,'24h'],[7,'7 days'],[30,'30 days']].map(([v,l])=>(
            <button key={v} onClick={()=>setRange(v)} style={{background:range===v?C.text:C.surface,color:range===v?'#fff':C.text2,border:`1px solid ${range===v?C.text:C.border2}`,borderRadius:7,padding:'6px 14px',fontSize:12,fontWeight:500,cursor:'pointer',transition:'all .15s'}}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'16px 18px'}}>
          <div style={{fontSize:11,fontWeight:500,color:C.text2,marginBottom:8}}>Page views</div>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:26,fontWeight:700,color:C.blue,lineHeight:1}}>{d.total}</div>
              <div style={{fontSize:11,color:C.text3,marginTop:3}}>all pages</div>
            </div>
            <Sparkline data={d.spark} color={C.blue}/>
          </div>
        </div>
        {[
          {label:'Unique visitors', val:d.uniqueSessions, sub:'by session',       color:C.green},
          {label:'Bounce rate',     val:`${d.bounceRate}%`, sub:'single-page visits', color:d.bounceRate>70?C.red:d.bounceRate>50?C.gold:C.green},
          {label:'Avg. time on site',val:fmtDur(d.overallAvgDur), sub:'across all pages', color:C.text},
          {label:'Pinterest visits', val:d.pinterestViews, sub:'from ads & organic', color:'#e60023'},
          {label:'Conv. rate',       val:`${d.conv}%`,    sub:'landing → app',    color:parseFloat(d.conv)>2?C.green:C.gold},
        ].map(({label,val,sub,color})=>(
          <div key={label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'16px 18px'}}>
            <div style={{fontSize:11,fontWeight:500,color:C.text2,marginBottom:8}}>{label}</div>
            <div style={{fontSize:24,fontWeight:700,color,lineHeight:1,marginBottom:3}}>{val}</div>
            <div style={{fontSize:11,color:C.text3}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* FUNNEL */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-h">
          <span style={{fontSize:13,fontWeight:600}}>Conversion funnel</span>
          <span style={{fontSize:11,color:C.text3}}>Where do people go — and where do they drop off?</span>
        </div>
        <div className="card-b">
          <div style={{display:'flex',alignItems:'stretch',gap:2}}>
            {[
              {label:'Landing',    val:d.land,   color:C.blue,  icon:'🏠'},
              {label:'Blog',       val:d.blogTotal,color:'#7c3aed',icon:'📝'},
              {label:'Calculator', val:d.calcV,  color:C.gold,  icon:'🧮'},
              {label:'Quiz',       val:d.quizV,  color:'#06b6d4',icon:'🧠'},
              {label:'App (paid)', val:d.app,    color:C.green, icon:'💳'},
            ].map(({label,val,color,icon},i,arr)=>{
              const prev=i===0?null:arr[i-1].val
              const pct=prev&&prev>0?Math.round((val/prev)*100):null
              const maxVal=arr[0].val||1
              return(
                <div key={label} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.text2,textAlign:'center'}}>{icon} {label}</div>
                  <div style={{width:'100%',background:C.bg,borderRadius:4,height:80,display:'flex',alignItems:'flex-end',overflow:'hidden'}}>
                    <div style={{width:'100%',height:`${Math.max(4,((val||0)/maxVal)*100)}%`,background:color,borderRadius:'4px 4px 0 0',transition:'height .4s',opacity:0.85}}/>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color}}>{val||0}</div>
                  {pct!==null&&(
                    <div style={{fontSize:10,color:pct>30?C.green:pct>10?C.gold:C.red,fontWeight:600,background:pct>30?C.greenBg:pct>10?C.goldBg:C.redBg,border:`1px solid ${pct>30?C.greenBd:pct>10?C.goldBd:C.redBd}`,borderRadius:4,padding:'2px 6px'}}>
                      {pct}% through
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card">
          <div className="card-h"><span style={{fontSize:13,fontWeight:600}}>Visitors by hour</span><span style={{fontSize:11,color:C.text3}}>Last 24h · green = now</span></div>
          <div className="card-b">
            <div style={{display:'flex',alignItems:'flex-end',gap:2,height:72}}>
              {d.hourBuckets.map((v,i)=>(
                <div key={i} title={`${fmtHour(i)}: ${v}`} style={{flex:1,height:`${Math.max(2,(v/maxH)*70)}px`,background:i===curHour?C.green:v>0?'#93c5fd':C.border,borderRadius:'3px 3px 0 0',transition:'height .4s'}}/>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:9,color:C.text3}}>
              {['12am','3am','6am','9am','12pm','3pm','6pm','9pm'].map(l=><span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><span style={{fontSize:13,fontWeight:600}}>Daily unique visitors</span></div>
          <div className="card-b">
            {d.dayArr.length<2
              ?<div style={{height:72,display:'flex',alignItems:'center',justifyContent:'center',color:C.text3,fontSize:13}}>Not enough data yet</div>
              :<>
                <div style={{display:'flex',alignItems:'flex-end',gap:4,height:72}}>
                  {d.dayArr.map(([dd,v])=>(
                    <div key={dd} title={`${fmtShort(dd)}: ${v}`} style={{flex:1,height:`${Math.max(2,(v/maxD)*70)}px`,background:'#60a5fa',borderRadius:'3px 3px 0 0'}}/>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:9,color:C.text3}}>
                  {d.dayArr.length>0&&<span>{fmtShort(d.dayArr[0][0])}</span>}
                  {d.dayArr.length>1&&<span>{fmtShort(d.dayArr[d.dayArr.length-1][0])}</span>}
                </div>
              </>
            }
          </div>
        </div>
      </div>

      {/* Pages + time on page */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card">
          <div className="card-h"><span style={{fontSize:13,fontWeight:600}}>Top pages</span></div>
          <div style={{padding:'6px 0'}}>
            {d.topPages.length===0
              ?<p style={{padding:'12px 20px',color:C.text3,fontSize:13}}>No data yet</p>
              :d.topPages.map(([path,count],i)=>{
                const pct=Math.round((count/d.topPages[0][1])*100)
                const dur=d.avgDur[path]
                return(
                  <div key={path} style={{padding:'8px 20px',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${pct}%`,background:'rgba(37,99,235,0.05)'}}/>
                    <div style={{position:'relative',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:500}}>{fmtPath(path)}</span>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {dur&&<span style={{fontSize:11,color:C.text3}}>⏱ {fmtDur(dur)}</span>}
                        <span style={{fontSize:12,color:C.text2}}>{count}</span>
                        {i===0&&<Badge type="green">Top</Badge>}
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span style={{fontSize:13,fontWeight:600}}>Traffic sources</span></div>
          <div style={{padding:'6px 0'}}>
            {d.topRefs.length===0
              ?<p style={{padding:'12px 20px',color:C.text3,fontSize:13}}>No referrer data yet.</p>
              :d.topRefs.map(([ref,count])=>{
                const pct=Math.round((count/d.topRefs[0][1])*100)
                const isPinterest=ref.includes('pinterest')
                return(
                  <div key={ref} style={{padding:'8px 20px',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${pct}%`,background:isPinterest?'rgba(230,0,35,0.05)':'rgba(217,119,6,0.05)'}}/>
                    <div style={{position:'relative',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:13,fontWeight:500}}>{ref}</span>
                        {isPinterest&&<Badge type="red">Pinterest</Badge>}
                      </div>
                      <span style={{fontSize:12,color:C.text2}}>{count}</span>
                    </div>
                  </div>
                )
              })
            }
            {d.topRefs.length>0&&(
              <div style={{padding:'8px 20px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,color:C.text3}}>Direct / unknown</span>
                <span style={{fontSize:12,color:C.text3}}>{d.total-d.topRefs.reduce((a,[,c])=>a+c,0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent visitors */}
      <div className="card">
        <div className="card-h">
          <span style={{fontSize:13,fontWeight:600}}>Recent visitors</span>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:C.green,display:'inline-block',animation:'livepulse 2s ease infinite'}}/>
            <span style={{fontSize:11,color:C.text3}}>Live · refreshes every 30s</span>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr><th>Time</th><th>Page</th><th>Time on page</th><th>Source</th><th>Session</th></tr></thead>
            <tbody>
              {d.recent.map((v,i)=>(
                <tr key={i}>
                  <td style={{color:C.text2,whiteSpace:'nowrap',fontSize:12}}>{fmtTime(v.created_at)}</td>
                  <td style={{fontWeight:500}}>{fmtPath(v.path)}</td>
                  <td style={{color:C.text2,fontSize:12}}>
                    —
                  </td>
                  <td style={{color:C.text2,fontSize:12}}>
                    {v.referrer?(()=>{try{const h=new URL(v.referrer).hostname.replace('www.','');return h.includes('pinterest')?<span style={{color:'#e60023',fontWeight:600}}>📌 {h}</span>:h}catch(e){return'direct'}})():'direct'}
                  </td>
                  <td style={{color:C.text3,fontFamily:'monospace',fontSize:11}}>{v.session_id?.slice(0,8)}…</td>
                </tr>
              ))}
              {d.recent.length===0&&<tr><td colSpan={5} style={{textAlign:'center',color:C.text3,padding:32}}>No visits yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────
function OverviewTab({onNav}){
  const [stats,setStats]=useState(null)
  const [recent,setRecent]=useState([])

  useEffect(()=>{
    Promise.all([
      sb.from('intake').select('*',{count:'exact',head:true}),
      sb.from('cravings').select('*',{count:'exact',head:true}),
      sb.from('reviews').select('id,approved'),
      sb.from('blog_posts').select('id,published'),
      sb.from('intake').select('email,created_at,quit_type').order('created_at',{ascending:false}).limit(5),
    ]).then(([{count:users},{count:cravings},rev,posts,rec])=>{
      const rv=rev.data||[],ps=posts.data||[]
      setStats({users:users||0,cravings:cravings||0,pending:rv.filter(r=>!r.approved).length,approved:rv.filter(r=>r.approved).length,posts:ps.filter(p=>p.published).length})
      setRecent(rec.data||[])
    })
  },[])

  return(
    <div className="fade">
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:24}}>
        {stats&&[
          {icon:'👥',label:'Total users',     val:stats.users,    color:C.blue,  tab:'users'},
          {icon:'💪',label:'Cravings logged', val:stats.cravings, color:C.green, tab:null},
          {icon:'⭐',label:'Pending reviews', val:stats.pending,  color:C.gold,  tab:'reviews'},
          {icon:'✅',label:'Live reviews',    val:stats.approved, color:C.green, tab:'reviews'},
          {icon:'📝',label:'Blog posts',      val:stats.posts,    color:C.blue,  tab:'blog'},
        ].map(({icon,label,val,color,tab})=>(
          <div key={label} onClick={tab?()=>onNav(tab):undefined} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:12,padding:20,cursor:tab?'pointer':'default',transition:'box-shadow .15s'}}
            onMouseEnter={e=>{if(tab)e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}>
            <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
            <div style={{fontSize:28,fontWeight:700,color,lineHeight:1,marginBottom:4}}>{val}</div>
            <div style={{fontSize:12,color:C.text2}}>{label}</div>
          </div>
        ))}
      </div>

      {stats?.pending>0&&(
        <div style={{background:C.goldBg,border:'1px solid #fde68a',borderRadius:10,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20}}>⭐</span>
            <div>
              <div style={{fontWeight:600,fontSize:13,color:C.gold}}>{stats.pending} review{stats.pending>1?'s':''} waiting for approval</div>
              <div style={{fontSize:12,color:'#92400e',marginTop:1}}>Approve them to build social proof on your landing page</div>
            </div>
          </div>
          <Btn variant="secondary" style={{fontSize:12,padding:'6px 12px'}} onClick={()=>onNav('reviews')}>Review now →</Btn>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="card">
          <div className="ch">
            <span style={{fontSize:13,fontWeight:600}}>Recent signups</span>
            <Btn variant="secondary" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>onNav('users')}>View all</Btn>
          </div>
          <table>
            <thead><tr><th>Email</th><th>Type</th><th>Joined</th></tr></thead>
            <tbody>
              {recent.map((u,i)=>(
                <tr key={i}>
                  <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>{u.email||<span style={{color:C.text3}}>—</span>}</td>
                  <td>{u.quit_type?<Badge type={u.quit_type==='vaping'?'blue':u.quit_type==='both'?'gold':'green'}>{u.quit_type}</Badge>:'—'}</td>
                  <td style={{color:C.text2,whiteSpace:'nowrap',fontSize:12}}>{fmtDate(u.created_at)}</td>
                </tr>
              ))}
              {recent.length===0&&<tr><td colSpan={3} style={{color:C.text3,textAlign:'center',padding:'20px'}}>No users yet</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="ch"><span style={{fontSize:13,fontWeight:600}}>Quick links</span></div>
          <div style={{padding:'4px 0'}}>
            {[['🌐','Live site','https://smarterquit.com'],['💳','Stripe','https://dashboard.stripe.com'],['🗄️','Supabase','https://supabase.com/dashboard'],['📧','Resend','https://resend.com'],['📌','Pinterest Ads','https://ads.pinterest.com']].map(([icon,label,url])=>(
              <a key={url} href={url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 20px',color:C.text,textDecoration:'none',fontSize:13,transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{fontSize:16}}>{icon}</span><span style={{flex:1}}>{label}</span><span style={{color:C.text3,fontSize:11}}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── REVIEWS ───────────────────────────────────────────────────────────
function ReviewsTab(){
  const [reviews,setReviews]=useState([])
  const [filter,setFilter]=useState('pending')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[filter])

  const load=async()=>{
    setLoading(true)
    let q=sb.from('reviews').select('*').order('created_at',{ascending:false})
    if(filter==='pending') q=q.eq('approved',false)
    if(filter==='approved') q=q.eq('approved',true)
    const{data}=await q; setReviews(data||[]); setLoading(false)
  }

  const approve=async id=>{await sb.from('reviews').update({approved:true}).eq('id',id);load()}
  const del=async id=>{if(!confirm('Delete?'))return;await sb.from('reviews').delete().eq('id',id);load()}

  return(
    <div className="fade">
      <div style={{display:'flex',gap:4,marginBottom:20}}>
        {[['pending','Pending'],['approved','Approved'],['all','All']].map(([v,l])=>(
          <Btn key={v} variant={filter===v?'primary':'secondary'} style={{fontSize:12,padding:'6px 14px'}} onClick={()=>setFilter(v)}>{l}</Btn>
        ))}
      </div>
      {loading?<div style={{display:'flex',gap:8,alignItems:'center',color:C.text2,padding:'20px 0'}}><Spinner/>Loading...</div>
        :reviews.length===0?<div className="card" style={{padding:48,textAlign:'center'}}><div style={{fontSize:36,marginBottom:12}}>⭐</div><p style={{color:C.text2}}>No {filter} reviews</p></div>
        :reviews.map(r=>(
          <div key={r.id} className="card fade" style={{marginBottom:12}}>
            <div style={{padding:'16px 20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:10}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{fontWeight:600,fontSize:14}}>{r.name}</span>
                    {r.location&&<span style={{fontSize:12,color:C.text2}}>📍{r.location}</span>}
                    <span style={{color:'#f59e0b'}}>{('★').repeat(r.rating||5)}</span>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {r.days_completed&&<Badge type="blue">{r.days_completed} days free</Badge>}
                    {r.quit_type&&<Badge type="green">{r.quit_type}</Badge>}
                    {r.weekly_spend&&<Badge type="gold">${Math.round(r.weekly_spend*52)}/yr saved</Badge>}
                    <span style={{fontSize:11,color:C.text3,alignSelf:'center'}}>{fmtDate(r.created_at)}</span>
                  </div>
                </div>
                <Badge type={r.approved?'green':'gold'}>{r.approved?'Live':'Pending'}</Badge>
              </div>
              <p style={{color:C.text2,fontSize:14,lineHeight:1.65,fontStyle:'italic',marginBottom:14}}>"{r.review_text}"</p>
              <div style={{display:'flex',gap:8}}>
                {!r.approved&&<Btn variant="primary" style={{fontSize:12,padding:'6px 14px'}} onClick={()=>approve(r.id)}>✓ Approve &amp; publish</Btn>}
                <Btn variant="danger" style={{fontSize:12,padding:'6px 12px'}} onClick={()=>del(r.id)}>Delete</Btn>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ─── USERS ─────────────────────────────────────────────────────────────
function UsersTab(){
  const [users,setUsers]=useState([])
  const [loading,setLoading]=useState(true)
  const [stats,setStats]=useState({total:0,completed:0,active:0})

  useEffect(()=>{
    Promise.all([
      sb.from('intake').select('*').order('created_at',{ascending:false}).limit(100),
      sb.from('progress').select('session_token,completed_tasks'),
    ]).then(([ir,pr])=>{
      const intake=ir.data||[],prog=pr.data||[]
      const pm={}; prog.forEach(p=>{pm[p.session_token]=p})
      const m=intake.map(u=>({...u,tasksCount:(pm[u.session_token]?.completed_tasks||[]).length}))
      setUsers(m)
      setStats({total:m.length,completed:m.filter(u=>u.tasksCount>=21).length,active:m.filter(u=>{const d=u.start_date||u.startDate;return d&&Math.floor((Date.now()-new Date(d).getTime())/864e5)<=21}).length})
      setLoading(false)
    })
  },[])

  return(
    <div className="fade">
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[{l:'Total users',v:stats.total,c:C.text},{l:'Active in program',v:stats.active,c:C.blue},{l:'Completed 21 days',v:stats.completed,c:C.green}].map(({l,v,c})=>(
          <div key={l} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:12,padding:18}}>
            <div style={{fontSize:26,fontWeight:700,color:c,marginBottom:4}}>{v}</div>
            <div style={{fontSize:12,color:C.text2}}>{l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        {loading?<div style={{display:'flex',gap:8,alignItems:'center',color:C.text2,padding:'20px'}}><Spinner/>Loading...</div>:(
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Email</th><th>Type</th><th>Started</th><th>Day</th><th>Tasks</th><th>Spend/wk</th><th>Status</th></tr></thead>
              <tbody>
                {users.map((u,i)=>{
                  const start=u.start_date||u.startDate
                  const dn=start?Math.min(Math.floor((Date.now()-new Date(start).getTime())/864e5)+1,21):null
                  const isActive=start&&Math.floor((Date.now()-new Date(start).getTime())/864e5)<=21
                  const isDone=u.tasksCount>=21
                  return(
                    <tr key={i}>
                      <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>{u.email||<span style={{color:C.text3}}>—</span>}</td>
                      <td>{u.quit_type?<Badge type={u.quit_type==='vaping'?'blue':u.quit_type==='both'?'gold':'green'}>{u.quit_type}</Badge>:'—'}</td>
                      <td style={{color:C.text2,whiteSpace:'nowrap',fontSize:12}}>{fmtDate(start||u.created_at)}</td>
                      <td style={{fontWeight:600,color:C.blue}}>{dn?`${dn}/21`:'—'}</td>
                      <td style={{color:C.text2}}>{u.tasksCount}/21</td>
                      <td style={{color:C.text2}}>{u.weekly_spend?`$${u.weekly_spend}`:'—'}</td>
                      <td><Badge type={isDone?'green':isActive?'blue':'gray'}>{isDone?'Complete':isActive?'Active':'Inactive'}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BLOG ──────────────────────────────────────────────────────────────
function BlogTab(){
  const [posts,setPosts]=useState([])
  const [loading,setLoading]=useState(true)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({slug:'',title:'',meta_description:'',excerpt:'',content:'',reading_time:5,published:true})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState('')

  useEffect(()=>{ load() },[])

  const load=async()=>{ setLoading(true); const{data}=await sb.from('blog_posts').select('id,slug,title,published,reading_time,published_at').order('published_at',{ascending:false}); setPosts(data||[]); setLoading(false) }
  const openNew=()=>{ setForm({slug:'',title:'',meta_description:'',excerpt:'',content:'',reading_time:5,published:true}); setEditing('new'); setMsg('') }
  const openEdit=async post=>{ const{data}=await sb.from('blog_posts').select('*').eq('id',post.id).single(); if(data){setForm(data);setEditing(data)}; setMsg('') }
  const slugify=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  const save=async()=>{
    if(!form.title||!form.slug||!form.content){setMsg('Title, slug and content are required.');return}
    setSaving(true);setMsg('')
    try{
      if(editing==='new'){const{error}=await sb.from('blog_posts').insert({...form,published_at:new Date().toISOString()});if(error)throw error;setMsg('✅ Published!')}
      else{const{error}=await sb.from('blog_posts').update(form).eq('id',editing.id);if(error)throw error;setMsg('✅ Updated!')}
      load();setTimeout(()=>setEditing(null),1200)
    }catch(e){setMsg(`Error: ${e.message}`)}
    setSaving(false)
  }
  const toggle=async post=>{await sb.from('blog_posts').update({published:!post.published}).eq('id',post.id);load()}
  const del=async post=>{if(!confirm(`Delete "${post.title}"?`))return;await sb.from('blog_posts').delete().eq('id',post.id);load()}

  const inp=(ph,field,type='text')=>(
    <input type={type} placeholder={ph} value={form[field]||''} onChange={e=>{const v=e.target.value;setForm(f=>({...f,[field]:v,...(field==='title'&&editing==='new'?{slug:slugify(v)}:{})}))} } style={{width:'100%',border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 12px',fontSize:13,fontFamily:'inherit',outline:'none',color:C.text,background:'#fff'}}/>
  )

  if(editing!==null)return(
    <div className="fade">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <Btn variant="secondary" onClick={()=>setEditing(null)}>← Back</Btn>
        <h2 style={{fontSize:17,fontWeight:600}}>{editing==='new'?'New post':'Edit post'}</h2>
      </div>
      <div className="card" style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:14}}>
          <div><label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Title</label>{inp('Post title...','title')}</div>
          <div><label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Slug</label>{inp('url-slug','slug')}</div>
        </div>
        <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Meta description</label>{inp('160 chars max for SEO','meta_description')}</div>
        <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Excerpt</label>{inp('1-2 sentences shown in blog list','excerpt')}</div>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Content (HTML)</label>
          <textarea value={form.content||''} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={16} placeholder="<h2>Introduction</h2><p>Your content...</p>" style={{width:'100%',border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 12px',fontSize:12,fontFamily:'monospace',outline:'none',resize:'vertical',color:C.text,background:'#fff'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:18}}>
          <div style={{width:130}}><label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:5}}>Reading time (min)</label><input type="number" value={form.reading_time||5} onChange={e=>setForm(f=>({...f,reading_time:+e.target.value}))} style={{width:'100%',border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 12px',fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginTop:16,fontSize:13,fontWeight:500}}>
            <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:16,height:16,accentColor:C.green}}/>
            Published (visible on site)
          </label>
        </div>
        {msg&&<p style={{color:msg.startsWith('✅')?C.green:C.red,fontSize:13,marginBottom:12}}>{msg}</p>}
        <div style={{display:'flex',gap:8}}>
          <Btn variant="secondary" onClick={()=>setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save post'}</Btn>
        </div>
      </div>
    </div>
  )

  return(
    <div className="fade">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <p style={{color:C.text2,fontSize:13}}>{posts.length} posts total</p>
        <Btn variant="primary" onClick={openNew}>+ New post</Btn>
      </div>
      <div className="card">
        {loading?<div style={{display:'flex',gap:8,alignItems:'center',color:C.text2,padding:'20px'}}><Spinner/>Loading...</div>:(
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Read time</th><th>Published</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
              <tbody>
                {posts.map(post=>(
                  <tr key={post.id}>
                    <td><div style={{fontWeight:500}}>{post.title}</div><div style={{fontSize:11,color:C.text3,marginTop:2}}>/blog/{post.slug}</div></td>
                    <td><Badge type={post.published?'green':'gray'}>{post.published?'Live':'Draft'}</Badge></td>
                    <td style={{color:C.text2}}>{post.reading_time} min</td>
                    <td style={{color:C.text2,whiteSpace:'nowrap',fontSize:12}}>{fmtDate(post.published_at)}</td>
                    <td><div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      <Btn variant="secondary" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>openEdit(post)}>Edit</Btn>
                      <Btn variant="secondary" style={{fontSize:11,padding:'4px 10px',color:post.published?C.red:C.green}} onClick={()=>toggle(post)}>{post.published?'Unpublish':'Publish'}</Btn>
                      <Btn variant="danger" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>del(post)}>✕</Btn>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ROOT ──────────────────────────────────────────────────────────────
export default function Admin(){
  const [authed,setAuthed]=useState(false)
  const [pw,setPw]=useState('')
  const [pwErr,setPwErr]=useState('')
  const [tab,setTab]=useState('overview')
  const [pending,setPending]=useState(0)

  useEffect(()=>{ if(sessionStorage.getItem('sq_admin'))setAuthed(true) },[])
  useEffect(()=>{ if(authed)sb.from('reviews').select('id',{count:'exact'}).eq('approved',false).then(({count})=>setPending(count||0)) },[authed])

  const login=async()=>{
    try{
      const res=await fetch('/api/admin-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})})
      if(res.status===429){setPwErr('Too many attempts. Try again in 15 minutes.');return}
      const data=await res.json()
      if(data.ok){sessionStorage.setItem('sq_admin','1');setAuthed(true);setPwErr('')}
      else setPwErr('Incorrect password')
    }catch(e){setPwErr('Connection error')}
  }

  if(!authed)return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{G}</style>
      <div style={{maxWidth:380,width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:26,fontWeight:700,color:C.text,marginBottom:4}}>SmarterQuit</div>
          <div style={{fontSize:13,color:C.text2}}>Admin panel</div>
        </div>
        <div className="card" style={{padding:28}}>
          <label style={{display:'block',fontSize:12,fontWeight:500,color:C.text2,marginBottom:6}}>Password</label>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Enter admin password" style={{width:'100%',border:`1px solid ${pwErr?C.red:C.border2}`,borderRadius:8,padding:'10px 12px',fontSize:14,fontFamily:'inherit',outline:'none',marginBottom:pwErr?8:16,color:C.text}}/>
          {pwErr&&<p style={{color:C.red,fontSize:12,marginBottom:12}}>{pwErr}</p>}
          <Btn variant="primary" onClick={login} style={{width:'100%',padding:'11px',fontSize:14}}>Sign in →</Btn>
        </div>
      </div>
    </div>
  )

  const TABS=[{id:'overview',icon:'🏠',label:'Overview'},{id:'analytics',icon:'📈',label:'Analytics'},{id:'users',icon:'👥',label:'Users'},{id:'reviews',icon:'⭐',label:'Reviews',badge:pending},{id:'blog',icon:'📝',label:'Blog'}]
  const titles={overview:'Overview',analytics:'Analytics',users:'Users',reviews:'Reviews',blog:'Blog'}

  return(
    <div className="lay">
      <style>{G}</style>
      <nav className="nav">
        <div style={{padding:'20px 16px 14px'}}>
          <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:18,fontWeight:700,color:'#fff',marginBottom:2}}>SmarterQuit</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.1em'}}>Admin</div>
        </div>
        <div style={{padding:'4px 8px',flex:1}}>
          {TABS.map(t=><NavItem key={t.id} icon={t.icon} label={t.label} active={tab===t.id} onClick={()=>setTab(t.id)} badge={t.badge}/>)}
        </div>
        <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <a href="https://smarterquit.com" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:8,color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:12,marginBottom:8}}>
            <span>🌐</span>View live site ↗
          </a>
          <button onClick={()=>{sessionStorage.removeItem('sq_admin');setAuthed(false)}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:12,fontFamily:'inherit',padding:0}}>Sign out</button>
        </div>
      </nav>
      <main className="main">
        <header className="hdr">
          <h1 style={{fontSize:15,fontWeight:600}}>{titles[tab]}</h1>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:C.green,display:'inline-block'}}/>
            <span style={{fontSize:12,color:C.text2}}>smarterquit.com</span>
          </div>
        </header>
        <div className="wrap">
          {tab==='overview'  && <OverviewTab  onNav={setTab}/>}
          {tab==='analytics' && <AnalyticsTab/>}
          {tab==='users'     && <UsersTab/>}
          {tab==='reviews'   && <ReviewsTab/>}
          {tab==='blog'      && <BlogTab/>}
        </div>
      </main>
    </div>
  )
}
