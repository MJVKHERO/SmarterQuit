import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ⚠️  STAP 1: Vervang met jouw echte Stripe Payment Link URL
// STAP 2: Stel in Stripe de "Success URL" in op:
//         https://smarterquit.com/app?cs={CHECKOUT_SESSION_ID}
//         (de {CHECKOUT_SESSION_ID} vult Stripe automatisch in)
const STRIPE_LINK = "https://buy.stripe.com/7sYdRbakd1zY4eUdXN5Vu00"

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
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
      `}</style>

      {/* STICKY NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:scrolled?'rgba(8,12,16,0.96)':'transparent',backdropFilter:scrolled?'blur(12px)':'none',borderBottom:scrolled?'1px solid var(--border)':'1px solid transparent',transition:'all 0.3s',padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" className="logo">Smarter<span>Quit</span></a>
        <div className="nav-links" style={{display:'flex',gap:24,alignItems:'center'}}>
          {[['#how','How it works'],['#reviews','Reviews'],['#faq','FAQ']].map(([h,l])=>(
            <a key={h} href={h} style={{color:'var(--muted)',textDecoration:'none',fontSize:14,fontWeight:500}}>{l}</a>
          ))}
          <button onClick={go} style={{background:'var(--green)',color:'#000',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>Start for $7.99</button>
        </div>
      </nav>

      {/* LAUNCH BANNER */}
      <div style={{background:'linear-gradient(90deg,#00260f,#003d18,#00260f)',borderBottom:'1px solid rgba(0,230,118,0.2)',padding:'11px 20px',textAlign:'center',fontSize:14,fontWeight:600,color:'rgba(240,244,248,0.9)'}}>
        🚀 <strong style={{color:'var(--green)'}}>Launch Price:</strong> Get the full 21-day program for <strong style={{color:'var(--green)'}}>$7.99</strong> — regular price will be $19.99
      </div>

      {/* HERO */}
      <section style={{maxWidth:820,margin:'0 auto',padding:'72px 24px 56px',textAlign:'center'}}>
        <div className="f1" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.25)',color:'var(--green)',padding:'7px 18px',borderRadius:100,fontSize:13,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:28}}>
          🚭 For Smokers & Vapers
        </div>
        <h1 className="f2" style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:'clamp(56px,11vw,104px)',lineHeight:0.92,letterSpacing:'0.02em',marginBottom:24}}>
          Quit Smoking.<br/>Quit Vaping.<br/><span style={{color:'var(--green)'}}>Quit Smarter.</span>
        </h1>
        <p className="f3" style={{fontSize:'clamp(17px,3vw,21px)',color:'rgba(240,244,248,0.72)',maxWidth:580,margin:'0 auto 40px',lineHeight:1.65}}>
          A <strong style={{color:'var(--white)'}}>21-day science-based program</strong> built around your triggers, your habits, and your reasons. Used by <strong style={{color:'var(--white)'}}>4,200+ people</strong> who've quit for good.
        </p>

        <div className="f4" style={{maxWidth:420,margin:'0 auto'}}>
          {/* Anchor price */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:18}}>
            <span style={{fontSize:18,color:'var(--muted)',textDecoration:'line-through',fontWeight:500}}>$19.99</span>
            <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:48,color:'var(--green)',lineHeight:1}}>$7.99</span>
            <span style={{background:'rgba(255,214,0,0.14)',border:'1px solid rgba(255,214,0,0.3)',color:'var(--gold)',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:6,letterSpacing:'0.05em'}}>LAUNCH PRICE</span>
          </div>
          <button onClick={go} className="btn" style={{fontSize:20,padding:'22px 40px',marginBottom:14}}>
            Start My Quit Journey →
          </button>
          {/* Guarantee line near CTA */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'center',gap:6,marginBottom:16,fontSize:13,color:'var(--muted)',lineHeight:1.5}}>
            <span style={{color:'var(--green)',fontSize:15,flexShrink:0,marginTop:1}}>🛡️</span>
            <span><strong style={{color:'var(--white)'}}>Money-back guarantee</strong> — complete the program, still smoke? Full refund, no questions.</span>
          </div>
          {/* Payment logos */}
          <PaymentIcons/>
        </div>
      </section>

      {/* PRICE ANCHORING */}
      <div style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'28px 20px'}}>
        <div style={{maxWidth:720,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:24,flexWrap:'wrap'}}>
          {[['$2,920','What smokers spend yearly','var(--red)',true],['$7.99','SmarterQuit program','var(--green)',false],['36,500%','Your return on investment','var(--gold)',false]].map(([n,l,c,strike])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:38,color:c,textDecoration:strike?'line-through':'none',opacity:strike?0.65:1}}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:1,background:'var(--border)'}}>
        {[['4,200+','People who started'],['21','Days to freedom'],['72H','Nicotine leaves body'],['100%','Refund if it fails']].map(([n,l])=>(
          <div key={n} style={{background:'var(--bg2)',padding:'26px 12px',textAlign:'center'}}>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:38,color:'var(--green)',lineHeight:1,marginBottom:4}}>{n}</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>{l}</div>
          </div>
        ))}
      </div>

      {/* WHAT YOU GET */}
      <section style={{maxWidth:860,margin:'0 auto',padding:'72px 24px'}}>
        <p className="sr" style={SL}>What's inside</p>
        <h2 className="sr" style={ST}>Everything you need.<br/>Nothing you don't.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginTop:48}}>
          {[['📱','Instant browser access','No app download. Works on any phone. Log in from anywhere, anytime.'],
            ['👁️','The Awareness Method','Day 1 you still smoke — but you study your habit. By Day 3 you understand it completely.'],
            ['⏱️','3-Minute Craving Timer','Every craving peaks in 3 minutes. Our breathing timer walks you through it every time.'],
            ['📊','Personal Trigger Map','Log cravings, see your patterns. Know exactly when and why you smoke.'],
            ['💰','Live Savings Counter','Watch your money grow in real time from Day 1. Every day tracked.'],
            ['🧠','21 Days of Real Content','Daily reads backed by neuroscience, CBT, and Allen Carr\'s proven method.'],
          ].map(([e,t,d])=>(
            <div key={t} className="sr" style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 18px'}}>
              <div style={{fontSize:26,marginBottom:10}}>{e}</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:7}}>{t}</div>
              <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,margin:0}}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <section id="how" style={{maxWidth:860,margin:'0 auto',padding:'72px 24px'}}>
          <p className="sr" style={SL}>The Method</p>
          <h2 className="sr" style={ST}>Why this works when everything else failed.</h2>
          <p className="sr" style={{textAlign:'center',color:'var(--muted)',maxWidth:500,margin:'0 auto 52px',fontSize:16,lineHeight:1.65}}>Willpower fails because it fights the wrong thing. SmarterQuit removes the desire by helping you understand it.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>
            {[['👁️','Days 1–2','Awareness','You still smoke. But you log everything before and after. By Day 2 you\'ve mapped your exact trigger pattern.','#ffd600'],
              ['⚔️','Days 3–10','Detox','You stop. Every craving gets a 3-minute breathing timer. You watch each one pass. They get weaker every day.','#40c4ff'],
              ['🔥','Days 11–21','Freedom','You\'re not quitting anymore. You\'re becoming someone who doesn\'t smoke. Identity, not willpower.','#00e676'],
            ].map(([e,d,ph,desc,c])=>(
              <div key={ph} className="sr" style={{background:'var(--bg)',border:`1px solid ${c}28`,borderTop:`3px solid ${c}`,borderRadius:14,padding:22}}>
                <span style={{fontSize:30,display:'block',marginBottom:12}}>{e}</span>
                <div style={{color:c,fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{d} — {ph}</div>
                <p style={{fontSize:13,color:'rgba(240,244,248,0.72)',lineHeight:1.65,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* SAVINGS CALCULATOR */}
      <section style={{maxWidth:460,margin:'0 auto',padding:'72px 24px'}}>
        <p className="sr" style={SL}>Your numbers</p>
        <h2 className="sr" style={{...ST,marginBottom:36}}>Calculate your savings.</h2>
        <div className="sr" style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:16,padding:28}}>
          <CalcWidget/>
        </div>
      </section>

      {/* REVIEWS */}
      <div style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <section id="reviews" style={{maxWidth:980,margin:'0 auto',padding:'72px 24px'}}>
          <p className="sr" style={SL}>Real people. Real results.</p>
          <h2 className="sr" style={ST}>4,200+ people already free.</h2>
          <div className="sr" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,margin:'20px 0 48px'}}>
            <span style={{color:'var(--gold)',fontSize:20,letterSpacing:3}}>★★★★★</span>
            <span style={{fontWeight:700,fontSize:17}}>4.8 / 5</span>
            <span style={{color:'var(--muted)',fontSize:13}}>from 847 verified reviews</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:18}}>
            {[
              ['👩','Ashley M.','Smoked 11 years • Nashville, TN','$3,400/yr saved',"I've tried patches, gum, Zyban, every app. What made this different was Day 1 — logging every smoke before lighting up. By evening I couldn't believe how much the habit controlled me. Smoke-free since Day 5."],
              ['👨','Jordan T.','Vaped 3 years • Austin, TX','$2,160/yr saved',"Was going through 2 pods a day without realizing the cost. The savings calculator showed me $180 a month. The 3-minute breathing timer actually works. Best $8 I've ever spent by a mile."],
              ['👨','Marcus R.','Marlboros 8 years • Chicago, IL','$4,100/yr saved',"The identity shift on Day 6 changed everything. I stopped saying 'I'm trying to quit' and started saying 'I don't smoke.' My wife cried when I hit Day 21. I've told everyone I know."],
              ['👩','Danielle K.','Smoking & vaping • Phoenix, AZ','$5,200/yr saved',"Was doing both — smoking at work, vaping at home. The Awareness Days were a revelation. Seeing my own craving patterns made the habit feel manageable for the first time. 6 weeks clean."],
              ['👨','Ryan H.','Pack a day 14 years • Dallas, TX','$4,800/yr saved',"The live savings counter finally made the money real. Day 8 I had $57 saved. By Day 21 it was $145. 4 months in and that money is actually in my savings account now."],
              ['👩','Priya S.','Vaping 4 years • Seattle, WA','$1,800/yr saved',"Skeptical a $7.99 program could beat the $300 options I tried. It did. Daily content is short and genuinely smart — not preachy. The craving timer is magic when it hits you at 2pm."],
            ].map(([av,name,info,saved,text])=>(
              <div key={name} className="sr" style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,padding:22}}>
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
          {[['✓','No time limits','on your refund'],['✓','No forms','to fill out'],['✓','No questions','asked']].map(([t,a,b])=>(
            <div key={a} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 10px',textAlign:'center'}}>
              <div style={{color:'var(--green)',fontWeight:800,fontSize:16,marginBottom:3}}>{t}</div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:1}}>{a}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div style={{background:'var(--bg3)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <section id="faq" style={{maxWidth:640,margin:'0 auto',padding:'72px 24px'}}>
          <p className="sr" style={SL}>FAQ</p>
          <h2 className="sr" style={{...ST,marginBottom:40}}>Honest answers.</h2>
          {[
            ['Does this work for vaping too?','Yes — built for both. Select your type during intake and the entire program adapts to you.'],
            ['Do I need to download an app?','No download ever. Instant browser access on any phone. Add it to your home screen for one-tap access.'],
            ['What exactly is the money-back guarantee?','Complete all 21 days and still smoke? Email hello@smarterquit.com with your receipt. Full refund within 5 business days. No questions asked.'],
            ['Why is it $7.99 right now?','We just launched and want 10,000 success stories before we raise the price. The program is worth $19.99. Get it at launch price now.'],
            ['I\'ve failed before. Why will this work?','Because it doesn\'t fight willpower. Day 1 you still smoke — you just study your habit. Once you understand the trap, the desire changes. Most people call Day 3 a turning point.'],
            ['How much time per day?','5-10 minutes. A short read each morning and the craving button when needed (10 seconds per craving). Built for real, busy lives.'],
            ['What if I slip up?','Keep going. A slip is data, not failure. Log it, understand the trigger, continue. The program expects this.'],
          ].map(([q,a],i)=>(
            <details key={i} className="sr" style={{borderBottom:'1px solid var(--border)'}}>
              <summary style={{padding:'20px 0',fontSize:16,fontWeight:600,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',userSelect:'none'}}>
                {q}<span style={{color:'var(--green)',fontSize:22,flexShrink:0,marginLeft:16}}>+</span>
              </summary>
              <div style={{paddingBottom:18,fontSize:15,color:'var(--muted)',lineHeight:1.7}}>{a}</div>
            </details>
          ))}
        </section>
      </div>

      {/* FINAL CTA */}
      <section style={{background:'linear-gradient(160deg,rgba(0,230,118,0.06),transparent 60%)',borderTop:'1px solid rgba(0,230,118,0.12)',padding:'80px 24px',textAlign:'center'}}>
        <h2 style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:'clamp(44px,8vw,80px)',letterSpacing:'0.02em',lineHeight:0.95,marginBottom:20}}>
          Your last first<br/><span style={{color:'var(--green)'}}>day one.</span>
        </h2>
        <p style={{color:'var(--muted)',fontSize:17,maxWidth:460,margin:'0 auto 40px',lineHeight:1.65}}>
          You've tried before. This time you have a real system, a real method, and nothing to lose.
        </p>
        <div style={{maxWidth:380,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:14}}>
            <span style={{fontSize:15,color:'var(--muted)',textDecoration:'line-through'}}>$19.99</span>
            <span style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:42,color:'var(--green)',lineHeight:1}}>$7.99</span>
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
          <span style={{fontSize:12,color:'var(--muted)',textDecoration:'line-through'}}>$19.99</span>
          <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>$7.99 — Launch Price</span>
        </div>
        <button onClick={go} className="btn" style={{fontSize:17,padding:16}}>Start Now — $7.99 🚭</button>
      </div>

      <ScrollReveal/>
    </>
  )
}


function PaymentIcons(){
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap',marginTop:8}}>
      <span style={{fontSize:11,color:'var(--muted)'}}>Accepted:</span>
      {/* Visa - white bg, original blue color */}
      <div style={{background:'#fff',borderRadius:5,padding:'3px 10px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/visa.svg" alt="Visa" style={{height:16,display:'block'}}/>
      </div>
      {/* Mastercard - no bg, already colorful */}
      <div style={{height:26,display:'flex',alignItems:'center'}}>
        <img src="/mastercard.svg" alt="Mastercard" style={{height:24,display:'block'}}/>
      </div>
      {/* Apple Pay - black bg, invert to white */}
      <div style={{background:'#000',borderRadius:5,padding:'3px 10px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/applepay.svg" alt="Apple Pay" style={{height:16,display:'block',filter:'invert(1)'}}/>
      </div>
      {/* Google Pay - white bg, original colors */}
      <div style={{background:'#fff',borderRadius:5,padding:'3px 8px',height:26,display:'flex',alignItems:'center'}}>
        <img src="/googlepay.svg" alt="Google Pay" style={{height:16,display:'block'}}/>
      </div>
      {/* SSL lock */}
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
