import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',background:'#080c10',color:'#f0f4f8',fontFamily:'system-ui,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',maxWidth:400}}>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:'0.05em',marginBottom:32}}>
          Smarter<span style={{color:'#00e676'}}>Quit</span>
        </div>
        <div style={{fontSize:72,marginBottom:16}}>🚭</div>
        <h1 style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:28,marginBottom:12}}>Page not found.</h1>
        <p style={{color:'#5a7a96',fontSize:16,lineHeight:1.6,marginBottom:32}}>This page doesn't exist. But your quit journey does.</p>
        <Link to="/" style={{display:'inline-block',background:'#00e676',color:'#000',textDecoration:'none',borderRadius:10,padding:'14px 28px',fontSize:15,fontWeight:800,marginBottom:12}}>
          Go to homepage →
        </Link>
        <br/>
        <Link to="/app" style={{color:'#5a7a96',fontSize:14,textDecoration:'none'}}>Or open my program</Link>
      </div>
    </div>
  )
}
