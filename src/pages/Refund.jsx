import { Link } from 'react-router-dom'

const S = {
  page: { minHeight:'100vh', background:'#080c10', color:'#f0f4f8', fontFamily:'system-ui,sans-serif', padding:'40px 24px 80px' },
  inner: { maxWidth:720, margin:'0 auto' },
  logo: { fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:26, letterSpacing:'0.05em', marginBottom:40, display:'block', textDecoration:'none', color:'#f0f4f8' },
  h1: { fontSize:36, fontFamily:"Georgia,serif", fontStyle:'italic', marginBottom:8 },
  date: { color:'#5a7a96', fontSize:14, marginBottom:48 },
  h2: { fontSize:20, fontWeight:700, marginTop:40, marginBottom:12, color:'#00e676' },
  p: { color:'rgba(240,244,248,0.8)', lineHeight:1.8, fontSize:15, marginBottom:16 },
  ul: { color:'rgba(240,244,248,0.8)', lineHeight:1.8, fontSize:15, marginBottom:16, paddingLeft:20 },
  highlight: { background:'rgba(0,230,118,0.08)', border:'1px solid rgba(0,230,118,0.25)', borderRadius:12, padding:'20px 24px', marginBottom:24 },
}

export default function Refund() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>Smarter<span style={{color:'#00e676'}}>Quit</span></Link>
        <h1 style={S.h1}>Refund Policy</h1>
        <p style={S.date}>Last updated: January 1, 2025</p>

        <div style={S.highlight}>
          <p style={{...S.p, marginBottom:0, color:'#f0f4f8'}}><strong>The short version:</strong> Complete all 21 days of the program and still be smoking or vaping? Email us within 30 days of purchase. We'll refund every dollar. No questions asked.</p>
        </div>

        <h2 style={S.h2}>Our Guarantee</h2>
        <p style={S.p}>We are confident in the SmarterQuit program. Our money-back guarantee is designed to protect customers who genuinely engage with the program but don't achieve their goal.</p>

        <h2 style={S.h2}>Refund Eligibility Requirements</h2>
        <p style={S.p}>To qualify for a full refund, all of the following must be true:</p>
        <ul style={S.ul}>
          <li><strong>Complete the program:</strong> You must have used the program on all 21 days (accessing daily content and logging at least one craving per day)</li>
          <li><strong>Still smoking or vaping:</strong> You must genuinely still be smoking or vaping at the conclusion of Day 21</li>
          <li><strong>Request within 30 days:</strong> Your refund request must be submitted within 30 days of your original purchase date</li>
        </ul>

        <h2 style={S.h2}>How to Request a Refund</h2>
        <p style={S.p}>Send an email to <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a> with:</p>
        <ul style={S.ul}>
          <li>Subject line: "Refund Request"</li>
          <li>Your purchase receipt or order number (from your Stripe receipt email)</li>
          <li>A brief description confirming you completed the program</li>
        </ul>
        <p style={S.p}>That's it. We don't require proof, extensive documentation, or lengthy explanations. We trust you.</p>

        <h2 style={S.h2}>Refund Processing</h2>
        <p style={S.p}>Approved refunds are processed within 5 business days and returned to the original payment method. Depending on your bank, funds may take 3–10 additional business days to appear in your account.</p>

        <h2 style={S.h2}>Non-Refundable Situations</h2>
        <p style={S.p}>Refunds will not be issued if:</p>
        <ul style={S.ul}>
          <li>The 30-day request window has passed</li>
          <li>The program was not completed (fewer than 21 days of use)</li>
          <li>The request is a duplicate of an already-processed refund</li>
        </ul>

        <h2 style={S.h2}>Questions</h2>
        <p style={S.p}>Any questions about this policy: <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a></p>

        <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <Link to="/" style={{color:'#00e676',textDecoration:'none',fontSize:14}}>← Back to SmarterQuit</Link>
        </div>
      </div>
    </div>
  )
}
