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

export default function Terms() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>Smarter<span style={{color:'#00e676'}}>Quit</span></Link>
        <h1 style={S.h1}>Terms of Service</h1>
        <p style={S.date}>Last updated: January 1, 2025</p>

        <p style={S.p}>By purchasing and using SmarterQuit ("Service"), you agree to these Terms of Service. Please read them carefully before purchasing.</p>

        <h2 style={S.h2}>1. Description of Service</h2>
        <p style={S.p}>SmarterQuit provides a 21-day digital program designed to support individuals in quitting smoking and/or vaping. The program includes daily educational content, a craving logging tool, progress tracking, and personalized savings calculations.</p>
        <p style={S.p}><strong>Important:</strong> SmarterQuit is an educational and motivational program. It is not a medical treatment, and it does not replace professional medical advice. If you have health concerns related to smoking cessation, please consult a qualified healthcare professional.</p>

        <h2 style={S.h2}>2. Eligibility</h2>
        <p style={S.p}>You must be at least 18 years of age to purchase and use this Service. By using the Service, you represent and warrant that you meet this requirement.</p>

        <h2 style={S.h2}>3. Purchase and Access</h2>
        <p style={S.p}>Upon completing payment of $7.99 USD, you receive immediate access to the SmarterQuit 21-day program. Access is granted for the individual purchaser only and may not be transferred, shared, or resold.</p>
        <p style={S.p}>Your program progress is stored locally on your device. We recommend completing the program on a consistent device for the best experience.</p>

        <h2 style={S.h2}>4. Refund Policy</h2>
        <p style={S.p}>We offer a conditional money-back guarantee. To qualify for a full refund:</p>
        <ul style={S.ul}>
          <li>You must complete all 21 days of the program</li>
          <li>You must log cravings throughout the program</li>
          <li>You must read the daily content for each day</li>
          <li>You must complete the daily tasks</li>
          <li>You must still be smoking or vaping at the end of Day 21</li>
          <li>You must request your refund within 30 days of purchase</li>
        </ul>
        <p style={S.p}>To request a refund, email <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a> with your purchase receipt. Refunds are processed within 5 business days.</p>

        <h2 style={S.h2}>5. Intellectual Property</h2>
        <p style={S.p}>All content within the SmarterQuit program — including daily texts, methods, design, and code — is the intellectual property of SmarterQuit and is protected by copyright. You may not reproduce, distribute, or create derivative works from this content without explicit written permission.</p>

        <h2 style={S.h2}>6. Disclaimer of Warranties</h2>
        <p style={S.p}>The Service is provided "as is" without warranties of any kind. While we believe strongly in the effectiveness of our method, we cannot guarantee that every user will successfully quit smoking or vaping. Results vary based on individual commitment, addiction severity, and consistency of use.</p>

        <h2 style={S.h2}>7. Limitation of Liability</h2>
        <p style={S.p}>SmarterQuit shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you for any claim shall not exceed the amount you paid for the Service ($7.99).</p>

        <h2 style={S.h2}>8. Medical Disclaimer</h2>
        <p style={S.p}>SmarterQuit is not a medical product and is not approved by the FDA or any other regulatory body as a smoking cessation treatment. The program is based on behavioral and psychological principles. If you experience severe withdrawal symptoms, please consult a doctor. Nicotine replacement therapy (patches, gum) and prescription medications may be used alongside this program.</p>

        <h2 style={S.h2}>9. Governing Law</h2>
        <p style={S.p}>These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved through binding arbitration rather than court proceedings.</p>

        <h2 style={S.h2}>10. Changes to Terms</h2>
        <p style={S.p}>We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

        <h2 style={S.h2}>11. Contact</h2>
        <p style={S.p}>Questions about these Terms: <a href="mailto:hello@smarterquit.com" style={{color:'#00e676'}}>hello@smarterquit.com</a></p>

        <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <Link to="/" style={{color:'#00e676',textDecoration:'none',fontSize:14}}>← Back to SmarterQuit</Link>
        </div>
      </div>
    </div>
  )
}
