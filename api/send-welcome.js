export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ error: "Missing email or token" });
  }

  const personalLink = `https://smarterquit.com/app?s=${token}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer re_TPkfUeqJ_E6AWR3c7fuUAmLkU1Zbhzeqa`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SmarterQuit <hello@smarterquit.com>",
        to: [email],
        subject: "Your SmarterQuit program is ready 🚭",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:560px; margin:0 auto; padding:40px 20px; }
    .card { background:#080c10; border-radius:16px; padding:40px; color:#f0f4f8; }
    .logo { font-size:28px; font-weight:900; letter-spacing:1px; margin-bottom:32px; }
    .logo span { color:#00e676; }
    h1 { font-size:24px; font-weight:700; margin:0 0 12px; line-height:1.3; }
    p { color:#7a8fa6; font-size:16px; line-height:1.7; margin:0 0 20px; }
    .link-box { background:#111820; border:1px solid rgba(0,230,118,0.25); border-radius:12px; padding:20px; margin:24px 0; }
    .link-box p { color:#5a7a96; font-size:13px; margin:0 0 10px; }
    .link-box a { color:#00e676; font-size:14px; word-break:break-all; }
    .btn { display:block; background:#00e676; color:#000; text-decoration:none; text-align:center; padding:18px 32px; border-radius:10px; font-weight:800; font-size:17px; margin:28px 0; }
    .tip { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.2); border-radius:10px; padding:16px; }
    .tip p { color:#00e676; font-size:14px; margin:0; }
    .footer { text-align:center; margin-top:24px; }
    .footer p { color:#9a9a9a; font-size:13px; margin:0; }
    .footer a { color:#9a9a9a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">SMARTER<span>QUIT</span></div>
      <h1>You're in. Your program starts now. 🚭</h1>
      <p>You just made the smartest $7.99 decision of your life. Your 21-day quit program is ready and waiting.</p>
      <a href="${personalLink}" class="btn">Open My Program →</a>
      <div class="tip">
        <p>📲 <strong style="color:#f0f4f8">Bookmark this email.</strong> Your personal link below gives you access on any phone, tablet, or computer — forever.</p>
      </div>
      <div class="link-box">
        <p>Your personal access link:</p>
        <a href="${personalLink}">${personalLink}</a>
      </div>
      <p>Day 1 is an awareness day — you can still smoke today. Your only job is to log every craving before you light up. By tonight you'll understand your habit better than ever.</p>
      <p style="color:#5a7a96;font-size:14px;">Questions? Just reply to this email.<br>— The SmarterQuit Team</p>
    </div>
    <div class="footer">
      <p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/privacy">Privacy</a> &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
