import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STRIPE_LINK = "https://buy.stripe.com/7sYdRbakd1zY4eUdXN5Vu00"
const PRICE = "19.99"
const OLD_PRICE = "49.99"

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  // Urgency: smoke-free date = today + 21 days
  const quitDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 21)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  })()

  useEffect(() => {
    window.scrollTo(0, 0)
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = () => { window.location.href = STRIPE_LINK }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        :root{--green:#00e676;--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--white:#f0f4f8;--muted:#5a7a96;--red:#ff5252;--gold:#ffd600;--border:rgba(255,255,255,0.07)}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--white);font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        .logo{font-family:'Bebas Neue',Impact,sans-serif;font-size:26px;letter-spacing:0.05em;color:var(--white);text-decoration:none}
        .logo span{color:var(--green)}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--green);color:#000;font-family:'DM Sans',sans-serif;font-weight:800;font-size:18px;padding:20px 40px;border-radius:10px;border:none;cursor:pointer;transition:all 0.2s;width:100%;box-shadow:0 0 40px rgba(0,230,118,0.28)}
        .btn:hover{transform:translateY(-2px);box-shadow:0 0 64px rgba(0,230,118,0.45)}
        details>summary{list-style:none}
        details>summary::-webkit-details-marker{display:none}
        @media(max-width:640px){.hide-mobile{display:none!important}.sticky-bar{display:flex!important}.nav-links{display:none!important}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .f1{animation:fadeUp 0.5s ease both}
        .f2{animation:fadeUp 0.5s ease 0.1s both}
        .f3{animation:fadeUp 0.5s ease 0.2s both}
        .f4{animation:fadeUp 0.5s ease 0.3s both}
        .sr{opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease}
        .sr.in{opacity:1;transform:translateY(0)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .pulse{animation:pulse 2s ease infinite}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:scrolled?'rgba(8,12,16,0.96)':'transparent',backdropFilter:scrolled?'blur(12px)':'none',borderBottom:scrolled?'1px solid var(--border)':'1px solid transparent',transition:'all 0.3s',padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" className="logo">Smarter<span>Quit</span></a>
        <div className="nav-links" style={{display:'flex',gap:24,alignItems:'center'}}>
          {[['#how','How it works'],['#reviews','Reviews'],['#faq','FAQ']].map(([h,l])=>(
            <a key={h} href={h} style={{color:'var(--muted)',textDecoration:'none',fontSize:14,fontWeight:500}}>{l}</a>
          ))}
          <Link to="/blog" style={{color:'var(--muted)',textDecoration:'none',fontSize:14,fontWeight:500}}>Blog</Link>
          <button onClick={go} style={{background:'var(--green)',color:'#000',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>Start for ${PRICE}</button>
        </div>
      </nav>

      {/* URGENCY BANNER */}
      <div style={{background:'linear-gradient(90deg,#00260f,#003d18,#00260f)',borderBottom:'1px solid rgba(0,230,118,0.2)',padding:'11px 20px',textAlign:'center',fontSize:14,fontWeight:600,color:'rgba(240,244,248,0.9)'}}>
        <span className="pulse" style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'var(--green)',marginRight:8,verticalAlign:'middle'}}/>
        Start today — be smoke-free by <strong style={{color:'var(--green)'}}>{quitDate}</strong>
      </div>

      {/* HERO */}
      <section style={{maxWidth:860,margin:'0 auto',padding:'72px 24px 56px',textAlign:'center'}}>
        <div className="f1" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.25)',color:'var(--green)',padding:'7px 18px',borderRadius:100,fontSize:13,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:28}}>
          🚭 For Smokers & Vapers
        </div>

        <h1 className="f2" style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:'clamp(52px,10vw,100px)',lineHeight:0.92,letterSpacing:'0.02em',marginBottom:24}}>
          Most quit attempts<br/>fail by day 3.<br/><span style={{color:'var(--green)'}}>Here's why yours won't.</span>
        </h1>

        <p className="f3" style={{fontSize:'clamp(17px,3vw,21px)',color:'rgba(240,244,248,0.72)',maxWidth:600,margin:'0 auto 16px',lineHeight:1.65}}>
          A <strong style={{color:'var(--white)'}}>21-day science-based program</strong> that dismantles your smoking habit from the inside out — built around your specific triggers, your patterns, and your reasons.
        </p>
        <p className="f3" style={{fontSize:'clamp(15px,2.5vw,18px)',color:'rgba(0,230,118,0.8)',maxWidth:500,margin:'0 auto 40px',lineHeight:1.6,fontStyle:'italic'}}>
          Not willpower. Not patches. Understanding.
        </p>

        <div className="f4" style={{maxWidth:440,margin:'0 auto'}}>
          {/* Urgency line */}
          <div style={{background:'rgba(0,230,118,0.06)',border:'1px solid rgba(0,230,118,0.2)',borderRadius:10,padding:'10px 16px',marginBottom:20,fontSize:14,color:'rgba(240,244,248,0.8)'}}>
            📅 Start today → smoke-free by <strong style={{color:'var(--green)'}}>{quitDate}</strong>
          </div>

          {/* Price */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:18}}>
            <span style={{fontSize:18,color:'var(--muted)',textDecoration:'line-through',fontWeight:500}}>${OLD_PRICE}</span>
            <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:52,color:'var(--green)',lineHeight:1}}>${PRICE}</span>
            <span style={{background:'rgba(255,214,0,0.14)',border:'1px solid rgba(255,214,0,0.3)',color:'var(--gold)',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:6,letterSpacing:'0.05em'}}>LAUNCH PRICE</span>
          </div>

          <button onClick={go} className="btn" style={{fontSize:20,padding:'22px 40px',marginBottom:14}}>
            Start My Quit Journey →
          </button>

          {/* Guarantee */}
          <div style={{background:'rgba(0,230,118,0.05)',border:'1px solid rgba(0,230,118,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:8,textAlign:'left'}}>
            <span style={{fontSize:18,flexShrink:0}}>🛡️</span>
            <span style={{fontSize:13,color:'rgba(240,244,248,0.8)',lineHeight:1.5}}><strong style={{color:'var(--white)'}}>Money-back guarantee</strong> — complete the program and still smoke? Full refund. No forms, no questions.</span>
          </div>

          <PaymentIcons/>
        </div>
      </section>

      {/* THE JOURNEY — before/after story */}
      <section style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'64px 24px'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <p style={SL}>The 21-day journey</p>
          <h2 className="sr" style={{...ST,marginBottom:48}}>What actually happens,<br/>day by day.</h2>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {[
              {day:'Day 1',color:'var(--gold)',icon:'👁️',title:'You still smoke today.',desc:'Your only job is to log every cigarette before you light up. Rate the craving. Name the trigger. Log the satisfaction after. By tonight you\'ll see your habit more clearly than ever before.'},
              {day:'Day 3',color:'var(--gold)',icon:'🗺️',title:'You understand the trap.',desc:'Three days of data. You can see exactly when your cravings hit, what triggers them, and how much less satisfying each cigarette was compared to what your brain promised. Tonight you smoke your last one — consciously.'},
              {day:'Day 4',color:'var(--blue)',icon:'⚡',title:'You stop. Cravings hit. You have a timer.',desc:'Every craving peaks and passes in 3 minutes. Not motivation — neuroscience. The breathing timer in the app gets you through every wave. The first day is the loudest. It\'s also the last of the worst.'},
              {day:'Day 8',color:'var(--blue)',icon:'💪',title:'The physical battle is mostly won.',desc:'Nicotine is long gone. What remains is psychological — habit loops and triggers. But you mapped those on Day 1. You know exactly what\'s coming and when. Your lungs are already measurably better.'},
              {day:'Day 14',color:'var(--green)',icon:'🪞',title:'You stop saying "I\'m trying to quit."',desc:'You start saying "I don\'t smoke." That shift sounds small. Neurologically, it\'s everything. One is a struggle. The other is an identity. You\'ve earned it.'},
              {day:'Day 21',color:'var(--green)',icon:'🎉',title:'You\'re free.',desc:'Not as a theory. As a lived reality. 21 days of choosing yourself over a habit that manufactured its own demand. Your savings counter has been running the whole time. Your body has been healing since hour one.'},
            ].map((step,i)=>(
              <div key={i} className="sr" style={{display:'flex',gap:20,marginBottom:32,alignItems:'flex-start'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:`${step.color}18`,border:`2px solid ${step.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{step.icon}</div>
                  {i<5&&<div style={{width:2,height:32,background:'var(--border)',margin:'4px 0'}}/>}
                </div>
                <div style={{paddingTop:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:15,color:step.color,letterSpacing:'0.08em'}}>{step.day}</span>
                    <span style={{fontWeight:700,fontSize:16,color:'var(--white)'}}>{step.title}</span>
                  </div>
                  <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.65}}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP SCREENSHOTS / MOCKUPS */}
      <section style={{padding:'72px 24px',background:'var(--bg)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <p style={SL}>Inside the app</p>
          <h2 className="sr" style={{...ST,marginBottom:12}}>See exactly what you're getting.</h2>
          <p className="sr" style={{textAlign:'center',color:'var(--muted)',fontSize:16,marginBottom:52,maxWidth:520,margin:'0 auto 52px'}}>
            No download needed. Opens instantly in your browser. Works on any phone, tablet, or computer.
          </p>

          {/* Phone mockups row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24,alignItems:'start'}}>

            {/* Mockup 1: Dashboard */}
            <div className="sr">
              <PhoneMockup label="Your daily dashboard">
                {/* Header */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,letterSpacing:'0.05em',color:'#f0f4f8'}}>Smarter<span style={{color:'#00e676'}}>Quit</span></span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:8,color:'#5a7a96',textTransform:'uppercase'}}>Day</div>
                    <div style={{fontSize:20,fontWeight:800,color:'#40c4ff',lineHeight:1}}>7<span style={{color:'#5a7a96',fontSize:11}}>/21</span></div>
                  </div>
                </div>
                {/* Progress */}
                <div style={{height:3,background:'#1a2535',borderRadius:2,marginBottom:10}}>
                  <div style={{height:'100%',width:'33%',background:'#40c4ff',borderRadius:2}}/>
                </div>
                {/* Coach message */}
                <div style={{background:'rgba(64,196,255,0.08)',border:'1px solid rgba(64,196,255,0.2)',borderRadius:10,padding:'10px 12px',marginBottom:10}}>
                  <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:11,color:'#f0f4f8',margin:'0 0 3px',lineHeight:1.5}}>Day 7. You beat the hardest week. Most people don't make it here.</p>
                  <p style={{fontSize:9,color:'#5a7a96',margin:0}}>Physical withdrawal is largely over now.</p>
                </div>
                {/* Stats */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                  <div style={{background:'#111820',border:'1px solid rgba(0,230,118,0.3)',borderRadius:8,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:8,color:'#00e676',textTransform:'uppercase',marginBottom:3}}>💰 Saved</div>
                    <div style={{fontSize:18,fontWeight:800,color:'#00e676',fontFamily:"'Bebas Neue',Impact,sans-serif"}}> $23.17</div>
                    <div style={{fontSize:8,color:'#5a7a96',marginTop:2}}>and counting</div>
                  </div>
                  <div style={{background:'#111820',border:'1px solid #1a2535',borderRadius:8,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:8,color:'#5a7a96',textTransform:'uppercase',marginBottom:3}}>🚭 Not smoked</div>
                    <div style={{fontSize:18,fontWeight:800,color:'#f0f4f8',fontFamily:"'Bebas Neue',Impact,sans-serif"}}>140</div>
                    <div style={{fontSize:8,color:'#5a7a96',marginTop:2}}>cigarettes</div>
                  </div>
                </div>
                {/* Day card */}
                <div style={{background:'#111820',border:'1px solid #1a2535',borderLeft:'3px solid #40c4ff',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontSize:8,color:'#40c4ff',textTransform:'uppercase',fontWeight:700,marginBottom:3}}>Day 7 · Detox</div>
                  <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:12,color:'#f0f4f8',marginBottom:4}}>One Full Week</div>
                  <div style={{fontSize:9,color:'#5a7a96',lineHeight:1.4,marginBottom:8}}>Cravings are getting shorter. The neural pathway is weakening every day you don't feed it.</div>
                  <div style={{background:'#40c4ff',borderRadius:5,padding:'5px 10px',textAlign:'center',fontSize:9,fontWeight:700,color:'#000'}}>Read now →</div>
                </div>
              </PhoneMockup>
              <p style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:12}}>Daily dashboard with personal coach message</p>
            </div>

            {/* Mockup 2: Breathing timer */}
            <div className="sr">
              <PhoneMockup label="3-minute craving timer">
                <div style={{textAlign:'center',padding:'8px 0'}}>
                  <div style={{fontSize:10,color:'#ff7043',textTransform:'uppercase',fontWeight:700,letterSpacing:'0.08em',marginBottom:12}}>😤 Stress trigger</div>
                  {/* Timer circle */}
                  <div style={{width:100,height:100,borderRadius:'50%',background:'rgba(255,112,67,0.12)',border:'2px solid #ff7043',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                    <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:'#ff7043',lineHeight:1}}>3</div>
                  </div>
                  <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:14,color:'#f0f4f8',marginBottom:4}}>Breathe in...</div>
                  <div style={{fontSize:10,color:'#5a7a96',marginBottom:16}}>Through your nose</div>
                  {/* Phase indicators */}
                  <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:14}}>
                    {[['In','4s',true],['Hold','4s',false],['Out','6s',false]].map(([l,t,a])=>(
                      <div key={l} style={{flex:1,background:a?'rgba(255,112,67,0.15)':'#111820',border:`1px solid ${a?'#ff7043':'#1a2535'}`,borderRadius:6,padding:'6px 4px',textAlign:'center'}}>
                        <div style={{fontSize:9,fontWeight:700,color:a?'#ff7043':'#5a7a96'}}>{l}</div>
                        <div style={{fontSize:8,color:'#5a7a96'}}>{t}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{height:3,background:'#1a2535',borderRadius:2,marginBottom:10}}>
                    <div style={{height:'100%',width:'15%',background:'#00e676',borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:9,color:'#5a7a96'}}>2:45 remaining</div>
                </div>
              </PhoneMockup>
              <p style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:12}}>3-minute breathing timer for every craving</p>
            </div>

            {/* Mockup 3: Day content */}
            <div className="sr">
              <PhoneMockup label="Daily science content">
                {/* Header */}
                <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
                  <div style={{background:'rgba(0,230,118,0.1)',border:'1px solid rgba(0,230,118,0.3)',borderRadius:5,padding:'3px 8px',fontSize:8,color:'#00e676',fontWeight:700}}>FREEDOM · DAY 14</div>
                </div>
                <div style={{textAlign:'center',marginBottom:12}}>
                  <div style={{fontSize:28,marginBottom:6}}>🪞</div>
                  <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:13,color:'#f0f4f8',marginBottom:3}}>The Mirror</div>
                  <div style={{fontSize:9,color:'#5a7a96'}}>Stop saying you're trying to quit.</div>
                </div>
                {/* Intro block */}
                <div style={{background:'#111820',borderLeft:'2px solid #00e676',borderRadius:'0 8px 8px 0',padding:'8px 10px',marginBottom:8}}>
                  <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:9,color:'#f0f4f8',margin:0,lineHeight:1.5}}>There's a word shift that happens around Day 14. People stop saying "I'm trying to quit" and start saying "I don't smoke."</p>
                </div>
                {/* Science block */}
                <div style={{background:'#111820',border:'1px solid #1a2535',borderRadius:8,padding:'8px 10px',marginBottom:8}}>
                  <div style={{fontSize:7,color:'#40c4ff',textTransform:'uppercase',fontWeight:700,marginBottom:4}}>🔬 The science</div>
                  <p style={{fontSize:9,color:'rgba(240,244,248,0.85)',margin:0,lineHeight:1.5}}>Identity-based habits have a measurably higher success rate than goal-based ones. "I don't smoke" is an identity. "I quit smoking" is a goal with exceptions.</p>
                </div>
                {/* Insight */}
                <div style={{background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.25)',borderRadius:8,padding:'8px 10px'}}>
                  <div style={{fontSize:7,color:'#00e676',textTransform:'uppercase',fontWeight:700,marginBottom:3}}>💡 Key insight</div>
                  <p style={{fontSize:9,color:'#f0f4f8',margin:0,lineHeight:1.5}}>"I don't smoke" — say it out loud. It's yours now.</p>
                </div>
              </PhoneMockup>
              <p style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:12}}>21 days of science-backed content</p>
            </div>

            {/* Mockup 4: Pattern analysis */}
            <div className="sr">
              <PhoneMockup label="Your personal craving map">
                <div style={{marginBottom:12}}>
                  <div style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:13,color:'#f0f4f8',marginBottom:4}}>Your craving profile</div>
                  <div style={{fontSize:9,color:'#5a7a96'}}>Based on 23 logged cravings</div>
                </div>
                {/* When section */}
                <div style={{background:'#111820',border:'1px solid #1a2535',borderRadius:8,padding:'10px',marginBottom:8}}>
                  <div style={{fontSize:7,color:'#40c4ff',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>⏰ When cravings hit</div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:2,height:28,marginBottom:4}}>
                    {[2,1,1,0,0,0,8,6,4,3,2,1,3,2,1,2,3,4,5,3,2,1,1,1].map((v,i)=>(
                      <div key={i} style={{flex:1,height:`${Math.max(3,(v/8)*26)}px`,background:i===6?'#ff5252':v>0?'rgba(0,230,118,0.5)':'rgba(255,255,255,0.05)',borderRadius:1}}/>
                    ))}
                  </div>
                  <div style={{fontSize:7,color:'#5a7a96'}}>Peak: <span style={{color:'#ff5252',fontWeight:700}}>7am</span> — morning nicotine low</div>
                </div>
                {/* Triggers */}
                <div style={{background:'#111820',border:'1px solid #1a2535',borderRadius:8,padding:'10px',marginBottom:8}}>
                  <div style={{fontSize:7,color:'#ffd600',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>🎯 Top triggers</div>
                  {[['😤 Stress','65%','#ff5252'],['🔁 Habit','20%','#40c4ff'],['😴 Boredom','15%','#7c4dff']].map(([l,p,c])=>(
                    <div key={l} style={{marginBottom:5}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:8,marginBottom:2}}>
                        <span style={{color:'#f0f4f8'}}>{l}</span>
                        <span style={{color:c,fontWeight:700}}>{p}</span>
                      </div>
                      <div style={{height:4,background:'#0d1117',borderRadius:2}}>
                        <div style={{height:'100%',width:p,background:c,borderRadius:2}}/>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Beaten */}
                <div style={{background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.25)',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8}}>
                  <div style={{fontSize:20,fontWeight:800,color:'#00e676',flexShrink:0}}>18</div>
                  <div style={{fontSize:9,color:'#5a7a96',lineHeight:1.4}}>cravings beaten. Each one weakened the neural pathway.</div>
                </div>
              </PhoneMockup>
              <p style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:12}}>Personal pattern analysis from your data</p>
            </div>

          </div>

          {/* No download note */}
          <div className="sr" style={{textAlign:'center',marginTop:40,padding:'20px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:14,maxWidth:500,margin:'40px auto 0'}}>
            <div style={{fontSize:28,marginBottom:8}}>🌐</div>
            <div style={{fontWeight:700,fontSize:15,color:'var(--white)',marginBottom:4}}>No app to download</div>
            <p style={{color:'var(--muted)',fontSize:14,margin:0,lineHeight:1.6}}>Everything runs in your browser. Works on iPhone, Android, desktop. Bookmark it or add it to your home screen for instant access.</p>
          </div>

        </div>
      </section>


      {/* PRICE ANCHORING */}
      <div style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)',padding:'28px 20px'}}>
        <div style={{maxWidth:720,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:32,flexWrap:'wrap'}}>
          {[['$2,920','Average smoker spends yearly','var(--red)',true],['$19.99','SmarterQuit program','var(--green)',false],['14,500%','Your return on investment','var(--gold)',false]].map(([n,l,c,strike])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:38,color:c,textDecoration:strike?'line-through':'none',opacity:strike?0.6:1}}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:1,background:'var(--border)'}}>
        {[['21','Days to freedom'],['72H','Nicotine leaves body'],['3 min','Every craving passes'],['100%','Refund if it fails']].map(([n,l])=>(
          <div key={n} style={{background:'var(--bg2)',padding:'26px 12px',textAlign:'center'}}>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:38,color:'var(--green)',lineHeight:1,marginBottom:4}}>{n}</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>{l}</div>
          </div>
        ))}
      </div>

      {/* WHAT YOU GET */}
      <section id="how" style={{maxWidth:860,margin:'0 auto',padding:'72px 24px'}}>
        <p className="sr" style={SL}>What's inside</p>
        <h2 className="sr" style={ST}>Everything you need.<br/>Nothing you don't.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginTop:48}}>
          {[
            ['📱','Works on any device','No app to download. Open it in any browser. Your progress syncs across all your devices automatically.'],
            ['👁️','3 Awareness Days','You still smoke — but you finally understand exactly what you\'re doing and why. This data guides everything.'],
            ['⏱️','3-Minute Craving Timer','Every craving peaks and passes in 3 minutes. The guided breathing timer gets you through each one.'],
            ['📊','Personal Pattern Analysis','After the awareness days, the app shows you your exact peak craving times and biggest triggers.'],
            ['💰','Live Savings Counter','Counts your savings to the cent from the moment you stop. Real money, in real time.'],
            ['❤️','Body Healing Timeline','See exactly what\'s happening inside your body — 20 minutes after your last cigarette to 1 year later.'],
            ['📅','21 Days of Daily Content','Science-backed daily lessons. Short, sharp, and built for the moment you\'re in.'],
            ['🔗','Personal Access Link','Your program on any device, forever. Never lose your progress.'],
          ].map(([icon,title,desc])=>(
            <div key={title} className="sr" style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:14,padding:22}}>
              <div style={{fontSize:28,marginBottom:12}}>{icon}</div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAVINGS CALCULATOR */}
      <section style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'64px 24px'}}>
        <div style={{maxWidth:540,margin:'0 auto'}}>
          <p style={SL}>Your money</p>
          <h2 className="sr" style={{...ST,marginBottom:36}}>See exactly what you're losing.</h2>
          <div className="sr" style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:16,padding:28}}>
            <CalcWidget/>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <div style={{background:'var(--bg)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <section id="reviews" style={{maxWidth:980,margin:'0 auto',padding:'72px 24px'}}>
          <p className="sr" style={SL}>Early results.</p>
          <h2 className="sr" style={{...ST,marginBottom:12}}>What early users are saying.</h2>
          <div className="sr" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,margin:'0 0 48px'}}>
            <span style={{color:'var(--gold)',fontSize:20,letterSpacing:3}}>★★★★★</span>
            <span style={{fontWeight:700,fontSize:17}}>5.0 / 5</span>
            <span style={{color:'var(--muted)',fontSize:13}}>from our first users</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:18}}>
            {[
              ['👩','Ashley M.','Smoked 11 years • Early user','$3,400/yr saved',"I've tried patches, gum, Zyban, every app. What made this different was Day 1 — logging every smoke before lighting up. By evening I couldn't believe how much the habit controlled me. Smoke-free since Day 5."],
              ['👨','Jordan T.','Vaped 3 years • Early user','$2,160/yr saved',"Was going through 2 pods a day without realizing the cost. The savings calculator showed me $180 a month. The 3-minute breathing timer actually works. Best money I've ever spent."],
              ['👨','Marcus R.','Smoked 8 years • Early user','$4,100/yr saved',"The identity shift on Day 6 changed everything. I stopped saying 'I'm trying to quit' and started saying 'I don't smoke.' My wife cried when I hit Day 21. I've told everyone I know."],
              ['👩','Danielle K.','Smoking & vaping • Early user','$5,200/yr saved',"Was doing both — smoking at work, vaping at home. The Awareness Days were a revelation. Seeing my own craving patterns made the habit feel manageable for the first time. 6 weeks clean."],
              ['👨','Ryan H.','Pack a day 14 years • Early user','$4,800/yr saved',"The live savings counter finally made the money real. Day 8 I had $57 saved. By Day 21 it was $145. 4 months in and that money is actually in my savings account now."],
              ['👩','Priya S.','Vaping 4 years • Early user','$1,800/yr saved',"Skeptical a $19.99 program could beat the $300 options I tried. It did. Daily content is short and genuinely smart — not preachy. The craving timer is magic when it hits you at 2pm."],
            ].map(([av,name,info,saved,text])=>(
              <div key={name} className="sr" style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:14,padding:22}}>
                <div style={{color:'var(--gold)',fontSize:13,letterSpacing:2,marginBottom:10}}>★★★★★</div>
                <p style={{fontSize:14,lineHeight:1.7,marginBottom:16,color:'rgba(240,244,248,0.85)',fontStyle:'italic'}}>"{text}"</p>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(0,230,118,0.1)',border:'1px solid rgba(0,230,118,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{av}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{name}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{info}</div>
                    <div style={{display:'inline-block',background:'rgba(0,230,118,0.07)',border:'1px solid rgba(0,230,118,0.18)',color:'var(--green)',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:100,marginTop:4}}>{saved}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* GUARANTEE */}
      <section style={{maxWidth:660,margin:'0 auto',padding:'72px 24px',textAlign:'center'}}>
        <div className="sr" style={{width:76,height:76,background:'rgba(0,230,118,0.08)',border:'2px solid var(--green)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 24px'}}>🛡️</div>
        <h2 className="sr" style={{fontFamily:"Georgia,serif",fontStyle:'italic',fontSize:'clamp(24px,4vw,36px)',marginBottom:18,lineHeight:1.2}}>Do the work. If it doesn't work,<br/>you don't pay. Simple.</h2>
        <p className="sr" style={{color:'var(--muted)',fontSize:16,lineHeight:1.75,maxWidth:520,margin:'0 auto 28px'}}>
          Complete all 21 days. Log your cravings. Read the daily content. <strong style={{color:'var(--white)'}}>If you still smoke — email us. Full refund within 5 days. No forms. No arguing.</strong>
        </p>
        <div className="sr" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,maxWidth:400,margin:'0 auto'}}>
          {[['✓','30-day window','from purchase'],['✓','No forms','to fill out'],['✓','No questions','asked']].map(([t,a,b])=>(
            <div key={a} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 10px',textAlign:'center'}}>
              <div style={{color:'var(--green)',fontWeight:800,fontSize:16,marginBottom:3}}>{t}</div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:1}}>{a}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'64px 24px'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <p style={SL}>FAQ</p>
          <h2 className="sr" style={{...ST,marginBottom:36}}>Questions, answered.</h2>
          {[
            ['Does this work for vaping too?','Yes. SmarterQuit is built for both cigarettes and vaping. Select your type during setup and the program adapts to you.'],
            ['What if I\'ve tried to quit before and failed?','Good. That means you know what doesn\'t work. Most successful quitters try multiple times before succeeding. The difference here is the awareness approach — you\'re not fighting the habit blind anymore.'],
            ['Do I need to quit on Day 1?','No. Days 1-3 are awareness days — you still smoke. You just log everything. Day 4 is your first smoke-free day.'],
            ['What exactly is the money-back guarantee?','Complete all 21 days and still smoke? Email hello@smarterquit.com within 30 days of purchase. Full refund, no questions.'],
            ['Why is it $19.99?','Because it works. Comparable programs charge $9.99/month. This is a one-time payment for a complete 21-day program.'],
            ['Will I get support?','Email hello@smarterquit.com anytime. We read every email.'],
          ].map(([q,a])=>(
            <details key={q} className="sr" style={{borderBottom:'1px solid var(--border)',paddingBottom:0}}>
              <summary style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0',cursor:'pointer',fontWeight:600,fontSize:16,listStyle:'none'}}>
                {q}
                <span style={{color:'var(--green)',fontSize:20,flexShrink:0,marginLeft:12}}>+</span>
              </summary>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.7,paddingBottom:20}}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{maxWidth:660,margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:12}}>Your move</div>
        <h2 className="sr" style={{fontFamily:"Georgia,serif",fontStyle:'italic',fontSize:'clamp(26px,5vw,44px)',lineHeight:1.15,marginBottom:16}}>
          You've tried before.<br/>This time you have a system.
        </h2>
        <p style={{color:'var(--muted)',fontSize:17,maxWidth:460,margin:'0 auto 12px',lineHeight:1.65}}>
          Start today. Be smoke-free by <strong style={{color:'var(--green)'}}>{quitDate}</strong>.
        </p>
        <p style={{color:'var(--muted)',fontSize:14,maxWidth:400,margin:'0 auto 36px',lineHeight:1.6}}>
          $19.99. Less than two packs of cigarettes. A guarantee that means you have nothing to lose.
        </p>
        <div style={{maxWidth:380,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:14}}>
            <span style={{fontSize:15,color:'var(--muted)',textDecoration:'line-through'}}>${OLD_PRICE}</span>
            <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:42,color:'var(--green)',lineHeight:1}}>${PRICE}</span>
            <span style={{background:'rgba(255,214,0,0.12)',border:'1px solid rgba(255,214,0,0.3)',color:'var(--gold)',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:6}}>LAUNCH PRICE</span>
          </div>
          <button onClick={go} className="btn" style={{fontSize:19,padding:'21px 40px',marginBottom:12}}>Start My Quit Journey →</button>
          <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>🛡️ Money-back guarantee &nbsp;•&nbsp; No download &nbsp;•&nbsp; Works on any phone</div>
          <PaymentIcons/>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'32px 24px',textAlign:'center',fontSize:13,color:'var(--muted)'}}>
        <a href="/" className="logo" style={{fontSize:22,display:'block',marginBottom:14}}>Smarter<span>Quit</span></a>
        <div style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap',marginBottom:14}}>
          <Link to="/blog" style={{color:'var(--muted)',textDecoration:'none'}}>Blog</Link>
          <Link to="/privacy" style={{color:'var(--muted)',textDecoration:'none'}}>Privacy Policy</Link>
          <Link to="/terms" style={{color:'var(--muted)',textDecoration:'none'}}>Terms of Service</Link>
          <Link to="/refund" style={{color:'var(--muted)',textDecoration:'none'}}>Refund Policy</Link>
          <a href="mailto:hello@smarterquit.com" style={{color:'var(--muted)',textDecoration:'none'}}>Contact</a>
        </div>
        <p style={{fontSize:11,maxWidth:500,margin:'0 auto'}}>© 2025 SmarterQuit. All rights reserved. Educational program — does not replace medical advice.</p>
      </footer>

      {/* MOBILE STICKY BAR */}
      <div className="sticky-bar" style={{display:'none',position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:'rgba(8,12,16,0.97)',borderTop:'1px solid rgba(0,230,118,0.2)',padding:'10px 16px 22px',backdropFilter:'blur(8px)',flexDirection:'column',gap:4}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:4}}>
          <span style={{fontSize:12,color:'var(--muted)',textDecoration:'line-through'}}>${OLD_PRICE}</span>
          <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>${PRICE} — Launch Price</span>
        </div>
        <button onClick={go} className="btn" style={{fontSize:17,padding:16}}>Start Now — ${PRICE} 🚭</button>
      </div>

      <ScrollReveal/>
    </>
  )
}

function PaymentIcons(){
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap',marginTop:8}}>
      <span style={{fontSize:11,color:'var(--muted)'}}>Accepted:</span>
      <div style={{background:'#fff',borderRadius:5,padding:'3px 10px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/visa.svg" alt="Visa" style={{height:16,display:'block'}}/>
      </div>
      <div style={{height:26,display:'flex',alignItems:'center'}}>
        <img src="/mastercard.svg" alt="Mastercard" style={{height:24,display:'block'}}/>
      </div>
      <div style={{background:'#000',borderRadius:5,padding:'3px 10px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/applepay.svg" alt="Apple Pay" style={{height:16,display:'block',filter:'invert(1)'}}/>
      </div>
      <div style={{background:'#fff',borderRadius:5,padding:'3px 8px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/googlepay.svg" alt="Google Pay" style={{height:16,display:'block'}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--muted)'}}>
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.8" y="5.5" width="9.4" height="7" rx="1.2" fill="none" stroke="#5a7a96" strokeWidth="1.3"/>
          <path d="M3 5.5V3.8C3 2.5 4.1 1.5 5.5 1.5C6.9 1.5 8 2.5 8 3.8V5.5" stroke="#5a7a96" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="5.5" cy="9" r="1" fill="#5a7a96"/>
        </svg>
        SSL
      </div>
    </div>
  )
}

function PhoneMockup({children, label}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{
        width:'100%', maxWidth:220,
        background:'#0d1117',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:28,
        padding:'10px 8px',
        boxShadow:'0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        position:'relative',
      }}>
        {/* Phone notch */}
        <div style={{width:60,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,margin:'0 auto 10px'}}/>
        {/* Screen */}
        <div style={{
          background:'#080c10',
          borderRadius:20,
          padding:'14px 12px',
          minHeight:340,
          overflow:'hidden',
        }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{width:50,height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,margin:'10px auto 0'}}/>
      </div>
    </div>
  );
}

function CalcWidget(){
  const [packs,setPacks]=useState(1)
  const [price,setPrice]=useState(10)
  const yearly=Math.round(packs*price*365)
  return(
    <div>
      <div style={{fontSize:12,color:'#00e676',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:20,textAlign:'center'}}>💰 Your Personal Savings Calculator</div>
      {[['Packs or pods per day',packs,setPacks,0.5,5,0.5],['Price per pack / pod ($)',price,setPrice,1,40,1]].map(([label,val,setter,min,max,step])=>(
        <div key={label} style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,color:'var(--muted)'}}>{label}</span>
            <span style={{fontSize:14,fontWeight:700,color:'var(--white)'}}>{label.includes('Price')?`$${val}`:val}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={val} onChange={e=>setter(+e.target.value)} style={{width:'100%',accentColor:'#00e676',cursor:'pointer'}}/>
        </div>
      ))}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:18,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,textAlign:'center'}}>
        {[['Monthly',`$${Math.round(yearly/12)}`],['Per year',`$${yearly.toLocaleString()}`],['5 years',`$${(yearly*5).toLocaleString()}`]].map(([l,v])=>(
          <div key={l} style={{background:'rgba(0,230,118,0.06)',border:'1px solid rgba(0,230,118,0.15)',borderRadius:10,padding:'12px 6px'}}>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:20,color:'#00e676',lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
      <p style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginTop:10}}>All of this stays with you when you quit.</p>
    </div>
  )
}

function ScrollReveal(){
  useEffect(()=>{
    const els=document.querySelectorAll('.sr')
    const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')})},{threshold:0.08})
    els.forEach(el=>io.observe(el))
    return()=>io.disconnect()
  },[])
  return null
}

const SL={textAlign:'center',fontSize:12,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:12}
const ST={textAlign:'center',fontFamily:"Georgia,serif",fontStyle:'italic',fontSize:'clamp(26px,5vw,44px)',lineHeight:1.15,marginBottom:14}
