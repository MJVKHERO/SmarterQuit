import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://srrxlvhggbhkoxiawcsg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── EMAIL ───────────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, token) => {
  if (!email || !token) return;
  try {
    await fetch("/api/send-welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    console.log("Welcome email sent to", email);
  } catch(e) {
    console.warn("Email send failed:", e);
  }
};

// ─── PAYMENT GATE ────────────────────────────────────────────────────
// After Stripe payment, success URL is: /app?cs={CHECKOUT_SESSION_ID}
// Personal link is: /app?s=TOKEN
// Returning on same device: localStorage has token + paid flag
const checkAccess = () => {
  const params = new URLSearchParams(window.location.search);
  const csSession = params.get("cs");   // Stripe checkout session ID
  const sToken    = params.get("s");    // Personal link token

  // New paying customer coming from Stripe
  if (csSession && csSession.startsWith("cs_")) {
    const newToken = crypto.randomUUID();
    localStorage.setItem("sq_token", newToken);
    localStorage.setItem("sq_paid", "true");
    localStorage.setItem("sq_stripe", csSession);
    window.history.replaceState({}, "", "/app");
    return { token: newToken, paid: true, isNew: true };
  }

  // Returning user via personal link
  if (sToken) {
    localStorage.setItem("sq_token", sToken);
    localStorage.setItem("sq_paid", "true");
    window.history.replaceState({}, "", "/app");
    return { token: sToken, paid: true, isNew: false };
  }

  // Same device — check localStorage
  const storedToken = localStorage.getItem("sq_token");
  const storedPaid  = localStorage.getItem("sq_paid");
  if (storedToken && storedPaid === "true") {
    return { token: storedToken, paid: true, isNew: false };
  }

  // Not paid — no access
  return { token: null, paid: false, isNew: false };
};

// ─── DATA LAYER ──────────────────────────────────────────────────────
const lsGet = (k, d) => { try { const v = localStorage.getItem("sq_"+k); return v ? JSON.parse(v) : d; } catch { return d; }};
const lsSet = (k, v) => localStorage.setItem("sq_"+k, JSON.stringify(v));

const saveIntake = async (token, data) => {
  const normalized = data.email ? {...data, email: data.email.toLowerCase().trim()} : data;
  lsSet("intake", normalized);
  // Map JS camelCase fields explicitly to Supabase column names
  try {
    await sb.from("intake").upsert({
      session_token:  token,
      quit_type:      normalized.quitType   || normalized.quit_type,
      amount:         normalized.amount,
      years:          normalized.years,
      weekly_spend:   normalized.weeklySpend || normalized.weekly_spend,
      reason:         normalized.reason,
      email:          normalized.email,
      start_date:     normalized.startDate  || normalized.start_date,
      yearly:         normalized.yearly,
      updated_at:     new Date().toISOString(),
    });
  } catch(e) { console.warn("Supabase intake:", e); }
};

const loadIntake = async (token) => {
  try {
    const { data } = await sb.from("intake").select("*").eq("session_token", token).maybeSingle();
    if (data) {
      // Normalize Supabase snake_case back to camelCase for the app
      const normalized = {
        ...data,
        quitType:    data.quit_type    || data.quitType,
        weeklySpend: data.weekly_spend || data.weeklySpend,
        startDate:   data.start_date   || data.startDate,
      };
      lsSet("intake", normalized);
      return normalized;
    }
  } catch(e) { console.warn("Supabase loadIntake:", e); }
  // Fallback to localStorage (same device)
  return lsGet("intake", null);
};
const saveCraving = async (token, craving) => {
  const withTimestamp = {...craving, timestamp: craving.timestamp || new Date().toISOString()};
  const list = lsGet("cravings", []);
  list.push(withTimestamp);
  lsSet("cravings", list);
  try {
    await sb.from("cravings").insert({
      session_token: token,
      timestamp:     withTimestamp.timestamp,
      strength:      withTimestamp.strength,
      trigger:       withTimestamp.trigger,
      type:          withTimestamp.type,
      satisfaction:  withTimestamp.satisfaction || null,
      day_number:    withTimestamp.day || null,
      craving:       withTimestamp.craving || null,
    });
  } catch(e) { console.warn("saveCraving:", e); }
};

const loadCravings = async (token) => {
  try {
    const { data } = await sb.from("cravings")
      .select("*")
      .eq("session_token", token)
      .order("created_at", {ascending:true});
    if (data?.length > 0) {
      // Normalize fields back to what the app expects
      const normalized = data.map(c => ({
        ...c,
        timestamp: c.timestamp || c.created_at,
        day:       c.day_number || c.day,
        type:      c.type || "craving",
      }));
      lsSet("cravings", normalized);
      return normalized;
    }
  } catch(e) { console.warn("loadCravings:", e); }
  return lsGet("cravings", []);
};
const saveProgress = async (token, prog) => {
  lsSet("progress", prog);
  try { await sb.from("progress").upsert({ session_token: token, ...prog, updated_at: new Date().toISOString() }); } catch(e) { console.warn(e); }
};
const loadProgress = async (token) => {
  try {
    const { data } = await sb.from("progress").select("*").eq("session_token", token).maybeSingle();
    if (data) { lsSet("progress", data); return data; }
  } catch(e) { console.warn(e); }
  return lsGet("progress", null);
};
const findTokenByEmail = async (email) => {
  try {
    const { data } = await sb.from("intake").select("session_token").eq("email", email.toLowerCase().trim()).maybeSingle();
    return data?.session_token || null;
  } catch(e) { return null; }
};

// ─── HELPERS ─────────────────────────────────────────────────────────
const daysSince=(d)=>d?Math.floor((Date.now()-new Date(d).getTime())/(864e5)):0;
const fmtMoney=(n)=>{
  if(n<0.01) return "$0.00";
  if(n<10) return "$"+n.toFixed(4).replace(/0+$/,'').replace(/\.$/,'');
  if(n<100) return "$"+n.toFixed(2);
  return "$"+Math.round(n).toLocaleString();
};
const todayStr=()=>new Date().toDateString();
const isToday=(ts)=>{
  if(!ts) return false;
  try{ return new Date(ts).toDateString()===new Date().toDateString(); }
  catch{ return false; }
};

// ─── THEME ─────────────────────────────────────────────────────────
const T = {
  bg:"#080c10",bg2:"#0d1117",bg3:"#111820",bg4:"#161e28",
  green:"#00e676",greenDim:"rgba(0,230,118,0.10)",greenBorder:"rgba(0,230,118,0.25)",
  white:"#f0f4f8",muted:"#5a7a96",muted2:"#2e4a60",
  red:"#ff5252",gold:"#ffd600",blue:"#40c4ff",orange:"#ff9800",
  border:"rgba(255,255,255,0.07)",
};

// ─── DAILY CONTENT (all 21 days) ──────────────────────────────────
const DAYS=[
  {day:1,phase:"Awareness",emoji:"👁️",phaseColor:T.gold,
   title:"The Awareness Day",subtitle:"Today you still smoke — but now you pay attention.",
   intro:"Welcome to Day 1. Before anything else: you don't need to stop today. That's not a trick. Today's entire job is to watch. Every time you smoke or vape today, you're going to log it first — before you light up — and then tell us how it felt after. By tonight you'll understand your habit better than you ever have. That understanding is your real weapon.",
   content:[
     {type:"hook",text:"Most quit attempts fail because people try to fight something they don't understand. They grit their teeth, use willpower, and eventually the habit wins. Today we do the opposite. We study the enemy."},
     {type:"science",label:"Why awareness works",text:"Every habit runs the same loop: Trigger → Craving → Action → Reward. Smoking hijacked this system years ago. The 'reward' isn't pleasure — it's simply the relief of ending a craving that nicotine itself created. It's a trap that manufactures its own demand. Once you can see the loop running in real time, you can step outside it."},
     {type:"text",text:"Today when you feel the urge to smoke or vape, come to the app FIRST. Rate the craving, identify what triggered it, then go ahead and smoke. After, come back and tell us how it actually felt. Were you satisfied? Relieved? Did it live up to what your brain promised? This data is gold."},
     {type:"insight",label:"The real addiction",text:"You are not addicted to nicotine. You are addicted to moments. Nicotine leaves your bloodstream in 90 minutes. The habit stays for years because it's attached to your daily rituals, your emotions, your identity. The good news: moments can be replaced. Nicotine dependency fades in 72 hours. We have 21 days."},
   ],
   task:{emoji:"📊",title:"Log every smoke today — before AND after",desc:"Before you light up: rate your craving and name the trigger. After: tell us how it felt. No judgment. Pure data. This single day of honest logging will guide everything that follows."},
  },
  {day:2,phase:"Awareness",emoji:"🗺️",phaseColor:T.gold,
   title:"Your Enemy Has a Name",subtitle:"Look at yesterday's data. Your pattern is already visible.",
   intro:"Yesterday you watched your habit run. Now look at what you collected. When did cravings spike? What triggered them? Was the satisfaction as high as the craving predicted? Most people find a gap — the craving promised a 9, the cigarette delivered a 5. That gap is where your freedom lives.",
   content:[
     {type:"hook",text:"Your smoking isn't random. It follows a precise pattern — specific times, specific emotions, specific situations. Now that you can see the pattern, you're no longer just a participant. You're an observer. And observers have power that participants don't."},
     {type:"science",label:"The satisfaction gap",text:"Research shows that smokers consistently overestimate how satisfying a cigarette will be before smoking it, and underestimate how quickly the satisfaction fades after. The craving feels urgent and the payoff feels huge. The actual experience is usually a 5 or 6 out of 10. This mismatch is what you'll use to dismantle the habit."},
     {type:"text",text:"Today, same as yesterday — you still smoke. But now when a trigger fires, say out loud: 'There it is. That's the stress trigger.' or 'That's the boredom trigger.' Just name it. Don't fight it. Naming an experience activates your prefrontal cortex — the rational brain — and weakens the automatic response. It's tiny. It compounds."},
     {type:"insight",label:"Your top triggers",text:"Most smokers have 3–4 core triggers that drive 80% of their smoking. Identifying yours is more valuable than any patch or medication because it tells you exactly what to prepare for when you stop."},
   ],
   task:{emoji:"🔍",title:"Name your top 3 triggers",desc:"Based on your logs from yesterday, identify the 3 situations or emotions that triggered the most cravings. These are your targets for the rest of the program. Write them in your head or out loud right now."},
  },
  {day:3,phase:"Awareness",emoji:"🌅",phaseColor:T.gold,
   title:"The Last One",subtitle:"Tonight you say a conscious goodbye.",
   intro:"You've spent two days watching. You've named the triggers. You know the pattern. Tomorrow you stop. Not because we're forcing you — but because you now have the clearest picture you've ever had of what this habit actually is and what it actually gives you. Tonight, make the last one deliberate.",
   content:[
     {type:"hook",text:"There's a difference between quitting by white-knuckling and quitting because you understand. Allen Carr spent 30 years studying smokers and concluded the same thing: the moment you truly see the trap for what it is, the desire to be in it disappears. Today is that moment."},
     {type:"science",label:"What nicotine actually does",text:"Nicotine stimulates dopamine release — but only slightly more than a good meal or a walk. The 'rush' of a cigarette is mostly the relief of ending a craving that nicotine created in the first place. Non-smokers don't have that craving. They're not missing out. They're simply free of the cycle. Tomorrow you start joining them."},
     {type:"text",text:"Tonight: smoke or vape your last one fully consciously. Taste it. Feel your lungs. Notice if it's as good as your brain has been promising — or whether most of the satisfaction is just relief. Then throw everything away: packs, pods, cartridges, lighters. Not 'keep one for emergencies.' That one is a tripwire, not a backup."},
     {type:"insight",label:"What happens tomorrow",text:"Day 4 will have cravings — real, loud, urgent ones. But you now know something most quitters don't: every craving is just your old habit looking for its response. It will peak in 3 minutes and pass. Every single one. Without exception. And every one you let pass makes the next one slightly weaker. That's not motivation. That's neuroscience."},
   ],
   task:{emoji:"🗑️",title:"Clear the field tonight",desc:"After your last smoke — throw everything away. You are not depriving yourself of something good. You are removing a trap. Tomorrow when you wake up, there should be nothing in your house, car, or bag. Clear the field."},
  },
  {day:4,phase:"Detox",emoji:"⚡",phaseColor:T.blue,
   title:"Hour One",subtitle:"The first 24 hours are the loudest. They are also the last of the worst.",
   intro:"You've started. Right now your body is already changing. Within 20 minutes of your last cigarette, blood pressure dropped. Within 8 hours, carbon monoxide in your blood has halved. Your body has been waiting for this moment for years. Today is going to have cravings — use the 3-minute timer every single time. Every craving you beat today makes the next one weaker.",
   content:[
     {type:"hook",text:"Cravings feel permanent. They are not. Every single craving peaks within 3 minutes and then recedes. Your only job today is to let each wave pass. Not fight it. Not suppress it. Just let it pass. You've already built the tools to do this."},
     {type:"science",label:"What's happening in your brain",text:"Without nicotine, your dopamine system is temporarily running low — that's the irritability, fog, and restlessness. Your brain's nicotinic receptors are recalibrating. This is real and it's temporary. Peak withdrawal is typically 12–24 hours after your last cigarette. You are in it right now. You are also already through the worst of it."},
     {type:"text",text:"When a craving hits today: open the app, start the 3-minute breathing timer, and ride the wave. In through the nose for 4, hold for 4, out through the mouth for 6. Repeat until the timer ends. The craving will be smaller on the other side. Every time."},
     {type:"insight",label:"The 3-minute rule",text:"Cravings are waves, not walls. They rise, peak, and fall — always within 3 minutes. This is documented in clinical addiction research and reported consistently by ex-smokers. The craving feels like it will last forever. It will last 3 minutes. Use the timer."},
   ],
   task:{emoji:"💧",title:"Use the timer for every craving today",desc:"Every time a craving hits: open the craving button, start the 3-minute timer, breathe. Don't try to fight it with willpower. Just breathe and wait. You're not strong-arming this. You're surfing a 3-minute wave."},
  },
  {day:5,phase:"Detox",emoji:"🧠",phaseColor:T.blue,
   title:"Your Brain is Rebuilding",subtitle:"The fog is real. The healing underneath it is also real.",
   intro:"You might feel mentally foggy today. Irritable. Restless. Like something is slightly off. That feeling is called withdrawal, and it means exactly one thing: your brain is recovering. Every uncomfortable feeling today is your nervous system recalibrating after years of artificial stimulation.",
   content:[
     {type:"hook",text:"After 48 hours, all nicotine is physically gone from your body. What remains is psychological — habit loops looking for their trigger response, and a brain recalibrating its chemistry. Both are manageable. You have the tools."},
     {type:"science",label:"48 hours of healing",text:"Your lung cilia — the tiny hairs that clear debris — are waking up after being suppressed by smoke. Your blood oxygen is normalized. Taste and smell are already improving. Your brain's dopamine receptors, which were downregulated by years of nicotine spikes, are beginning to upregulate — meaning everyday pleasures are starting to feel real again. This process accelerates dramatically over the next two weeks."},
     {type:"text",text:"Your brain will show you a highlight reel today — the perfect cigarette after dinner, the morning smoke with coffee, the satisfying exhale. It's edited. It's leaving out the automatic ones you barely noticed, the ones that tasted bad, the ones you wished you didn't need. When the highlight reel plays: let it run further. Add the real parts."},
     {type:"insight",label:"What's coming back",text:"Within days: food tastes better, colors look brighter, music hits differently. These are not metaphors. Nicotine's most insidious effect was making everything except smoking feel slightly flat. That effect is reversing right now."},
   ],
   task:{emoji:"🏃",title:"Move your body for 10 minutes",desc:"Physical movement is the most effective natural craving interrupt. When a craving hits today — walk, do pushups, climb stairs. 10 minutes of movement releases natural dopamine and interrupts the craving signal faster than almost anything else."},
  },
  {day:6,phase:"Detox",emoji:"🪞",phaseColor:T.blue,
   title:"The Identity Shift",subtitle:"Stop saying you're quitting. Start saying you don't smoke.",
   intro:"There is a huge psychological difference between 'I'm trying to quit smoking' and 'I don't smoke.' One is a struggle with an uncertain outcome. The other is a statement of identity. Starting today, you are not a smoker trying to quit. You are someone who doesn't smoke. These are different people.",
   content:[
     {type:"hook",text:"Every time you say 'I'm trying to quit,' you're confirming that smoking is still part of your identity — just a part you're fighting against. That's exhausting. Flip it. 'I don't smoke' is not a lie. It is a present-tense fact about who you are today."},
     {type:"science",label:"Identity-based habit change",text:"Researcher James Clear's work shows that identity-based change is the most durable form of habit change. When you act from identity ('I don't smoke') rather than outcome ('I'm trying to stop'), each resisted craving confirms your new self-concept. After enough confirmations, the new identity becomes the default."},
     {type:"text",text:"Today when someone offers, or when a situation triggers the old response: don't say 'I'm trying to quit.' Say 'I don't smoke.' No explanation. No apology. Two words. A closed door. Most people will just nod and move on. And every time you say it, you cast a vote for the person you're becoming."},
     {type:"insight",label:"The compound effect",text:"Day 6 of 'I don't smoke' means 6 pieces of evidence for your new identity. Day 21 means 21. By the end of this program, you won't be performing non-smoking. You'll be a non-smoker. Those are different."},
   ],
   task:{emoji:"🗣️",title:"Say it out loud right now",desc:"'I don't smoke.' Say it again. Once more. That's your line from today. Not 'I'm quitting.' Not 'I'm trying.' I. Don't. Smoke."},
  },
  {day:7,phase:"Detox",emoji:"🏆",phaseColor:T.blue,
   title:"One Week",subtitle:"You did what most people never do.",
   intro:"One week. The majority of quit attempts end before Day 3. You are past the physical peak of withdrawal. You are past the hardest cravings of the entire program. You've been smoke-free for seven consecutive days and your body has changed measurably. Take a moment with that.",
   content:[
     {type:"hook",text:"Seven days ago you smoked. Today, your blood pressure is lower, your resting heart rate has dropped, your lung cilia have recovered, your circulation has improved. These are not motivational claims. These are documented clinical outcomes of one week without smoking."},
     {type:"science",label:"One week of physical healing",text:"At 7 days: lung cilia fully recovered and actively clearing years of debris. Circulation in hands and feet measurably improved. Resting heart rate dropped by an average of 5–10 bpm. Taste and smell significantly enhanced. Carbon monoxide: completely gone since Day 2."},
     {type:"text",text:"What's left now is primarily psychological. Habit loops looking for their response. Situational triggers — specific places, times, emotions your brain associates with smoking. Occasional moments where your brain tries to negotiate ('just one won't hurt'). You already know the answer to that negotiation: NOPE. Not One Puff Ever."},
     {type:"insight",label:"The trajectory is clear",text:"Week 1 was withdrawal. Week 2 is identity solidification. Week 3 is freedom. Each week is genuinely easier than the last. Not because the cravings disappear — they'll still come occasionally — but because each one you beat makes you more certain of who you are."},
   ],
   task:{emoji:"🎯",title:"Count your wins from this week",desc:"Open your craving logs. Count the total cravings you beat this week. Each one was a moment your old brain said 'smoke' and you said no. Hold that number. That's your actual strength — not willpower, but evidence."},
   milestone:{emoji:"🏆",text:"1 Week Smoke-Free",sub:"Physical withdrawal is behind you. The hardest part is done."},
  },
  {day:8,phase:"Detox",emoji:"🌬️",phaseColor:T.blue,
   title:"Your Lungs Are Waking Up",subtitle:"That cough might be healing — not a problem.",
   intro:"If you've noticed more coughing this week, don't panic. That's your lungs doing something they haven't been able to do in years: clearing. The cilia that were paralyzed by smoke are now fully active and working overtime. The cough is the sound of healing.",
   content:[
     {type:"hook",text:"Smoke paralyzed the cilia in your airways — the tiny hairs that sweep mucus and debris upward and out. With smoke gone, they've recovered and they're clearing years of buildup. The cough typically peaks around Day 8 and fades over the next few weeks as the cleaning completes."},
     {type:"science",label:"Situational cravings",text:"Around Day 8, the physical cravings fade and situational ones take over. These are conditioned responses — your brain strongly associates certain situations with smoking (morning coffee, after meals, driving, stress). The nicotine is gone. What's left is pure memory and association. These respond to a different approach: change the situation, not just the behavior."},
     {type:"text",text:"For situational cravings: change something about the triggering situation. If morning coffee triggers it — drink it standing outside instead of sitting inside, or in a different room. If driving triggers it — keep water in the cupholder, chew gum, change the radio station. Disrupting the environmental cue disrupts the craving. You don't have to fight the urge; just rearrange the stage."},
     {type:"insight",label:"Day 8 neuroscience",text:"After 8 days, your dopamine receptors have begun upregulating — meaning your brain's ability to feel natural pleasure is measurably recovering. Things that felt flat or muted in the first week of withdrawal are starting to have more color. This accelerates significantly over the next two weeks."},
   ],
   task:{emoji:"☕",title:"Disrupt your strongest situational trigger",desc:"Identify the situation that most reliably triggers a craving and consciously change one thing about it today. Different location. Different order. Add a brief walk after. The craving is tied to the situation — change the situation."},
  },
  {day:9,phase:"Detox",emoji:"🎭",phaseColor:T.blue,
   title:"The Negotiator",subtitle:"Your brain will make you an offer today. Reject it with confidence.",
   intro:"Around Days 9–11, something subtle happens. The violent physical cravings have faded, and your brain makes a quieter, more dangerous argument: 'You've proven you can stop. Surely one cigarette won't hurt now?' This is called the negotiation. It's the most common trigger for relapse in the entire program.",
   content:[
     {type:"hook",text:"The negotiation feels rational. That's what makes it dangerous. It doesn't arrive as a desperate craving — it arrives as a reasonable thought. 'I've been so good. One won't restart everything.' Addiction researchers call this euphoric recall combined with minimization. It is a lie dressed in logic."},
     {type:"science",label:"Why one puff is never just one puff",text:"One cigarette after 9 smoke-free days doesn't mean you enjoyed one cigarette. It means you've reactivated the physical dependency and now face withdrawal again from the beginning. The neural pathway of addiction is still there — weakened, but intact. One puff is not a single event. It is a door. Every person who has relapsed after extended abstinence will tell you: it started with 'just one.'"},
     {type:"text",text:"When the negotiation appears: recognize it immediately for what it is. Say out loud: 'That's the negotiation. My old habit making its last argument. The answer is no.' Then do something physical immediately. The thought will pass in under 3 minutes, just like every other craving. It is not different. It is not special. It is the same wave."},
     {type:"insight",label:"NOPE",text:"Not One Puff Ever. Not because you're fragile. Because you've worked too hard to test whether 'just one' is really just one. You already know the answer. Keep the door closed."},
   ],
   task:{emoji:"🛡️",title:"Prepare your response right now",desc:"Say out loud: 'If the negotiation comes today, I will say: that's my old habit making its last argument. The answer is no. I don't smoke.' Having the response ready means you don't have to think under pressure."},
  },
  {day:10,phase:"Detox",emoji:"💎",phaseColor:T.blue,
   title:"Double Digits",subtitle:"10 days. Your dopamine system is coming back online.",
   intro:"Ten days smoke-free. Your brain has been rewiring every single day since Day 1 and by now the results are starting to be noticeable. The flat, grey quality that withdrawal brought in Week 1 is lifting. Things are starting to have color again.",
   content:[
     {type:"hook",text:"Nicotine's most insidious long-term effect was making everything except smoking feel slightly muted. Artificial dopamine spikes caused your brain to downregulate natural dopamine production — meaning real pleasures felt less real. At 10 days, that effect is significantly reversing."},
     {type:"science",label:"Dopamine recovery at Day 10",text:"At 10 days, your dopamine receptor density has measurably increased. Food tastes noticeably better. Music sounds more vivid. Exercise feels more rewarding. These are not placebo effects — they're the documented result of dopamine receptor upregulation after nicotine removal. The recovery continues for weeks."},
     {type:"text",text:"Today: look at your savings. 10 days of your daily cost. Now multiply that by 36 to see your year. Write that number down somewhere visible. Not as an abstraction — as a real thing you're going to do with it. A trip. A piece of equipment. An experience. Make it specific. Specific future rewards are dramatically more motivating than abstract savings."},
     {type:"insight",label:"Where you are vs where you started",text:"Day 1: full withdrawal load, every craving loud and urgent. Day 10: dopamine recovering, situational triggers manageable, identity shifting. The trajectory is unmistakable. The next 11 days aren't harder than the last 10. They're easier."},
   ],
   task:{emoji:"💰",title:"Make your savings real",desc:"Look at your savings counter. Multiply by 36. Decide what that money becomes. Name the thing specifically. Say it out loud. That's what your old habit was costing you every year."},
   milestone:{emoji:"💎",text:"10 Days — Double Digits",sub:"Dopamine recovering. Pleasures returning. Keep going."},
  },
  {day:11,phase:"Freedom",emoji:"🥂",phaseColor:T.green,
   title:"Social Situations",subtitle:"Someone will offer you one soon. Here's how to own that moment.",
   intro:"Welcome to the Freedom Phase. The physical battle is largely won. What remains is psychological — habit loops, situational triggers, and identity. Today we prepare for the most common real-world test: someone offering you a cigarette in a social situation.",
   content:[
     {type:"hook",text:"At some point soon, you'll be in a social situation where someone smokes or offers you one. Maybe it's already happened. This moment can feel like the hardest craving you've had. It usually isn't actually harder — it just has more sensory triggers firing simultaneously."},
     {type:"science",label:"Social smoking triggers",text:"Social situations activate what researchers call cue-induced craving — the combination of seeing smoke, smelling it, and the social association all fire the same neural pathway together. It can feel overwhelming because multiple systems activate at once. The 3-minute rule applies identically here. The craving will pass."},
     {type:"text",text:"Your line: 'No thanks, I don't smoke.' Not 'I'm trying to quit.' Not 'I'm on a program.' Not 'I've been doing really well.' Two words. I don't smoke. That's a closed door with nothing to push on. Most people will just nod and move on. The ones who push are showing you something about themselves, not something about you."},
     {type:"insight",label:"The win inside the challenge",text:"Every time you beat a craving in a social situation, you prove to yourself that you're free in the hardest conditions. That's not just surviving — that's building the most durable form of confidence: evidence from the real world."},
   ],
   task:{emoji:"💬",title:"Practice your line",desc:"Say out loud right now: 'No thanks, I don't smoke.' Again. One more time — naturally, relaxed, like you've said it a thousand times. That's the tone. Calm. Final. Not defensive."},
  },
  {day:12,phase:"Freedom",emoji:"🌊",phaseColor:T.green,
   title:"Stress Without Smoke",subtitle:"Smoking never reduced stress. It relieved a craving it created.",
   intro:"Stress was almost certainly one of your top triggers. Here's something important: smoking never actually reduced your stress. It temporarily relieved the stress of needing a cigarette. The net effect on your stress system was negative. Today you build a real stress tool.",
   content:[
     {type:"hook",text:"Smokers consistently report higher average stress levels than non-smokers — even controlling for lifestyle factors. This is because nicotine stimulates adrenaline, raises heart rate, and creates a stress-craving cycle. You were managing stress with something that was making your stress worse."},
     {type:"science",label:"The physiological sigh",text:"Stanford neuroscientist Andrew Huberman's research identified the physiological sigh as the most effective real-time stress reduction technique known. Two inhales through the nose (one long, one short on top), then one long exhale through the mouth. This deflates the air sacs in the lungs and rapidly activates the parasympathetic nervous system. Measurable cortisol reduction in under 30 seconds. Better than a cigarette by every metric."},
     {type:"text",text:"Beyond breathing: when stress hits today, name it. 'I'm stressed because of X.' This activates the prefrontal cortex and measurably reduces the amygdala's fear response — a phenomenon called affect labeling. It sounds too simple. The research is unambiguous. It works."},
     {type:"insight",label:"Your stress response is upgrading",text:"Without nicotine disrupting your nervous system, your baseline cortisol levels will normalize over the coming weeks. Most ex-smokers report that their general anxiety level is noticeably lower 30–60 days after quitting than it ever was while smoking. You're not losing a stress tool. You're getting a better one."},
   ],
   task:{emoji:"🌬️",title:"Learn the physiological sigh right now",desc:"Two quick inhales through the nose, then one long exhale through the mouth. Do it three times right now. That's your new stress response. Use it today every time you feel tension."},
  },
  {day:13,phase:"Freedom",emoji:"🤥",phaseColor:T.green,
   title:"The Lie",subtitle:"Your brain will show you a highlight reel. Make it show you the full film.",
   intro:"Around Day 13, your brain's most sophisticated defense mechanism activates: romanticization. A warm memory of smoking appears. A perfect evening cigarette. A deeply satisfying exhale. These memories feel real and powerful. They are selectively edited.",
   content:[
     {type:"hook",text:"Euphoric recall — your brain selectively retrieving positive memories of addictive behavior while suppressing the negatives — is documented in addiction medicine as the #1 cause of long-term relapse. Your limbic system does this automatically because the old habit is fighting for survival."},
     {type:"science",label:"The editing room",text:"You smoked roughly 365 times per year for every year you smoked. The vast majority of those cigarettes were automatic, unremarkable, and invisible. The handful of 'perfect' ones your brain is highlighting now are a tiny fraction of the actual dataset. The brain remembers the outliers, not the average. Don't make decisions based on edited highlights."},
     {type:"text",text:"When the warm memory appears: let it play further. Don't suppress it — complete it. The cigarette after dinner that felt perfect — add what came after. The morning cough. The cost. The ones you smoked automatically and barely registered. The times you were sick and still needed one. The smell. The full film is very different from the highlight reel."},
     {type:"insight",label:"The math",text:"The handful of 'perfect' cigarettes your brain is showing you vs. 13 days of freedom, improving health, growing savings, and a strengthening identity. The math is not close."},
   ],
   task:{emoji:"🎬",title:"Complete the highlight reel",desc:"When a nostalgic smoking memory appears today, consciously add the parts your brain is leaving out. Say them out loud if it helps. You're not trying to hate smoking — just see it clearly. The full picture."},
   milestone:{emoji:"🌟",text:"Day 13 — Two Weeks Tomorrow",sub:"The romanticization is your habit's last weapon. See it for what it is."},
  },
  {day:14,phase:"Freedom",emoji:"❤️",phaseColor:T.green,
   title:"Two Weeks",subtitle:"Your cardiovascular system has measurably changed.",
   intro:"Two weeks smoke-free. Not symbolically. Literally, clinically, measurably. The healing that started on Day 1 has been compounding every single day, and at the two-week mark, the numbers are significant.",
   content:[
     {type:"hook",text:"Your body has been repairing itself every moment since you stopped. Two weeks in, the changes are no longer microscopic — they're measurable by any standard medical test."},
     {type:"science",label:"Two weeks of healing — by the numbers",text:"Blood pressure: normalized to healthy baseline. Resting heart rate: dropped 5–10 bpm average. Lung function: up to 30% improvement from Day 1. Circulation: significantly improved — fingers and feet noticeably warmer in many ex-smokers. Cilia: fully recovered and operating normally. Skin: oxygenation improving, early signs of improved complexion. Risk of heart attack: already beginning to drop from its peak."},
     {type:"text",text:"Try this right now: take the deepest breath you can — slowly, all the way in. Hold for 3 seconds. Try to remember doing this same thing on Day 1 or Day 4. The difference you feel is two weeks of lung recovery. That difference will keep growing for months."},
     {type:"insight",label:"The long arc",text:"1 month: heart attack risk begins significant decline. 3 months: lung function up 30%. 1 year: coronary heart disease risk halved. 10 years: lung cancer risk near-halved. You started this arc two weeks ago and it runs for the rest of your life."},
   ],
   task:{emoji:"❤️",title:"Feel the physical difference",desc:"Take three deep, slow, maximum-depth breaths right now. Notice how far your lungs go. That's two weeks of healing. It grows every week."},
   milestone:{emoji:"❤️",text:"2 Weeks — Your Heart Thanks You",sub:"Lung function up 30%. Circulation improved. Heart risk dropping."},
  },
  {day:15,phase:"Freedom",emoji:"☀️",phaseColor:T.green,
   title:"The Morning",subtitle:"Reclaim the first 20 minutes of your day.",
   intro:"For many smokers, the morning cigarette was the most powerful ritual of the day. If mornings feel slightly off without it — like a piece of the routine is missing — that's a conditioned response, not a real need. Today you build something better.",
   content:[
     {type:"hook",text:"The morning cigarette felt essential because after 8 hours of sleep, nicotine levels were at their lowest. The 'perfect' morning smoke was perfect because it ended the most intense withdrawal of the day. You were medicating yourself the moment you woke up and calling it pleasure."},
     {type:"science",label:"Building a new morning anchor",text:"Habits are most strongly tied to time and location. Your morning smoking ritual was a habit anchor — a cue that started the day. Research on habit replacement shows that the anchor (morning, coffee, outside) needs a new response to replace the old one, not just an absence. The structure of 'deliberate morning ritual' is what you're rebuilding, not eliminating."},
     {type:"text",text:"A new morning anchor doesn't need to be long or impressive. 5 minutes outside without your phone. A specific coffee ritual you do slowly and consciously. A brief walk around the block. Two pages of something you're reading. One page of writing. The content matters less than the deliberateness. Something that says: I am choosing how my day starts."},
     {type:"insight",label:"The compound morning",text:"If you smoked a morning cigarette every day for 5 years, you spent roughly 1,825 mornings starting the day by poisoning yourself. Every morning from here goes differently. That compounds."},
   ],
   task:{emoji:"☀️",title:"Design your morning ritual",desc:"Decide on one specific thing you'll do tomorrow morning that gives you that 'start of day' presence. Do it deliberately. Own the first 20 minutes."},
  },
  {day:16,phase:"Freedom",emoji:"💵",phaseColor:T.green,
   title:"The Money Is Real",subtitle:"16 days of savings. Make it concrete.",
   intro:"Look at your savings counter. That number is not theoretical future money. That is real money that used to go directly from your pocket to a tobacco company, every single day, that is now yours. Today we make that concrete.",
   content:[
     {type:"hook",text:"Abstract savings are weak motivation. Specific, named savings are powerful. 'I'll save money by quitting' is weak. 'I'm taking that trip to Nashville with the $340 I've saved in 6 weeks' is strong. One is a concept. The other is a plan."},
     {type:"science",label:"The real annual cost",text:"Average American smoker: $2,000–$5,000 per year on cigarettes alone. Heavy vapers: $1,500–$3,000 per year on pods. Hidden costs add roughly 30% more: higher insurance premiums, dental costs, dry-cleaning. The real number most smokers spend annually is between $2,600 and $6,500. This is not a rounding error. This is a car payment. A vacation. A year of investment returns."},
     {type:"text",text:"Here's what works: decide right now what your first month of savings becomes. Make it specific and enjoyable — not responsible and boring. Something that makes you smile when you think about it. Write it down. Set it as your screensaver. Make it as real as possible in your mind. Future rewards work when they feel real."},
     {type:"insight",label:"The 5-year view",text:"At average spend, 5 years of not smoking = $10,000–$25,000. That is a down payment. An investment account. A trip you'll remember forever. Your old habit was quietly building a wall between you and those things, $15 at a time."},
   ],
   task:{emoji:"🎁",title:"Name your first reward",desc:"Decide right now what you're spending your first full month of savings on. Something specific and enjoyable. Say it out loud. Look at your savings counter. Every day you add to it."},
  },
  {day:17,phase:"Freedom",emoji:"🍺",phaseColor:T.green,
   title:"Danger Zones",subtitle:"Alcohol is the #1 relapse trigger. Know this before it happens.",
   intro:"Studies on smoking relapse consistently identify one factor above all others: alcohol. Not stress, not social pressure, not nostalgia. Alcohol. Here's why — and more importantly, here's how to handle it so it doesn't catch you off-guard.",
   content:[
     {type:"hook",text:"Alcohol and nicotine have a direct neurological relationship — each one increases the craving for the other at the receptor level. This is biology, not weakness. Alcohol also reduces inhibitory control in the prefrontal cortex — the exact part of your brain that says no to cravings. Drunk you is worse at saying no than sober you. That's the mechanism. Now you know it."},
     {type:"science",label:"The pre-commitment strategy",text:"The most effective protection against alcohol-triggered relapse is pre-commitment: making the decision before alcohol affects the decision-making system. Sober you sets the rule. You enforce it later. Research on self-control consistently shows that decisions made in advance, before temptation is present, are far more likely to be honored than decisions made in the moment of temptation."},
     {type:"text",text:"Before your next social drinking situation: decide in advance, clearly: 'I don't smoke. If a craving hits tonight, I will move to a different spot, drink water, and use the 3-minute timer.' Say it out loud now. The decision is made. When the situation comes, you're not making a choice — you're executing a plan."},
     {type:"insight",label:"This gets easier",text:"The alcohol-smoking association weakens as your non-smoking identity solidifies. Most ex-smokers report that after 2–3 months, alcohol no longer reliably triggers smoking cravings. You're in the window where it still can. Know it. Plan for it."},
   ],
   task:{emoji:"🛡️",title:"Set your pre-commitment right now",desc:"Think of the next social situation involving alcohol. Say out loud: 'When I'm there, if a craving hits, I will [your specific action].' Decide now. Your future self will thank you."},
  },
  {day:18,phase:"Freedom",emoji:"🫁",phaseColor:T.green,
   title:"Your Lungs Right Now",subtitle:"The healing you can't see is very real.",
   intro:"You can't see inside your lungs. But the healing happening in there right now, today, is clinically documented and measurable. Here's exactly what's going on.",
   content:[
     {type:"hook",text:"18 days ago, your lungs were inflamed, coated, and running on reduced capacity. Today: bronchial inflammation is measurably down. Mucus overproduction has normalized. Blood oxygen exchange has improved. The bronchioles are recovering flexibility. And the process is accelerating."},
     {type:"science",label:"The lung recovery timeline",text:"Day 1: carbon monoxide gone, blood oxygen normalized. Day 3: lung cilia begin recovering. Day 8: cilia fully recovered, active clearing begins. Day 14: lung function up to 30% improved. Day 18: bronchial inflammation significantly reduced. 1 month: coughing and shortness of breath dramatically reduced. 3 months: lung function up another 10–20%. 1 year: lung infection risk normalized."},
     {type:"text",text:"Test right now: inhale as slowly and deeply as you can — all the way in, maximum capacity. Hold for 3 seconds. Do this three times. Compare it to how breathing felt on Day 1. That difference is 18 days of repair work. And it continues."},
     {type:"insight",label:"The long-term picture",text:"10 years of not smoking: risk of lung cancer drops by approximately 50%. Your lungs don't 'remember' the smoking the way your habit memory does. They just heal. Every day they're not being damaged, they're recovering. That started 18 days ago and doesn't stop."},
   ],
   task:{emoji:"🫁",title:"Three deep breaths as a daily ritual",desc:"Every morning this week: three slow, maximum-depth breaths. In for 5, hold for 3, out for 7. Not just as breathing — as an acknowledgment of what's happening inside you. You'll feel the difference grow week by week."},
  },
  {day:19,phase:"Freedom",emoji:"🔭",phaseColor:T.green,
   title:"Almost Free",subtitle:"Two more days. Look back at how far you've come.",
   intro:"Day 19. Look back at Day 4. The person who woke up that morning in full withdrawal, white-knuckling through their first smoke-free day — that was you 15 days ago. Compare that to right now. The distance you've traveled is real.",
   content:[
     {type:"hook",text:"You're two days from Day 21. Not as an endpoint — because there's no endpoint in the sense that you go back to smoking after. But as a threshold. A milestone. The point at which a new behavior has been performed consistently enough to begin becoming automatic."},
     {type:"science",label:"What Day 21 means neurologically",text:"21 days of consistent non-performance of a habit produces measurable weakening of that neural pathway through synaptic pruning. The pathway doesn't disappear — but it loses efficiency. After 21 days, the old habit requires more activation energy to trigger a response. The new identity — 'I don't smoke' — has 21 pieces of evidence. That is a track record, not a wish."},
     {type:"text",text:"Think about the specific moments: the first social situation you navigated. The craving at Day 9 you let pass. The night you were stressed and didn't reach for one. The morning you woke up and didn't think about it until hours later. Each of those was a choice. 19 days of choices. That's who you are now."},
     {type:"insight",label:"Who you are now",text:"You are not a smoker who's trying to quit. You are not even a recent ex-smoker fighting it daily. At 19 days, you are increasingly simply someone who doesn't smoke. The label is shifting. The identity is landing. Two more days and it has your full name on it."},
   ],
   task:{emoji:"🔭",title:"Name three specific wins from the last 19 days",desc:"Three real moments where you chose yourself over the habit. A specific craving you beat. A social situation you navigated. A morning that felt different. Name them out loud. That's your evidence."},
  },
  {day:20,phase:"Freedom",emoji:"🌙",phaseColor:T.green,
   title:"The Last 24 Hours",subtitle:"Tomorrow you step across a real line.",
   intro:"One day left. Not because the program ends and then it's over — but because you've almost completed the foundation. Tomorrow is the day you step across the threshold most smokers never cross. Today is the last preparation.",
   content:[
     {type:"hook",text:"Think about how different today is from Day 4. The noise has quieted significantly. Cravings are situational now — not constant. They're shorter and weaker when they come. The identity of 'someone who doesn't smoke' isn't a performance anymore. It's increasingly just true."},
     {type:"text",text:"If a hard moment comes today — and it might — remember: Day 20 hard moments are fundamentally different from Day 4 hard moments. Day 4 was physical. Today is a thought. A flash of old habit looking for a gap. Find the gap and close it one final time. You've done this dozens of times. You know exactly how."},
     {type:"text",text:"Think about what you want Day 21 to feel like. How do you want to mark it? Something personal. Something real. It doesn't need to be a party or a ceremony. But it deserves a moment of acknowledgment — because what you've done is genuinely hard and it deserves to be recognized by the person who did it most: you."},
     {type:"insight",label:"What tomorrow is — and what it isn't",text:"Day 21 is not the end of all risk. Relapse can happen months or years later, especially in high-stress or high-alcohol situations. Day 21 is the beginning of a stable new default. The heavy lifting is done. What remains is lighter: stay alert to danger zones, keep the identity active, remember why you chose this. But the battle is won."},
   ],
   task:{emoji:"🌙",title:"Decide how you'll mark Day 21",desc:"Choose one thing you'll do tomorrow to acknowledge 21 days. A meal, a place, a call, a moment alone. Choose it deliberately. As a person who doesn't smoke."},
  },
  {day:21,phase:"Freedom",emoji:"🎉",phaseColor:T.green,
   title:"You Are Free",subtitle:"21 days. It's real. You did it.",
   intro:"21 days. Not as a theory. Not as an intention. As a lived reality — every single day, starting from Day 1 when you chose to pay attention, through the withdrawal, through the negotiation, through the nostalgia and the social pressure and the ordinary hard moments — you chose yourself.",
   content:[
     {type:"hook",text:"You are not someone who quit smoking. Quitters give things up. You are someone who no longer smokes — because you understood the trap, dismantled it carefully, and walked out the other side with your health, your money, and your identity intact."},
     {type:"science",label:"What 21 days has physically done",text:"Carbon monoxide: gone since Day 2. Nicotine metabolites: cleared by Day 4. Lung cilia: recovered by Day 10. Dopamine system: substantially restored. Blood pressure and resting heart rate: measurably improved. Lung function: up to 30% better than Day 1. Risk trajectory: every major smoking-related disease risk is declining from this day forward and will continue declining for years."},
     {type:"text",text:"The savings in your dashboard are real. Multiply them out — that's your year. Every year from here belongs to you. The health improvements are real and compound for decades. The identity — 'I don't smoke' — is backed by 21 consecutive days of evidence. That is not a fragile new habit. That is a track record."},
     {type:"insight",label:"The one thing going forward",text:"NOPE. Not One Puff Ever. Not because you're fragile — but because you're not. You've worked too hard to test whether 'just one' is really just one. You already know the answer. Keep the door closed. Everything else gets easier with time."},
   ],
   task:{emoji:"🎉",title:"Celebrate. You've earned it.",desc:"Do the thing you chose on Day 20. Tell one person what you've accomplished. Let them celebrate with you. You did something real. That deserves a real moment."},
   milestone:{emoji:"🎉",text:"21 Days — You Are Free",sub:"You are no longer a smoker. You are someone who doesn't smoke."},
  },
];

// ─── CRAVING RESPONSES ─────────────────────────────────────────────
const CRAVING_RESP={
  stress:{emoji:"😤",color:"#ff7043",label:"Stress",
    steps:["Double inhale: two quick inhales through the nose, then one long exhale through the mouth. Do this 3 times right now.","Name it out loud: 'I'm stressed because of ___.' Naming the emotion activates your rational brain and reduces the stress response.","This craving will peak and pass in under 3 minutes. You don't need to fight it. Start the timer and breathe."],
    reminder:"Smoking never reduced stress — it relieved the craving it created, while making your stress response worse. Your real stress tool is breathing."},
  boredom:{emoji:"😴",color:"#7c4dff",label:"Boredom",
    steps:["Stand up right now and walk to a different room or outside. Physical location change interrupts the craving signal immediately.","Drink a full glass of water slowly. Give your hands and mouth something real to do.","Boredom cravings are pure conditioning — your brain learned that boredom = smoke. That circuit weakens every time you don't feed it."],
    reminder:"You're not bored AND having a nicotine craving. You're just bored. Boredom passes on its own. Start the 3-minute timer."},
  habit:{emoji:"🔁",color:"#00b0ff",label:"Habit",
    steps:["Say out loud: 'I notice I want to smoke because of habit. My brain is running an old program. I'm watching it run. I choose not to feed it.'","Do something with your hands immediately — make tea, wash a dish, write something. Interrupt the motor pattern.","Habit cravings are automatic, not urgent. You're observing an old reflex. Watch it pass."],
    reminder:"This isn't a need. This is a program your brain learned to run automatically. You're watching it run without responding. That's how neural pathways weaken."},
  social:{emoji:"👥",color:"#00e5ff",label:"Social",
    steps:["Excuse yourself for 2 minutes — get a drink, step to the edge of the group. Give yourself physical distance from the sensory trigger.","Your line if offered: 'No thanks, I don't smoke.' No explanation. No apology. Closed door.","Social cravings feel stronger because smell + memory + association all fire at once. The 3-minute rule still applies. Always."],
    reminder:"Every time you beat a social craving, you prove your freedom in the hardest conditions. This is the most valuable moment in the program."},
};

// ─── UI ATOMS ──────────────────────────────────────────────────────
const Btn=({children,onClick,variant="primary",style={},disabled})=>{
  const base={border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:12,fontFamily:"inherit",fontWeight:700,fontSize:16,transition:"all 0.15s",opacity:disabled?0.45:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8};
  const vars={primary:{background:T.green,color:"#000",padding:"16px 28px"},secondary:{background:T.bg3,color:T.white,padding:"14px 24px",border:`1px solid ${T.border}`},ghost:{background:"transparent",color:T.muted,padding:"10px 16px",border:"none"}};
  return <button style={{...base,...vars[variant],...style}} onClick={onClick} disabled={disabled}>{children}</button>;
};
const Tag=({children,color=T.green})=>(
  <span style={{display:"inline-block",background:`${color}18`,border:`1px solid ${color}40`,color,padding:"4px 12px",borderRadius:100,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{children}</span>
);
const PBar=({value,max,color=T.green,height=6})=>(
  <div style={{background:T.bg2,borderRadius:99,height,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:99,transition:"width 0.5s ease"}}/>
  </div>
);

// ─── WELCOME / ORIENTATION SCREEN ─────────────────────────────────
function WelcomeScreen({intake,onStart}){
  const [step,setStep]=useState(0);
  const yearly=intake.yearly||0;
  const steps=[
    {icon:"👋",title:`Welcome${intake.name?", "+intake.name:""}. Let's talk about what's actually going to happen.`,
     content:<>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:16,lineHeight:1.8,marginBottom:16}}>Most quit programs hand you a list of tips and wish you luck. This isn't that. This is a <strong style={{color:T.white}}>structured 21-day process</strong> that works with your brain's actual mechanisms — not against them.</p>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:16,lineHeight:1.8,marginBottom:16}}>Before we start, you need to understand exactly what's going to happen and why. This will take 2 minutes. It will make everything easier.</p>
       <div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:16}}>
         <p style={{color:T.green,fontSize:15,fontWeight:600,margin:0}}>📱 Keep this app within reach. You'll use it multiple times a day — especially in the first week.</p>
       </div>
     </>},
    {icon:"🗺️",title:"The 3 phases of your program",
     content:<>
       {[["👁️","Days 1–3","Awareness Phase",T.gold,"You still smoke. But you log everything before and after. By Day 3 you'll understand your habit better than you ever have."],
         ["⚔️","Days 4–10","Detox Phase",T.blue,"You stop. Withdrawal is real but manageable — you'll have a 3-minute breathing timer and craving tools for every moment."],
         ["🔥","Days 11–21","Freedom Phase",T.green,"The physical battle is won. This phase builds your new identity as someone who doesn't smoke. It gets easier every day."]
       ].map(([e,d,ph,c,desc])=>(
         <div key={d} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
           <span style={{fontSize:24,flexShrink:0}}>{e}</span>
           <div>
             <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
               <Tag color={c}>{d}</Tag>
               <span style={{fontSize:13,fontWeight:700,color:T.white}}>{ph}</span>
             </div>
             <p style={{fontSize:14,color:T.muted,margin:0,lineHeight:1.5}}>{desc}</p>
           </div>
         </div>
       ))}
     </>},
    {icon:"⚡",title:"The craving truth that changes everything",
     content:<>
       <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:16,padding:24,textAlign:"center",marginBottom:20}}>
         <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:36,fontWeight:700,color:T.green,marginBottom:8}}>3 minutes</div>
         <div style={{fontSize:16,color:T.white,fontWeight:600}}>Every craving peaks and passes in 3 minutes.</div>
         <div style={{fontSize:14,color:T.muted,marginTop:8}}>This is documented clinical fact, not motivation talk.</div>
       </div>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:15,lineHeight:1.8,marginBottom:16}}>When a craving hits, it feels permanent and urgent. It isn't. It is a wave — it rises, peaks, and falls within 3 minutes every single time.</p>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:15,lineHeight:1.8,marginBottom:16}}>Your craving button opens a <strong style={{color:T.white}}>guided 3-minute breathing timer</strong>. Your only job when a craving hits is to start the timer and breathe. You don't have to be strong. You just have to wait 3 minutes.</p>
       <div style={{background:"rgba(0,176,255,0.08)",border:"1px solid rgba(0,176,255,0.2)",borderRadius:12,padding:16}}>
         <p style={{color:T.blue,fontSize:14,margin:0}}>Every craving you let pass weakens the neural pathway slightly. By Day 21, the same triggers that sent you running to smoke will produce a much quieter signal — or none at all.</p>
       </div>
     </>},
    {icon:"💰",title:`Your year starts today`,
     content:<>
       <div style={{textAlign:"center",marginBottom:24}}>
         <div style={{fontSize:14,color:T.muted,marginBottom:6}}>Based on your spend, you're saving</div>
         <div style={{fontFamily:"Georgia,serif",fontSize:52,fontWeight:800,color:T.green,lineHeight:1}}>{fmtMoney(yearly)}</div>
         <div style={{fontSize:16,color:T.muted,marginTop:4}}>every year from today</div>
       </div>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:15,lineHeight:1.8,marginBottom:16}}>That number will be live in your dashboard, growing in real time from the moment you start. Every day you'll see exactly how much of your money is staying where it belongs: with you.</p>
       <div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:16,marginBottom:16}}>
         <p style={{color:T.white,fontSize:15,margin:0,lineHeight:1.6}}>💡 <strong>One thing to decide now:</strong> what will the first month of savings become? A weekend trip? A piece of gear? Something specific you'll actually do with it. Name it. Make it real.</p>
       </div>
       <p style={{color:T.muted,fontSize:14,lineHeight:1.6}}>When it gets hard, your dashboard will show you exactly what you're protecting. That number is not theoretical. It's real money staying in your pocket.</p>
     </>},
    {icon:"🚀",title:"You're ready. Day 1 starts now.",
     content:<>
       <p style={{color:"rgba(240,244,248,0.8)",fontSize:16,lineHeight:1.8,marginBottom:20}}>Remember what today is: <strong style={{color:T.white}}>an awareness day.</strong> You're a scientist studying your own habit. You still smoke — but every time you do, you come here first. Before you light up.</p>
       {[["Before you smoke","Come to the app first. Rate your craving, name the trigger. Then go smoke."],
         ["After you smoke","Come back and tell us how it felt. Was it as good as you expected?"],
         ["If you feel a craving but don't smoke","Log that too. All data is valuable."],
       ].map(([title,desc])=>(
         <div key={title} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
           <span style={{color:T.green,fontWeight:700,fontSize:18,flexShrink:0}}>→</span>
           <div><strong style={{color:T.white,fontSize:15}}>{title}</strong><p style={{color:T.muted,fontSize:14,margin:"4px 0 0",lineHeight:1.5}}>{desc}</p></div>
         </div>
       ))}
       <div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:16,marginTop:8}}>
         <p style={{color:T.green,fontSize:15,fontWeight:600,margin:0}}>You've already done the hardest thing — you made the decision. Now just follow the program one day at a time.</p>
       </div>
     </>},
  ];
  const currentSlide=steps[step];
  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 20px 100px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:"0.05em"}}>Smarter<span style={{color:T.green}}>Quit</span></div>
          <span style={{fontSize:13,color:T.muted}}>{step+1} / {steps.length}</span>
        </div>
        <PBar value={step+1} max={steps.length} height={4}/>
        <div style={{marginTop:32,marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:16}}>{currentSlide.icon}</div>
          <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:22,lineHeight:1.3,marginBottom:20,color:T.white}}>{currentSlide.title}</h2>
          {currentSlide.content}
        </div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 20px 28px",background:`linear-gradient(to top,${T.bg} 80%,transparent)`}}>
          {step<steps.length-1?(
            <Btn onClick={()=>setStep(prev=>prev+1)} style={{width:"100%",fontSize:17,padding:18}}>Continue →</Btn>
          ):(
            <Btn onClick={onStart} style={{width:"100%",fontSize:17,padding:18,boxShadow:"0 0 40px rgba(0,230,118,0.3)"}}>Start Day 1 →</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BREATHING TIMER COMPONENT ─────────────────────────────────────
function BreathingTimer({onComplete,trigger}){
  const [phase,setPhase]=useState("ready");
  const [count,setCount]=useState(4);
  const [cyclesDone,setCyclesDone]=useState(0);
  const [timerSec,setTimerSec]=useState(180);
  const TOTAL_CYCLES=3;
  const resp=CRAVING_RESP[trigger]||CRAVING_RESP.habit;

  // All mutable state in refs to avoid stale closures
  const phaseRef=useRef("ready");
  const countRef=useRef(4);
  const cyclesRef=useRef(0);
  const activeRef=useRef(false);
  const toRef=useRef(null);
  const timerRef=useRef(null);

  // Cleanup on unmount
  useEffect(()=>()=>{
    activeRef.current=false;
    clearTimeout(toRef.current);
    clearInterval(timerRef.current);
  },[]);

  // Recursive tick — no stale closures because it reads from refs
  const tick=useRef(null);
  tick.current=()=>{
    if(!activeRef.current)return;
    const p=phaseRef.current;
    const c=countRef.current;
    if(c>1){
      countRef.current=c-1;
      setCount(c-1);
      toRef.current=setTimeout(tick.current,1000);
    } else {
      // Phase complete — advance
      if(p==="inhale"){
        phaseRef.current="hold"; countRef.current=4;
        setPhase("hold"); setCount(4);
        toRef.current=setTimeout(tick.current,1000);
      } else if(p==="hold"){
        phaseRef.current="exhale"; countRef.current=6;
        setPhase("exhale"); setCount(6);
        toRef.current=setTimeout(tick.current,1000);
      } else if(p==="exhale"){
        const next=cyclesRef.current+1;
        cyclesRef.current=next;
        setCyclesDone(next);
        if(next>=TOTAL_CYCLES){
          activeRef.current=false;
          clearInterval(timerRef.current);
          phaseRef.current="done";
          setPhase("done");
        } else {
          phaseRef.current="inhale"; countRef.current=4;
          setPhase("inhale"); setCount(4);
          toRef.current=setTimeout(tick.current,1000);
        }
      }
    }
  };

  const startTimer=()=>{
    activeRef.current=true;
    phaseRef.current="inhale"; countRef.current=4; cyclesRef.current=0;
    setPhase("inhale"); setCount(4); setCyclesDone(0); setTimerSec(180);
    timerRef.current=setInterval(()=>{
      setTimerSec(s=>{
        if(s<=1){clearInterval(timerRef.current);return 0;}
        return s-1;
      });
    },1000);
    toRef.current=setTimeout(tick.current,1000);
  };

  const started=phase!=="ready";

  const mins=Math.floor(timerSec/60);
  const secs=timerSec%60;
  const circleScale=(phase==="inhale"||phase==="hold")?1.2:1;
  const circleColor=phase==="done"?T.green:resp.color;
  const cycles=cyclesDone;

  const phaseText={ready:"",inhale:"Breathe in...",hold:"Hold...",exhale:"Breathe out...",done:"Craving passed. ✓"};
  const phaseDesc={ready:"",inhale:"In through the nose",hold:"Hold gently",exhale:"Out through the mouth",done:"You did it."};

  if(!started){
    return(
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontSize:42,marginBottom:12}}>{resp.emoji}</div>
        <Tag color={resp.color}>{resp.label} trigger</Tag>
        <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,margin:"16px 0 8px",color:T.white}}>This craving will pass in 3 minutes.</div>
        <p style={{color:T.muted,fontSize:14,lineHeight:1.6,marginBottom:24}}>Start the breathing timer. Breathe with the circle. By the time it ends, the craving will be smaller. Every time.</p>
        <div style={{background:T.bg3,borderRadius:12,padding:"14px 16px",marginBottom:24,textAlign:"left"}}>
          {resp.steps.map((stepText,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<resp.steps.length-1?12:0,alignItems:"flex-start"}}>
              <span style={{color:resp.color,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}.</span>
              <p style={{fontSize:14,color:"rgba(240,244,248,0.85)",margin:0,lineHeight:1.5}}>{stepText}</p>
            </div>
          ))}
        </div>
        <Btn onClick={startTimer} style={{width:"100%",background:resp.color,color:"#000",fontSize:17,padding:18}}>
          Start 3-Minute Timer
        </Btn>
      </div>
    );
  }

  return(
    <div style={{textAlign:"center",padding:"8px 0"}}>
      {phase!=="done"&&(
        <div style={{fontSize:13,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20}}>
          Breath cycle {Math.min(cycles+1,TOTAL_CYCLES)} of {TOTAL_CYCLES}
        </div>
      )}
      {/* Breathing circle */}
      <div style={{position:"relative",width:160,height:160,margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{
          position:"absolute",width:160,height:160,borderRadius:"50%",
          background:`${circleColor}18`,border:`2px solid ${circleColor}`,
          transform:`scale(${phase==="done"?1.15:circleScale})`,
          transition:"transform 1s ease-in-out, background 0.5s",
          boxShadow:`0 0 ${phase==="done"?"60px":"30px"} ${circleColor}30`,
        }}/>
        <div style={{position:"relative",textAlign:"center"}}>
          {phase!=="done"&&<div style={{fontSize:28,fontWeight:800,color:circleColor,fontFamily:"Georgia,serif"}}>{count}</div>}
          {phase==="done"&&<div style={{fontSize:32}}>✓</div>}
        </div>
      </div>
      <div style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:22,color:T.white,marginBottom:6}}>{phaseText[phase]}</div>
      <div style={{fontSize:14,color:T.muted,marginBottom:24}}>{phaseDesc[phase]}</div>

      {phase!=="done"&&(
        <div style={{background:T.bg3,borderRadius:12,padding:"14px 20px",marginBottom:20}}>
          <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Time remaining</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:32,color:T.white}}>{mins}:{secs.toString().padStart(2,"0")}</div>
          <p style={{fontSize:13,color:T.muted,margin:"8px 0 0"}}>The craving is already past its peak.</p>
        </div>
      )}

      {phase==="done"&&(
        <>
          <div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:20,marginBottom:20}}>
            <div style={{fontSize:24,marginBottom:8}}>💪</div>
            <p style={{color:T.white,fontWeight:600,fontSize:16,marginBottom:6}}>That craving is gone.</p>
            <p style={{color:T.muted,fontSize:14,margin:0}}>{resp.reminder}</p>
          </div>
          <Btn onClick={onComplete} style={{width:"100%",fontSize:17,padding:18}}>I got through it ✓</Btn>
        </>
      )}
    </div>
  );
}

// ─── PRE-SMOKE MODAL (Days 1-3) ────────────────────────────────────
function PreSmokeModal({onSmoke,onCancel}){
  const [step,setStep]=useState(0);
  const [craving,setCraving]=useState(5);
  const [trigger,setTrigger]=useState("");
  const cravingEmoji=craving<=3?"😐":craving<=6?"😰":"😤";
  return(
    <div style={{padding:"4px 0"}}>
      {step===0&&<>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:8}}>{cravingEmoji}</div>
          <h3 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,marginBottom:4}}>Before you light up...</h3>
          <p style={{color:T.muted,fontSize:14}}>Rate your craving right now, before you smoke.</p>
        </div>
        <div style={{background:T.bg3,borderRadius:12,padding:"20px 20px 16px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{color:T.muted,fontSize:14}}>Craving strength</span>
            <span style={{color:T.green,fontWeight:800,fontSize:20}}>{craving}/10</span>
          </div>
          <input type="range" min={1} max={10} value={craving} onChange={e=>setCraving(+e.target.value)}
            style={{width:"100%",accentColor:T.green,cursor:"pointer"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.muted,marginTop:6}}>
            <span>Mild</span><span>Overwhelming</span>
          </div>
        </div>
        <Btn onClick={()=>setStep(1)} style={{width:"100%"}}>Next →</Btn>
        <Btn variant="ghost" onClick={onCancel} style={{width:"100%",marginTop:8}}>Cancel</Btn>
      </>}
      {step===1&&<>
        <h3 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,marginBottom:6,textAlign:"center"}}>What's triggering it?</h3>
        <p style={{color:T.muted,textAlign:"center",fontSize:14,marginBottom:20}}>Be honest. This is your data.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {Object.entries(CRAVING_RESP).map(([k,r])=>(
            <div key={k} onClick={()=>setTrigger(k)} style={{
              padding:"16px 12px",background:trigger===k?`${r.color}15`:T.bg3,
              border:`1px solid ${trigger===k?r.color:T.border}`,
              borderRadius:12,cursor:"pointer",textAlign:"center",transition:"all 0.15s",
            }}>
              <div style={{fontSize:24,marginBottom:6}}>{r.emoji}</div>
              <div style={{fontWeight:600,fontSize:14,color:T.white}}>{r.label}</div>
            </div>
          ))}
        </div>
        <Btn onClick={()=>onSmoke({craving,trigger})} disabled={!trigger} style={{width:"100%"}}>
          Go ahead — you can smoke now
        </Btn>
        <Btn variant="ghost" onClick={()=>setStep(0)} style={{width:"100%",marginTop:8}}>← Back</Btn>
      </>}
    </div>
  );
}

// ─── POST-SMOKE MODAL (Days 1-3) ───────────────────────────────────
function PostSmokeModal({preSmokeData,onDone}){
  const [satisfaction,setSatisfaction]=useState(5);
  const [done,setDone]=useState(false);
  const gap=preSmokeData.craving-satisfaction;

  if(done)return(
    <div style={{textAlign:"center",padding:"8px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>📊</div>
      <h3 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,marginBottom:12}}>Data logged.</h3>
      {gap>2&&<div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:16,marginBottom:16}}>
        <p style={{color:T.white,fontSize:15,lineHeight:1.6,margin:0}}>Your craving was <strong>{preSmokeData.craving}/10</strong> before. The satisfaction was <strong>{satisfaction}/10</strong> after. That gap of {gap} points is the trap. The craving promised more than the cigarette delivered.</p>
      </div>}
      {gap<=2&&<div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        <p style={{color:T.muted,fontSize:14,lineHeight:1.6,margin:0}}>Craving: {preSmokeData.craving}/10 → Satisfaction: {satisfaction}/10. Keep logging. The pattern will become clear.</p>
      </div>}
      <p style={{color:T.muted,fontSize:14,marginBottom:20}}>Keep logging every smoke today. By tonight, your pattern will be visible.</p>
      <Btn onClick={()=>onDone(satisfaction)} style={{width:"100%"}}>Continue</Btn>
    </div>
  );
  return(
    <div style={{padding:"4px 0"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:36,marginBottom:8}}>🚬</div>
        <h3 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,marginBottom:4}}>You just smoked. How was it?</h3>
        <p style={{color:T.muted,fontSize:14}}>Be honest. No judgment. This is your data.</p>
      </div>
      <div style={{background:T.bg3,borderRadius:12,padding:"20px 20px 16px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{color:T.muted,fontSize:14}}>Satisfaction after smoking</span>
          <span style={{color:T.gold,fontWeight:800,fontSize:20}}>{satisfaction}/10</span>
        </div>
        <input type="range" min={1} max={10} value={satisfaction} onChange={e=>setSatisfaction(+e.target.value)}
          style={{width:"100%",accentColor:T.gold,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.muted,marginTop:6}}>
          <span>Disappointing</span><span>Exactly what I needed</span>
        </div>
      </div>
      <div style={{background:"rgba(255,152,0,0.08)",border:"1px solid rgba(255,152,0,0.2)",borderRadius:12,padding:14,marginBottom:20}}>
        <p style={{color:"rgba(255,200,100,0.9)",fontSize:13,lineHeight:1.6,margin:0}}>
          Your craving before: <strong>{preSmokeData.craving}/10</strong>. {gap>0?`That's a gap of ${gap} points.`:"Compare these numbers over the day."} Most smokers find the satisfaction is usually lower than the craving promised.
        </p>
      </div>
      <Btn onClick={()=>setDone(true)} style={{width:"100%"}}>Save & see insight →</Btn>
    </div>
  );
}

// ─── CRAVING MODAL WRAPPER ─────────────────────────────────────────
function CravingModal({onClose,onLog,currentDay,isAwarenessDay}){
  const [mode,setMode]=useState(isAwarenessDay?"pre-smoke":"craving");
  const [preSmokeData,setPreSmokeData]=useState(null);
  const [trigger,setTrigger]=useState("");
  const [triggerStep,setTriggerStep]=useState(0);

  const handlePreSmoke=(data)=>{
    setPreSmokeData(data);
    setMode("post-smoke");
  };
  const handleLog=(data)=>{
    onLog({...data,day:currentDay,timestamp:new Date().toISOString()});
  };

  // For non-awareness days: pick trigger then show breathing timer
  if(mode==="craving"){
    if(triggerStep===0)return(
      <BottomSheet onClose={onClose}>
        <h3 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:20,marginBottom:6,textAlign:"center"}}>What triggered this craving?</h3>
        <p style={{color:T.muted,textAlign:"center",fontSize:14,marginBottom:20}}>One tap. Then we breathe through it.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {Object.entries(CRAVING_RESP).map(([k,r])=>(
            <div key={k} onClick={()=>{setTrigger(k);setTriggerStep(1);handleLog({trigger:k,type:"craving"});}} style={{
              padding:"18px 12px",background:T.bg3,
              border:`1px solid ${T.border}`,
              borderRadius:12,cursor:"pointer",textAlign:"center",transition:"all 0.15s",
            }}>
              <div style={{fontSize:28,marginBottom:6}}>{r.emoji}</div>
              <div style={{fontWeight:600,fontSize:14}}>{r.label}</div>
            </div>
          ))}
        </div>
        <Btn variant="ghost" onClick={onClose} style={{width:"100%"}}>← Dismiss</Btn>
      </BottomSheet>
    );
    return(
      <BottomSheet onClose={onClose}>
        <BreathingTimer trigger={trigger} onComplete={onClose}/>
      </BottomSheet>
    );
  }

  if(mode==="pre-smoke")return(
    <BottomSheet onClose={onClose}>
      <PreSmokeModal onSmoke={handlePreSmoke} onCancel={onClose}/>
    </BottomSheet>
  );

  if(mode==="post-smoke")return(
    <BottomSheet onClose={onClose}>
      <PostSmokeModal
        preSmokeData={preSmokeData}
        onDone={(satisfaction)=>{
          onLog({
            ...preSmokeData,
            satisfaction,
            type:"smoke",
            day:currentDay,
            timestamp:new Date().toISOString()
          });
          onClose();
        }}
      />
    </BottomSheet>
  );
}

function BottomSheet({children,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.bg2,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:28,border:`1px solid ${T.border}`,borderBottom:"none",maxHeight:"85vh",overflowY:"auto"}}>
        {children}
      </div>
    </div>
  );
}

// ─── DAILY CONTENT READER ──────────────────────────────────────────
function DayReader({dayData,onClose,onTaskDone,taskDone}){
  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 0 100px"}}>
        {/* Header */}
        <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onClose} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:14}}>← Back</button>
          <Tag color={dayData.phaseColor}>{dayData.phase} — Day {dayData.day}</Tag>
        </div>

        {/* Hero */}
        <div style={{padding:"28px 20px 0",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>{dayData.emoji}</div>
          <h1 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:26,lineHeight:1.3,marginBottom:8}}>{dayData.title}</h1>
          <p style={{color:T.muted,fontSize:16,lineHeight:1.5}}>{dayData.subtitle}</p>
        </div>

        {/* Intro */}
        <div style={{margin:"24px 20px 0",background:T.bg3,borderRadius:16,padding:20,borderLeft:`3px solid ${dayData.phaseColor}`}}>
          <p style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:16,lineHeight:1.75,color:T.white,margin:0}}>{dayData.intro}</p>
        </div>

        {/* Content blocks */}
        <div style={{padding:"20px 20px 0"}}>
          {dayData.content.map((block,i)=>{
            if(block.type==="hook")return(
              <p key={i} style={{fontSize:16,lineHeight:1.8,color:"rgba(240,244,248,0.9)",marginBottom:20,borderLeft:`2px solid ${dayData.phaseColor}`,paddingLeft:16}}>{block.text}</p>
            );
            if(block.type==="science")return(
              <div key={i} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:14,padding:20,marginBottom:20}}>
                <div style={{fontSize:11,color:T.blue,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>🔬 {block.label}</div>
                <p style={{color:"rgba(240,244,248,0.85)",fontSize:15,lineHeight:1.75,margin:0}}>{block.text}</p>
              </div>
            );
            if(block.type==="insight")return(
              <div key={i} style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:14,padding:20,marginBottom:20}}>
                <div style={{fontSize:11,color:T.green,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>💡 Key Insight</div>
                <p style={{color:T.white,fontSize:15,lineHeight:1.75,margin:0}}>{block.text}</p>
              </div>
            );
            return <p key={i} style={{fontSize:15,lineHeight:1.8,color:"rgba(240,244,248,0.8)",marginBottom:20}}>{block.text}</p>;
          })}
        </div>

        {/* Task */}
        <div style={{padding:"0 20px"}}>
          <div style={{background:taskDone?T.greenDim:T.bg3,border:`1px solid ${taskDone?T.green:T.border}`,borderRadius:16,padding:22}}>
            <div style={{fontSize:11,color:taskDone?T.green:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
              {taskDone?"✓ Completed":"📋 Today's Task"}
            </div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8,color:T.white}}>{dayData.task.emoji} {dayData.task.title}</div>
            <p style={{color:T.muted,fontSize:14,lineHeight:1.65,margin:"0 0 18px"}}>{dayData.task.desc}</p>
            {!taskDone&&<Btn onClick={onTaskDone} style={{width:"100%",fontSize:16,padding:"15px"}}>Mark as done ✓</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────
function Dashboard({intake,token,cravings=[],progress={completedTasks:[],welcomed:false},onLogCraving,onTaskDone}){
  const [showCraving,setShowCraving]=useState(false);
  const [showReader,setShowReader]=useState(false);
  const [copied,setCopied]=useState(false);
  const [now,setNow]=useState(Date.now());

  // Tick every second so savings counter updates live
  useEffect(()=>{
    const interval=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(interval);
  },[]);

  const startDate=intake.startDate||intake.start_date;
  const rawDay=daysSince(startDate)+1;
  const currentDay=Math.min(rawDay,21);
  const dayData=DAYS[currentDay-1];
  const isAwarenessDay=dayData.phase==="Awareness";

  // Calculate savings based on exact elapsed seconds — updates every second
  const weeklySpend=parseFloat(intake.weeklySpend||intake.weekly_spend)||0;
  const perSecond=weeklySpend/(7*24*60*60);
  const elapsedSeconds=startDate?(now-new Date(startDate).getTime())/1000:0;
  const totalSaved=Math.max(0,perSecond*elapsedSeconds);
  const completedTasks=progress.completedTasks||[];
  const todayLogs=cravings.filter(c=>isToday(c.timestamp||c.created_at));
  const todayCravingsBeat=todayLogs.filter(c=>c.type==="craving").length;
  const todaySmokes=todayLogs.filter(c=>c.type==="smoke").length;
  const taskDone=completedTasks.includes(currentDay);
  const phaseColor=dayData.phaseColor;

  const personalLink=token?`https://smarterquit.com/app?s=${token}`:"";
  const copyLink=()=>{
    if(!personalLink)return;
    navigator.clipboard.writeText(personalLink);
    setCopied(true);
    setTimeout(()=>setCopied(false),2500);
  };

  const markTaskDone=()=>{
    onTaskDone(currentDay);
    setShowReader(false);
  };

  if(showReader)return(
    <DayReader dayData={dayData} onClose={()=>setShowReader(false)} onTaskDone={markTaskDone} taskDone={taskDone}/>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 0 130px"}}>

        {/* Top header */}
        <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:"0.05em"}}>Smarter<span style={{color:T.green}}>Quit</span></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Day</div>
            <div style={{fontSize:24,fontWeight:800,color:phaseColor,lineHeight:1}}>{currentDay}<span style={{color:T.muted,fontSize:14}}>/21</span></div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{padding:"14px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <Tag color={phaseColor}>{dayData.phase} Phase</Tag>
            <span style={{color:T.muted,fontSize:12}}>{currentDay} of 21 days</span>
          </div>
          <PBar value={currentDay} max={21} color={phaseColor} height={6}/>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:T.border,margin:"16px 0 0",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
          {(isAwarenessDay?[
            {label:"Saved",value:fmtMoney(totalSaved),emoji:"💰",color:T.green},
            {label:"Smokes today",value:`${todaySmokes} logged`,emoji:"📊",color:T.gold},
            {label:"Day",value:`${currentDay} of 21`,emoji:"🗓️",color:phaseColor},
          ]:[
            {label:"Saved",value:fmtMoney(totalSaved),emoji:"💰",color:T.green},
            {label:"Days free",value:`${currentDay} days`,emoji:"🚭",color:T.blue},
            {label:"Beaten today",value:`${todayCravingsBeat}`,emoji:"💪",color:T.gold},
          ]).map((stat,i)=>(
            <div key={i} style={{background:T.bg2,padding:"14px 8px",textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:2}}>{stat.emoji}</div>
              <div style={{fontSize:14,fontWeight:800,color:stat.color,lineHeight:1.2}}>{stat.value}</div>
              <div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Milestone banner */}
        {dayData.milestone&&(
          <div style={{margin:"16px 20px 0",background:`linear-gradient(135deg,${T.greenDim},rgba(0,230,118,0.04))`,border:`1px solid ${T.greenBorder}`,borderRadius:16,padding:20,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>{dayData.milestone.emoji}</div>
            <div style={{fontWeight:800,fontSize:18,color:T.green}}>{dayData.milestone.text}</div>
            <div style={{color:T.muted,fontSize:14,marginTop:4}}>{dayData.milestone.sub}</div>
          </div>
        )}

        {/* Awareness phase context banner */}
        {isAwarenessDay&&(
          <div style={{margin:"16px 20px 0",background:"rgba(255,214,0,0.06)",border:"1px solid rgba(255,214,0,0.2)",borderRadius:14,padding:"16px 18px"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>💛</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.gold,marginBottom:4}}>Awareness Day — you can still smoke today</div>
                <p style={{color:"rgba(255,214,0,0.7)",fontSize:13,lineHeight:1.5,margin:0}}>Every time you're about to smoke, tap the button below first. Log before and after. This data is your weapon for Day 4.</p>
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL LINK — access on any device */}
        <div style={{padding:"16px 20px 0"}}>
          <div style={{background:"linear-gradient(135deg,rgba(0,176,255,0.08),rgba(0,176,255,0.03))",border:"1px solid rgba(0,176,255,0.25)",borderRadius:14,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <span style={{fontSize:22,flexShrink:0}}>📲</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:T.blue,marginBottom:4}}>Your personal link — save this!</div>
                <p style={{color:"rgba(0,176,255,0.7)",fontSize:13,lineHeight:1.5,margin:"0 0 12px"}}>Use this link to open your program on any phone, tablet, or computer. If you lose access, you can always recover with your email.</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{flex:1,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    smarterquit.com/app?s={token?token.slice(0,8):"..."}...
                  </div>
                  <button onClick={copyLink} style={{background:copied?"rgba(0,230,118,0.15)":"rgba(0,176,255,0.15)",border:`1px solid ${copied?T.green:"rgba(0,176,255,0.4)"}`,color:copied?T.green:T.blue,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"all 0.2s",whiteSpace:"nowrap"}}>
                    {copied?"✓ Copied!":"Copy link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TODAY'S DAY CARD */}
        <div style={{padding:"16px 20px 0"}}>
          <div onClick={()=>setShowReader(true)} style={{
            background:T.bg3,border:`1px solid ${T.border}`,borderRadius:16,padding:20,
            cursor:"pointer",transition:"border-color 0.2s",
            borderLeft:`3px solid ${phaseColor}`,
          }}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:36,flexShrink:0}}>{dayData.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,color:phaseColor,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>Day {currentDay} • Tap to read</div>
                <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:18,lineHeight:1.3,marginBottom:6}}>{dayData.title}</h2>
                <p style={{color:T.muted,fontSize:13,margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{dayData.subtitle}</p>
              </div>
              <div style={{background:phaseColor,color:"#000",borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,flexShrink:0}}>Read →</div>
            </div>
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:T.muted}}>📋 {dayData.task.title}</span>
              {taskDone?(
                <span style={{fontSize:13,color:T.green,fontWeight:600}}>✓ Done</span>
              ):(
                <span style={{fontSize:12,color:T.muted,background:T.bg2,padding:"4px 10px",borderRadius:100}}>Not done</span>
              )}
            </div>
          </div>
        </div>

        {/* Today's log (awareness) */}
        {isAwarenessDay&&todaySmokes>0&&(
          <div style={{padding:"16px 20px 0"}}>
            <p style={{fontSize:12,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Today's smokes logged</p>
            {todayLogs.filter(c=>c.type==="smoke").map((c,i)=>{
              const r=CRAVING_RESP[c.trigger];
              const gap=(c.craving||5)-(c.satisfaction||5);
              return(
                <div key={i} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>{r?.emoji||"🚬"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{r?.label||"Unknown"} trigger</div>
                    <div style={{fontSize:12,color:T.muted}}>Craving: {c.craving}/10{c.satisfaction?` → Satisfaction: ${c.satisfaction}/10`:""}</div>
                  </div>
                  {gap>1&&<div style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:8,padding:"4px 8px",fontSize:11,color:T.green,textAlign:"center"}}>
                    Gap: {gap}pt
                  </div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Today's cravings beaten (non-awareness) */}
        {!isAwarenessDay&&todayCravingsBeat>0&&(
          <div style={{padding:"16px 20px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:12,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",margin:0}}>Cravings beaten today</p>
              <Tag color={T.gold}>{todayCravingsBeat} total</Tag>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {todayLogs.filter(c=>c.type==="craving").map((c,i)=>(
                <div key={i} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  {CRAVING_RESP[c.trigger]?.emoji||"💪"}
                  <span style={{color:T.muted,fontSize:12}}>{CRAVING_RESP[c.trigger]?.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What's coming */}
        {currentDay<21&&(
          <div style={{padding:"16px 20px 0"}}>
            <p style={{fontSize:12,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Coming up</p>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
              {DAYS.slice(currentDay,Math.min(currentDay+4,21)).map(d=>(
                <div key={d.day} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 14px",flexShrink:0,minWidth:110,opacity:0.75}}>
                  <div style={{fontSize:22,marginBottom:6}}>{d.emoji}</div>
                  <div style={{fontSize:11,color:d.phaseColor,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>Day {d.day}</div>
                  <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:T.white}}>{d.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day 21 complete */}
        {currentDay>=21&&(
          <div style={{padding:"16px 20px 0"}}>
            <div style={{background:`linear-gradient(135deg,${T.greenDim},rgba(0,230,118,0.04))`,border:`1px solid ${T.greenBorder}`,borderRadius:16,padding:24,textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12}}>🎉</div>
              <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>21 days. You did it.</h2>
              <p style={{color:T.muted,fontSize:15,marginBottom:20}}>You are no longer a smoker. You are someone who doesn't smoke.</p>
              <div style={{background:T.bg2,borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{color:T.muted,fontSize:13,marginBottom:4}}>Total saved</div>
                <div style={{color:T.green,fontSize:42,fontWeight:800}}>{fmtMoney(totalSaved)}</div>
              </div>
              <p style={{color:T.muted,fontSize:13}}>Your savings counter keeps growing. Your health keeps improving. Keep the door closed.</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 20px 28px",background:`linear-gradient(to top,${T.bg} 80%,transparent)`}}>
        <button onClick={()=>setShowCraving(true)} style={{
          width:"100%",background:isAwarenessDay?T.gold:T.green,color:"#000",
          border:"none",borderRadius:14,padding:"18px",fontSize:17,fontWeight:800,
          cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",
          justifyContent:"center",gap:10,
          boxShadow:`0 0 40px ${isAwarenessDay?"rgba(255,214,0,0.3)":"rgba(0,230,118,0.3)"}`,
        }}>
          {isAwarenessDay?"🚬 I'm about to smoke — log it":"😤 I'm Craving Right Now"}
        </button>
        {!isAwarenessDay&&<p style={{textAlign:"center",fontSize:12,color:T.muted,marginTop:8}}>Start the 3-minute breathing timer</p>}
      </div>

      {showCraving&&(
        <CravingModal
          onClose={()=>setShowCraving(false)}
          onLog={onLogCraving}
          currentDay={currentDay}
          isAwarenessDay={isAwarenessDay}
        />
      )}
    </div>
  );
}

// ─── INTAKE FLOW ────────────────────────────────────────────────────
function IntakeScreen({onComplete}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState({quitType:"",amount:10,years:"",weeklySpend:"",reason:"",email:""});
  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  const yearly=Math.round((parseFloat(data.weeklySpend)||0)*52);
  const canNextFns=[
    ()=>!!data.quitType,
    ()=>data.amount>0,
    ()=>!!data.years,
    ()=>data.weeklySpend>0,
    ()=>!!data.reason,
    ()=>!!data.email&&data.email.includes("@"),
  ];
  const canNext=canNextFns[step]||(() =>false);

  const steps=[
    <div key={0}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>🚭</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>What are you quitting?</h2>
      <p style={{color:T.muted,marginBottom:24,fontSize:15}}>The program works for both. We'll tailor it to your answer.</p>
      {[["🚬","Cigarettes","cigarettes"],["💨","Vaping / E-cigs","vaping"],["🔥","Both","both"]].map(([e,l,v])=>(
        <div key={v} onClick={()=>set("quitType",v)} style={{display:"flex",alignItems:"center",gap:16,padding:"18px 20px",background:data.quitType===v?T.greenDim:T.bg2,border:`1px solid ${data.quitType===v?T.green:T.border}`,borderRadius:12,marginBottom:10,cursor:"pointer",transition:"all 0.15s"}}>
          <span style={{fontSize:28}}>{e}</span>
          <span style={{fontWeight:600,fontSize:17}}>{l}</span>
          {data.quitType===v&&<span style={{marginLeft:"auto",color:T.green,fontSize:20}}>✓</span>}
        </div>
      ))}
    </div>,
    <div key={1}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>📊</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>How many per day?</h2>
      <p style={{color:T.muted,marginBottom:28,fontSize:15}}>{data.quitType==="vaping"?"Pods or cartridges used daily.":"Average cigarettes on a normal day."}</p>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:64,fontWeight:800,color:T.green,fontFamily:"Georgia,serif",lineHeight:1}}>{data.amount}</div>
        <div style={{color:T.muted,fontSize:14,marginTop:4}}>{data.quitType==="vaping"?"pods/day":"cigarettes/day"}</div>
      </div>
      <input type="range" min={1} max={60} value={data.amount} onChange={e=>set("amount",+e.target.value)} style={{width:"100%",accentColor:T.green,cursor:"pointer",marginBottom:8}}/>
      <div style={{display:"flex",justifyContent:"space-between",color:T.muted,fontSize:13}}><span>1</span><span>60</span></div>
    </div>,
    <div key={2}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>⏳</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>How long have you been smoking or vaping?</h2>
      <p style={{color:T.muted,marginBottom:24,fontSize:15}}>No judgment. Just helps calibrate your program.</p>
      {[["Less than 1 year","lt1"],["1–5 years","1-5"],["5–10 years","5-10"],["10+ years","10+"]].map(([l,v])=>(
        <div key={v} onClick={()=>set("years",v)} style={{padding:"16px 20px",background:data.years===v?T.greenDim:T.bg2,border:`1px solid ${data.years===v?T.green:T.border}`,borderRadius:12,marginBottom:10,cursor:"pointer",transition:"all 0.15s",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:500,fontSize:16}}>{l}</span>
          {data.years===v&&<span style={{color:T.green,fontSize:18}}>✓</span>}
        </div>
      ))}
    </div>,
    <div key={3}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>💰</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>What do you spend per week?</h2>
      <p style={{color:T.muted,marginBottom:24,fontSize:15}}>Cigarettes, pods, everything. We'll show you your real annual cost.</p>
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",fontSize:22,color:T.muted}}>$</span>
        <input type="number" value={data.weeklySpend} onChange={e=>set("weeklySpend",e.target.value)} placeholder="0" style={{width:"100%",background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,color:T.white,padding:"18px 20px 18px 42px",fontSize:24,fontFamily:"inherit",outline:"none",boxSizing:"border-box",fontWeight:700}}/>
      </div>
      {yearly>0&&<div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:12,padding:"16px 20px",textAlign:"center"}}>
        <div style={{color:T.muted,fontSize:13,marginBottom:4}}>You'll save per year by quitting</div>
        <div style={{color:T.green,fontSize:40,fontWeight:800,lineHeight:1}}>{fmtMoney(yearly)}</div>
        <div style={{color:T.muted,fontSize:13,marginTop:6}}>That's yours from Day 1.</div>
      </div>}
    </div>,
    <div key={4}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>❤️</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>What's your biggest reason?</h2>
      <p style={{color:T.muted,marginBottom:24,fontSize:15}}>This becomes your anchor on hard days. Choose the one that hits hardest.</p>
      {[["❤️","My health — I want more years","health"],["💰","The money — I want it back","money"],["👨‍👩‍👧","My family — they need me well","family"],["🏃","Sports & fitness — I want to breathe","sports"],["🌱","I'm just done with it","done"]].map(([e,l,v])=>(
        <div key={v} onClick={()=>set("reason",v)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:data.reason===v?T.greenDim:T.bg2,border:`1px solid ${data.reason===v?T.green:T.border}`,borderRadius:12,marginBottom:10,cursor:"pointer",transition:"all 0.15s"}}>
          <span style={{fontSize:24}}>{e}</span>
          <span style={{fontWeight:500,fontSize:15,flex:1}}>{l}</span>
          {data.reason===v&&<span style={{color:T.green,fontSize:18}}>✓</span>}
        </div>
      ))}
    </div>,
    <div key={5}>
      <div style={{fontSize:48,marginBottom:16,textAlign:"center"}}>📧</div>
      <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:24,marginBottom:8}}>Your recovery email</h2>
      <p style={{color:T.muted,marginBottom:12,fontSize:15,lineHeight:1.6}}>If you ever lose access — switch phones, clear your browser — enter this email on the login screen and we'll recover your program instantly.</p>
      <div style={{background:"rgba(0,176,255,0.06)",border:"1px solid rgba(0,176,255,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:20}}>
        <p style={{color:T.blue,fontSize:13,margin:0,lineHeight:1.5}}>💡 We only use this for account recovery. No marketing, no newsletters.</p>
      </div>
      <input
        type="email" value={data.email} onChange={e=>set("email",e.target.value)}
        placeholder="you@example.com"
        style={{width:"100%",background:T.bg2,border:`1px solid ${data.email.includes("@")?T.green:T.border}`,borderRadius:12,color:T.white,padding:"18px 20px",fontSize:18,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
      />
      {data.email.includes("@")&&<p style={{color:T.green,fontSize:13,marginTop:8}}>✓ Looks good</p>}
    </div>,
  ];

  const handleNext=()=>{
    if(step<5){setStep(prev=>prev+1);return;}
    const startDate=new Date().toISOString();
    const intakeData={...data,startDate,yearly};
    onComplete(intakeData);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 20px 120px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:"0.05em"}}>Smarter<span style={{color:T.green}}>Quit</span></div>
          <span style={{fontSize:13,color:T.muted}}>Step {step+1} of 6</span>
        </div>
        <PBar value={step+1} max={6} height={4}/>
        <div style={{marginTop:28,minHeight:380}}>{steps[step]}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 20px 28px",background:`linear-gradient(to top,${T.bg} 80%,transparent)`}}>
          <div style={{display:"flex",gap:10}}>
            {step>0&&<Btn variant="secondary" onClick={()=>setStep(prev=>prev-1)} style={{flex:1}}>←</Btn>}
            <Btn onClick={handleNext} disabled={!canNext()} style={{flex:2,fontSize:17,padding:17}}>
              {step===5?"Build My Plan →":"Continue →"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NO ACCESS SCREEN ────────────────────────────────────────────────
function NoAccessScreen(){
  const [email,setEmail]=useState("");
  const [status,setStatus]=useState("idle"); // idle | loading | found | notfound
  const personalLink = status==="found" ? `https://smarterquit.com/app?s=${lsGet("recovery_token","?")}` : "";

  const handleRecover=async()=>{
    if(!email.trim())return;
    setStatus("loading");
    const token=await findTokenByEmail(email);
    if(token){
      lsSet("recovery_token",token);
      setStatus("found");
    } else {
      setStatus("notfound");
    }
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:"0.05em",marginBottom:32}}>Smarter<span style={{color:T.green}}>Quit</span></div>

        {status==="found"?(
          <div style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:16,padding:28}}>
            <div style={{fontSize:36,marginBottom:12}}>✅</div>
            <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:22,marginBottom:12}}>Found your account!</h2>
            <p style={{color:T.muted,fontSize:15,marginBottom:20,lineHeight:1.6}}>Tap the button below to open your program. Bookmark this link to always have access.</p>
            <a href={personalLink} style={{display:"block",background:T.green,color:"#000",fontWeight:800,fontSize:16,padding:"16px 24px",borderRadius:10,textDecoration:"none",marginBottom:12}}>
              Open My Program →
            </a>
            <p style={{fontSize:12,color:T.muted,wordBreak:"break-all"}}>{personalLink}</p>
          </div>
        ):(
          <>
            <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:16,padding:28,marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:12}}>🔒</div>
              <h2 style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:22,marginBottom:8}}>Program access required</h2>
              <p style={{color:T.muted,fontSize:15,marginBottom:20,lineHeight:1.6}}>This program requires a purchase. Already bought it? Enter your email to recover your personal link.</p>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="Your email address"
                style={{width:"100%",background:T.bg2,border:`1px solid ${T.border}`,borderRadius:10,color:T.white,padding:"14px 16px",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:12}}
              />
              <button
                onClick={handleRecover} disabled={status==="loading"||!email.trim()}
                style={{width:"100%",background:T.green,color:"#000",border:"none",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:(!email.trim()||status==="loading")?0.5:1}}
              >
                {status==="loading"?"Searching...":"Recover My Access →"}
              </button>
              {status==="notfound"&&<p style={{color:T.red,fontSize:13,marginTop:10}}>No account found with this email. Try a different address or purchase below.</p>}
            </div>
            <a href="/" style={{display:"block",background:T.bg3,color:T.muted,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px",fontSize:15,fontWeight:600,textDecoration:"none"}}>
              ← Get the program for $7.99
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("loading");
  const [intake,setIntake]=useState(null);
  const [token,setToken]=useState(null);
  const [cravings,setCravings]=useState([]);
  const [progress,setProgress]=useState({completedTasks:[],welcomed:false});

  useEffect(()=>{
    const init=async()=>{
      // Check payment access first
      const access=checkAccess();
      if(!access.paid){
        setScreen("noaccess");
        return;
      }

      setToken(access.token);

      try{
        const [intakeData,progressData,cravingData]=await Promise.all([
          loadIntake(access.token),
          loadProgress(access.token),
          loadCravings(access.token),
        ]);
        if(cravingData?.length>0) setCravings(cravingData);
        if(progressData) setProgress({
          completedTasks:progressData.completed_tasks||[],
          welcomed:progressData.welcomed||false
        });

        // Check startDate in all possible field names
        const startDate=intakeData?.startDate||intakeData?.start_date||intakeData?.startdate;

        if(intakeData && startDate){
          const normalized={...intakeData, startDate};
          setIntake(normalized);
          // If they've been here before (have progress or cravings) → always dashboard
          // Only show welcome onboarding if truly brand new
          const hasActivity=(cravingData?.length>0)||(progressData?.completed_tasks?.length>0);
          const shouldWelcome=!progressData?.welcomed && !hasActivity;
          setScreen(shouldWelcome?"welcome":"dashboard");
        }else{
          setScreen("intake");
        }
      }catch(err){
        console.warn("Init error:",err);
        // Don't send to intake on error — show a retry screen instead
        setScreen("intake");
      }
    };
    init();
  },[]);

  const handleIntakeComplete=(data)=>{
    saveIntake(token,data);
    setIntake(data);
    // Send welcome email with personal link
    if(data.email) sendWelcomeEmail(data.email, token);
    setScreen("welcome");
  };

  const handleWelcomeDone=()=>{
    const newProgress={...progress,welcomed:true};
    setProgress(newProgress);
    saveProgress(token,{completed_tasks:[],welcomed:true});
    setScreen("dashboard");
  };

  const handleLogCraving=(craving)=>{
    const updated=[...cravings,craving];
    setCravings(updated);
    saveCraving(token,craving);
  };

  const handleTaskDone=(day)=>{
    if(progress.completedTasks.includes(day))return;
    const newTasks=[...progress.completedTasks,day];
    const newProgress={...progress,completedTasks:newTasks};
    setProgress(newProgress);
    saveProgress(token,{completed_tasks:newTasks,welcomed:true});
  };

  if(screen==="loading")return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,letterSpacing:"0.05em",color:T.white}}>Smarter<span style={{color:T.green}}>Quit</span></div>
      <div style={{color:T.muted,fontSize:14}}>Loading your program...</div>
      <div style={{width:40,height:4,background:T.bg3,borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",width:"60%",background:T.green,borderRadius:99}}/>
      </div>
    </div>
  );

  if(screen==="noaccess") return <NoAccessScreen/>;
  if(screen==="intake")   return <IntakeScreen onComplete={handleIntakeComplete}/>;
  if(screen==="welcome")  return <WelcomeScreen intake={intake} onStart={handleWelcomeDone}/>;
  return <Dashboard intake={intake} token={token} cravings={cravings} progress={progress} onLogCraving={handleLogCraving} onTaskDone={handleTaskDone}/>;
}
