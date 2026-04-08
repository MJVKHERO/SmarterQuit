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
}

export default function Privacy() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>Smarter<span style={{color:'#00e676'}}>Quit</span></Link>
        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.date}>Last updated: January 1, 2025</p>

        <p style={S.p}>SmarterQuit ("we," "us," or "our") operates the website smarterquit.com and provides the SmarterQuit 21-day quit smoking and vaping program ("Service"). This Privacy Policy explains how we collect, use, and protect your information.</p>

        <h2 style={S.h2}>1. Information We Collect</h2>
        <p style={S.p}><strong>Information you provide directly:</strong></p>
        <ul style={S.ul}>
          <li>Email address (provided at purchase via Stripe, and optionally at program completion)</li>
          <li>Intake information: what you're quitting, daily consumption, duration, weekly spend, and quit reason</li>
          <li>Craving logs: timestamp, strength rating, and trigger category</li>
        </ul>
        <p style={S.p}><strong>Information collected automatically:</strong></p>
        <ul style={S.ul}>
          <li>Program progress data stored locally on your device (via localStorage)</li>
          <li>Basic usage analytics (page views, session duration) via anonymous analytics</li>
        </ul>
        <p style={S.p}><strong>Payment information:</strong> Payments are processed by Stripe. We do not store your credit card information. Stripe's privacy policy governs their handling of payment data.</p>

        <h2 style={S.h2}>2. How We Use Your Information</h2>
        <ul style={S.ul}>
          <li>To provide and personalize your 21-day program</li>
          <li>To calculate and display your personal savings and progress</li>
          <li>To send program-related emails if you have opted in</li>
          <li>To process refund requests</li>
          <li>To improve our program based on anonymized usage data</li>
        </ul>

        <h2 style={S.h2}>3. Data Storage</h2>
        <p style={S.p}>Your program data (intake answers, craving logs, progress) is stored locally on your device using browser localStorage. This data does not leave your device unless you explicitly share it. We do not have a server that stores your personal program data.</p>
        <p style={S.p}>Your email address (if provided) is stored securely and never sold to third parties.</p>

        <h2 style={S.h2}>4. Data Sharing</h2>
        <p style={S.p}>We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share information with:</p>
        <ul style={S.ul}>
          <li><strong>Stripe:</strong> For payment processing</li>
          <li><strong>Email service providers:</strong> To send program emails (if you opted in)</li>
          <li><strong>Law enforcement:</strong> If required by law</li>
        </ul>

        <h2 style={S.h2}>5. Cookies</h2>
        <p style={S.p}>We use minimal cookies necessary for the site to function. We do not use advertising cookies or sell data to advertisers. You can disable cookies in your browser settings, though this may affect program functionality.</p>

        <h2 style={S.h2}>6. Your Rights</h2>
        <p style={S.p}>You have the right to:</p>
        <ul style={S.ul}>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>
        <p style={S.p}>To exercise these rights, contact us at: <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a></p>

        <h2 style={S.h2}>7. Children's Privacy</h2>
        <p style={S.p}>Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.</p>

        <h2 style={S.h2}>8. Changes to This Policy</h2>
        <p style={S.p}>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>

        <h2 style={S.h2}>9. Contact</h2>
        <p style={S.p}>For privacy-related questions: <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a></p>

        <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <Link to="/" style={{color:'#00e676',textDecoration:'none',fontSize:14}}>← Back to SmarterQuit</Link>
        </div>
      </div>
    </div>
  )
}
