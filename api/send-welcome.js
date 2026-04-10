const RESEND_KEY = "re_TPkfUeqJ_E6AWR3c7fuUAmLkU1Zbhzeqa";

const EMAILS = {
  welcome: (personalLink) => ({
    subject: "Your SmarterQuit program is ready 🚭",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,sans-serif}
.w{max-width:560px;margin:0 auto;padding:40px 20px}
.c{background:#080c10;border-radius:16px;padding:40px;color:#f0f4f8}
.logo{font-size:28px;font-weight:900;letter-spacing:1px;margin-bottom:32px}
.logo span{color:#00e676}
h1{font-size:24px;font-weight:700;margin:0 0 12px;line-height:1.3}
p{color:#7a8fa6;font-size:16px;line-height:1.7;margin:0 0 20px}
.btn{display:block;background:#00e676;color:#000;text-decoration:none;text-align:center;padding:18px 32px;border-radius:10px;font-weight:800;font-size:17px;margin:28px 0}
.box{background:#111820;border:1px solid rgba(0,230,118,0.25);border-radius:12px;padding:20px;margin:24px 0}
.box p{color:#5a7a96;font-size:13px;margin:0 0 10px}
.box a{color:#00e676;font-size:14px;word-break:break-all}
.tip{background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:10px;padding:16px}
.tip p{color:#00e676;font-size:14px;margin:0}
.footer{text-align:center;margin-top:24px}
.footer p{color:#9a9a9a;font-size:13px;margin:0}
.footer a{color:#9a9a9a}
</style></head><body><div class="w"><div class="c">
<div class="logo">SMARTER<span>QUIT</span></div>
<h1>You're in. Your program starts now. 🚭</h1>
<p>You just made the smartest $7.99 decision of your life. Your 21-day quit program is ready and waiting.</p>
<a href="${personalLink}" class="btn">Open My Program →</a>
<div class="tip"><p>📲 <strong style="color:#f0f4f8">Bookmark this email.</strong> Your personal link below gives you access on any phone, tablet, or computer — forever.</p></div>
<div class="box"><p>Your personal access link:</p><a href="${personalLink}">${personalLink}</a></div>
<p>Day 1 is an awareness day — you can still smoke today. Your only job is to log every craving before you light up.</p>
<p style="color:#5a7a96;font-size:14px;">Questions? Just reply to this email.<br>— The SmarterQuit Team</p>
</div><div class="footer"><p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/privacy">Privacy</a> &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p></div></div></body></html>`
  }),

  day3: (personalLink) => ({
    subject: "Day 3 — tonight you say goodbye for real 🌅",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,sans-serif}
.w{max-width:560px;margin:0 auto;padding:40px 20px}
.c{background:#080c10;border-radius:16px;padding:40px;color:#f0f4f8}
.logo{font-size:24px;font-weight:900;letter-spacing:1px;margin-bottom:24px}
.logo span{color:#00e676}
h1{font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3}
p{color:#7a8fa6;font-size:15px;line-height:1.7;margin:0 0 16px}
.btn{display:block;background:#00e676;color:#000;text-decoration:none;text-align:center;padding:16px 28px;border-radius:10px;font-weight:800;font-size:16px;margin:24px 0}
.box{background:rgba(255,214,0,0.06);border:1px solid rgba(255,214,0,0.2);border-radius:12px;padding:16px;margin:20px 0}
.footer{text-align:center;margin-top:24px}
.footer p{color:#9a9a9a;font-size:13px}
.footer a{color:#9a9a9a}
</style></head><body><div class="w"><div class="c">
<div class="logo">SMARTER<span>QUIT</span></div>
<h1>Day 3. Tonight you stop. 🌅</h1>
<p>You've spent two days watching your habit. You've named the triggers. You know the loop.</p>
<p>Tonight is your last smoke. Not because you have to — because you now understand exactly what it has been giving you. And what it hasn't.</p>
<div class="box"><p style="color:rgba(255,214,0,0.9);font-size:14px;margin:0">💛 <strong style="color:#f0f4f8">Tonight:</strong> Smoke your last one consciously. Then throw everything away — packs, pods, lighters. Not one left "just in case". That one is a trap.</p></div>
<p>Tomorrow's cravings will be real. You have the 3-minute timer. Every craving peaks and passes in 3 minutes. Every single one.</p>
<a href="${personalLink}" class="btn">Open Day 3 →</a>
<p style="color:#5a7a96;font-size:14px;">You've got this.<br>— The SmarterQuit Team</p>
</div><div class="footer"><p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p></div></div></body></html>`
  }),

  day7: (personalLink) => ({
    subject: "Day 7 — you made it past the hardest week 🏆",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,sans-serif}
.w{max-width:560px;margin:0 auto;padding:40px 20px}
.c{background:#080c10;border-radius:16px;padding:40px;color:#f0f4f8}
.logo{font-size:24px;font-weight:900;letter-spacing:1px;margin-bottom:24px}
.logo span{color:#00e676}
h1{font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3}
p{color:#7a8fa6;font-size:15px;line-height:1.7;margin:0 0 16px}
.btn{display:block;background:#00e676;color:#000;text-decoration:none;text-align:center;padding:16px 28px;border-radius:10px;font-weight:800;font-size:16px;margin:24px 0}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
.stat{background:#111820;border-radius:10px;padding:14px;text-align:center}
.val{font-size:24px;font-weight:800;color:#00e676}
.lbl{font-size:11px;color:#5a7a96;text-transform:uppercase;letter-spacing:0.06em;margin-top:4px}
.footer{text-align:center;margin-top:24px}
.footer p{color:#9a9a9a;font-size:13px}
.footer a{color:#9a9a9a}
</style></head><body><div class="w"><div class="c">
<div class="logo">SMARTER<span>QUIT</span></div>
<h1>7 days. That was the hardest week. 🏆</h1>
<p>The first 7 days are when most people give up. The physical withdrawal is loudest, the cravings most frequent, the doubt strongest.</p>
<p>You're past all of that. Your dopamine system is normalizing. Cravings are getting shorter and less frequent.</p>
<div class="stats">
  <div class="stat"><div class="val">7</div><div class="lbl">Days free</div></div>
  <div class="stat"><div class="val">+30%</div><div class="lbl">Lung function</div></div>
</div>
<p>Check the Health tab in the app — your body has been quietly doing extraordinary things this week.</p>
<a href="${personalLink}" class="btn">Open Day 7 →</a>
<p style="color:#5a7a96;font-size:14px;">Week 2 is where identity shifts.<br>— The SmarterQuit Team</p>
</div><div class="footer"><p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p></div></div></body></html>`
  }),

  day14: (personalLink) => ({
    subject: "Day 14 — you're not 'quitting' anymore 🪞",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,sans-serif}
.w{max-width:560px;margin:0 auto;padding:40px 20px}
.c{background:#080c10;border-radius:16px;padding:40px;color:#f0f4f8}
.logo{font-size:24px;font-weight:900;letter-spacing:1px;margin-bottom:24px}
.logo span{color:#00e676}
h1{font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3}
p{color:#7a8fa6;font-size:15px;line-height:1.7;margin:0 0 16px}
.btn{display:block;background:#00e676;color:#000;text-decoration:none;text-align:center;padding:16px 28px;border-radius:10px;font-weight:800;font-size:16px;margin:24px 0}
.quote{background:rgba(0,230,118,0.08);border-left:3px solid #00e676;padding:16px 20px;border-radius:0 12px 12px 0;margin:20px 0}
.footer{text-align:center;margin-top:24px}
.footer p{color:#9a9a9a;font-size:13px}
.footer a{color:#9a9a9a}
</style></head><body><div class="w"><div class="c">
<div class="logo">SMARTER<span>QUIT</span></div>
<h1>14 days. Stop saying you're quitting. 🪞</h1>
<p>There's a word shift that matters around Day 14. People stop saying "I'm trying to quit" and start saying "I don't smoke."</p>
<p>One is a struggle. The other is an identity. You've earned the second one.</p>
<div class="quote"><p style="color:#00e676;font-size:15px;margin:0;font-style:italic">"I don't smoke." — Say it out loud. It's yours.</p></div>
<p>One week left. The final phase builds the permanent identity of someone who doesn't smoke.</p>
<a href="${personalLink}" class="btn">Open Day 14 →</a>
<p style="color:#5a7a96;font-size:14px;">See you on Day 21.<br>— The SmarterQuit Team</p>
</div><div class="footer"><p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p></div></div></body></html>`
  }),

  day21: (personalLink) => ({
    subject: "Day 21 — you are free. 🎉",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,sans-serif}
.w{max-width:560px;margin:0 auto;padding:40px 20px}
.c{background:#080c10;border-radius:16px;padding:40px;color:#f0f4f8}
.logo{font-size:24px;font-weight:900;letter-spacing:1px;margin-bottom:24px}
.logo span{color:#00e676}
h1{font-size:26px;font-weight:700;margin:0 0 16px;line-height:1.3;color:#00e676}
p{color:#7a8fa6;font-size:15px;line-height:1.7;margin:0 0 16px}
.btn{display:block;background:#00e676;color:#000;text-decoration:none;text-align:center;padding:16px 28px;border-radius:10px;font-weight:800;font-size:16px;margin:24px 0}
.big{text-align:center;font-size:52px;margin:20px 0}
.footer{text-align:center;margin-top:24px}
.footer p{color:#9a9a9a;font-size:13px}
.footer a{color:#9a9a9a}
</style></head><body><div class="w"><div class="c">
<div class="logo">SMARTER<span>QUIT</span></div>
<div class="big">🎉</div>
<h1>21 days. You are free.</h1>
<p>Not as a theory. As a lived reality — every day, from Day 1 when you chose to pay attention, through the withdrawal, through the hard moments.</p>
<p>You are no longer a smoker. You are someone who doesn't smoke. That is permanent if you choose it.</p>
<a href="${personalLink}" class="btn">See your Day 21 results →</a>
<p style="color:#5a7a96;font-size:14px;">We're proud of you. Really.<br>— The SmarterQuit Team</p>
</div><div class="footer"><p>© 2025 SmarterQuit &nbsp;·&nbsp; <a href="https://smarterquit.com/refund">Refund Policy</a></p></div></div></body></html>`
  }),
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, token, type = "welcome", day } = req.body;
  if (!email || !token) return res.status(400).json({ error: "Missing email or token" });

  const personalLink = `https://smarterquit.com/app?s=${token}`;
  const emailKey = type === "drip" ? `day${day}` : "welcome";
  const template = EMAILS[emailKey]?.(personalLink);

  if (!template) return res.status(400).json({ error: `Unknown email type: ${emailKey}` });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SmarterQuit <hello@smarterquit.com>",
        to: [email],
        ...template,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: data });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
