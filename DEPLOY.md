# SmarterQuit — Deployment Guide

## What's in this project

```
smarterquit/
├── src/
│   ├── main.jsx          ← Router, connects all pages
│   └── pages/
│       ├── Landing.jsx   ← Sales page (/)
│       ├── App.jsx       ← The 21-day program (/app)
│       ├── Privacy.jsx   ← Privacy Policy (/privacy)
│       ├── Terms.jsx     ← Terms of Service (/terms)
│       └── Refund.jsx    ← Refund Policy (/refund)
├── public/
│   └── manifest.json     ← PWA (add to home screen)
├── index.html            ← Entry point
├── vite.config.js        ← Build config
├── vercel.json           ← Routing for Vercel
└── package.json          ← Dependencies
```

---

## STEP 1 — Install Node.js (5 minutes)
Go to https://nodejs.org and download the LTS version. Install it.

---

## STEP 2 — Create GitHub account (5 minutes)
Go to https://github.com and create a free account if you don't have one.

---

## STEP 3 — Upload project to GitHub (10 minutes)
1. Go to github.com → click "New repository"
2. Name it: smarterquit
3. Set to Public
4. Click "Create repository"
5. Download GitHub Desktop from https://desktop.github.com
6. Open GitHub Desktop → File → Add Local Repository → select this folder
7. Commit all files → Push to GitHub

---

## STEP 4 — Deploy to Vercel (5 minutes)
1. Go to https://vercel.com → Sign up with your GitHub account
2. Click "New Project"
3. Import your "smarterquit" repository
4. Vercel detects it's a Vite project automatically
5. Click "Deploy"
6. Your site is live at: yourname.vercel.app

---

## STEP 5 — Connect your domain (10 minutes)
1. In Vercel → your project → Settings → Domains
2. Add: smarterquit.com
3. Vercel shows you two DNS records to add
4. Go to Namecheap → your domain → Advanced DNS
5. Add the two records Vercel gives you
6. Wait 10–30 minutes for DNS to propagate
7. Done — smarterquit.com is live

---

## STEP 6 — Create Stripe Payment Link (10 minutes)
1. Go to https://stripe.com → create a free account
2. Go to: Payment Links → Create new link
3. Product name: "SmarterQuit 21-Day Program"
4. Price: $7.99 (one-time)
5. Under "After payment" → set redirect URL to: https://smarterquit.com/app
6. Copy the payment link URL (looks like: https://buy.stripe.com/xxxx)
7. Open src/pages/Landing.jsx
8. Find line: const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK"
9. Replace with your actual Stripe link
10. Save → commit → push to GitHub → Vercel auto-deploys

---

## STEP 7 — Set up your email (5 minutes)
1. Create: hello@smarterquit.com
   → Easiest: Namecheap email ($1/month) or Google Workspace ($6/month)
   → Or forward: use Namecheap free email forwarding to your personal email
2. This is where refund requests come in

---

## STEP 8 — Test everything
1. Go to smarterquit.com → check landing page looks right on phone
2. Click "Start Now" → should go to Stripe → pay $1 test (Stripe has test mode)
3. After payment → should redirect to smarterquit.com/app
4. Complete the intake → check dashboard works
5. Test craving button
6. Test Privacy, Terms, Refund pages via footer links

---

## HOW THE MONEY FLOWS

User buys ($7.99) → Stripe takes ~$0.53 → You get ~$7.46
Stripe pays out to your bank account every 2 days (after first 7-day holding period)
Set up bank account in: Stripe → Settings → Bank accounts

---

## GETTING TRAFFIC

Start free:
- Reddit: r/stopsmoking, r/quittingsmoking — post genuinely helpful content, mention SmarterQuit in your bio
- TikTok: 30-second videos "Day 6 — the identity shift that actually worked for me"
- Facebook groups: smoking cessation groups

Paid ($5/day test):
- Facebook/Instagram ads targeting: smokers 25–55, USA, interested in health
- Headline: "Quit smoking for less than one pack. 21-day program. Money back if it doesn't work."

---

## NEED HELP?
Email: hello@smarterquit.com (yourself)
Or ask Claude for help with any specific step.
