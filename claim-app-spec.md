# claim.app — MVP Spec

> SMS reminder service for premium credit card credits. v1 covers Chase Sapphire Reserve and Chase United Club Infinite. Sends a text 30 days and 7 days before each credit deadline so users actually use the benefits they're paying for.

---

## 1. Goal & scope

**Problem:** Premium card holders pay $500-700/year in annual fees and silently forfeit hundreds of dollars in credits because the deadlines and activation requirements are scattered, confusing, and unmonitored.

**Solution:** A user signs up with their phone number, picks their card(s), and gets two SMS reminders per credit — one a month out, one a week out. They can text back `DONE` to mark a credit claimed (skip future reminders) or `STOP` to unsubscribe.

**v1 deliverables:**
- Signup flow (web + SMS verification)
- Per-user card selection (CSR + United Club Infinite for v1)
- Cron-driven reminder engine
- Inbound SMS handler for `DONE` / `STOP` / `HELP`
- Admin route to add/edit credits without redeploying
- Seed data for both cards' 2026 credits

**Out of scope for v1 (build later):**
- Stripe billing (start free; gate at 3 cards or 90 days)
- Email channel
- iOS app
- AppSumo lifetime deal
- Referral program
- Card auto-detection from email forwarding

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | One repo, API routes for webhooks |
| Hosting | Vercel | Cron + serverless out of the box |
| Database | Vercel Postgres (or Neon) | Free tier handles MVP scale |
| ORM | Drizzle | Lightweight, type-safe, no migrations runtime |
| Auth | Phone OTP via Twilio Verify | SMS-first product, no passwords |
| SMS | Twilio Programmable Messaging | A2P 10DLC required (see §9) |
| Cron | Vercel Cron | Daily 9am UTC trigger |
| Validation | Zod | Schema parsing for API + env |
| Styling | Tailwind + shadcn/ui | Standard, fast |

---

## 3. User stories

1. As a new user, I land on the homepage, enter my phone number, verify via OTP, pick CSR and/or United Club, and get a confirmation text within 60 seconds.
2. As an active user, I receive an SMS 30 days before a credit expires and another 7 days before — each containing the credit name, dollar amount, deadline, and a one-tap reply option.
3. As a user who already used a credit, I reply `DONE` and the system skips remaining reminders for that specific credit cycle.
4. As a user opting out, I reply `STOP` and the system halts all messages.
5. As an admin, I can hit `/admin/credits` to add a new credit or correct a deadline without touching code.

---

## 4. Data model

```ts
// drizzle schema sketch — adjust types/defaults as needed

users {
  id: uuid pk
  phone: text unique          // E.164 format
  timezone: text              // IANA, e.g. "America/Chicago"
  anniversary_csr: date | null  // for the $300 travel credit
  anniversary_united: date | null
  sms_consent_at: timestamp
  status: enum('active', 'stopped', 'pending_verify')
  created_at: timestamp
}

cards {
  id: text pk                 // 'csr', 'united_club_infinite'
  name: text                  // 'Chase Sapphire Reserve'
  issuer: text                // 'Chase'
}

user_cards {
  user_id: uuid fk
  card_id: text fk
  added_at: timestamp
  primary key (user_id, card_id)
}

credits {
  id: uuid pk
  card_id: text fk
  name: text                  // '$150 StubHub credit'
  amount_cents: integer
  description: text           // short blurb for SMS
  activation_url: text | null
  deadline_type: enum('calendar', 'anniversary', 'rolling_monthly')
  deadline_month: integer     // 1-12, for calendar credits
  deadline_day: integer       // 1-31
  frequency: enum('one_time', 'annual', 'biannual_h1', 'biannual_h2', 'monthly')
  expires_after_year: integer | null  // for one-time credits like the 2026-only $250 hotel credit
  active: boolean
}

reminders_sent {
  id: uuid pk
  user_id: uuid fk
  credit_id: uuid fk
  cycle_key: text              // e.g. 'csr-stubhub-2026-h1' — prevents duplicates per cycle
  reminder_type: enum('month_before', 'week_before')
  sent_at: timestamp
  twilio_sid: text
  unique (user_id, credit_id, cycle_key, reminder_type)
}

credit_claims {
  id: uuid pk
  user_id: uuid fk
  credit_id: uuid fk
  cycle_key: text              // when user texts DONE, mark this cycle complete
  claimed_at: timestamp
  unique (user_id, credit_id, cycle_key)
}
```

**Cycle key logic:** every credit instance has a deterministic cycle key so reminders and claims are scoped to the right deadline period. Examples:
- `csr-stubhub-2026-h1` (Jun 30, 2026)
- `csr-stubhub-2026-h2` (Dec 31, 2026)
- `csr-hotels-250-2026` (one-time, Dec 31, 2026)
- `csr-travel-300-2026` (anniversary-based; year = anniversary year)

---

## 5. Reminder engine

**Trigger:** `vercel.json` cron at `0 14 * * *` (9am Central daily). Endpoint: `/api/cron/send-reminders`.

**Algorithm:**
```
for each active user:
  for each user_card:
    for each active credit on that card:
      compute next_deadline_date based on deadline_type, frequency, today, and user's anniversary if applicable
      compute cycle_key
      if (claim exists for cycle_key) → skip
      days_until = next_deadline_date - today (in user's timezone)
      if days_until == 30 and no month_before reminder sent for cycle_key → send month SMS, log
      if days_until == 7  and no week_before reminder sent for cycle_key → send week SMS, log
```

**Edge cases:**
- One-time credits (`expires_after_year` set): if today's year > expires_after_year, treat credit as inactive.
- New signups: don't backfill missed reminders. Only fire if signup happened more than 30 days before the deadline.
- Timezone math: store deadlines as date-only and compute `days_until` in the user's local TZ to avoid off-by-one.
- Cron failure: idempotent design — running it twice won't double-send because of the unique constraint on `reminders_sent`.

---

## 6. SMS templates

Keep under 160 chars where possible. Always include the dollar amount and deadline.

**Verification (signup):**
```
claim.app: your code is {{code}}. Reply STOP to opt out.
```

**Welcome (post-verify):**
```
You're in. I'll text you 30 + 7 days before each Chase credit expires. Reply STOP to opt out, HELP for help.
```

**Month-before:**
```
{{credit_name}} on your {{card_name}} expires in 30 days ({{deadline}}). That's ${{amount}} you've already paid for. Reply DONE if you've used it.
```

**Week-before:**
```
1 week left on your ${{amount}} {{credit_name}} ({{card_name}}). Expires {{deadline}}. Reply DONE if used.
```

**Inbound `DONE`:**
```
Marked done. I'll skip the remaining reminder for this one. 
```

**Inbound `STOP`:**
Twilio handles automatically — log as `status='stopped'`.

**Inbound `HELP`:**
```
claim.app reminds you about credit card credits before they expire. Msg & data rates may apply. Reply STOP to cancel. Support: hi@claim.app
```

---

## 7. Onboarding flow

1. **`/`** — landing page. CTA: "Stop losing money on your premium card."
2. **`/signup`** — form: phone (E.164 input), timezone (auto-detect via browser, editable). Submit → trigger Twilio Verify.
3. **`/verify`** — enter 6-digit code. On success: create `users` row with `status='pending_verify'` → flip to `active`.
4. **`/onboarding/cards`** — checkbox list of supported cards. Required: at least one.
5. **`/onboarding/anniversary`** — only shown if user picked CSR or United Club. "When does your card year reset? Check your statement." Date picker per card. Skippable (we just won't remind on the $300 / Global Entry credits if blank).
6. **`/done`** — confirmation, send welcome SMS, show "you'll get your first reminder when your soonest credit hits T-30."

---

## 8. Seed data

### Cards
```ts
[
  { id: 'csr', name: 'Chase Sapphire Reserve', issuer: 'Chase' },
  { id: 'united_club_infinite', name: 'United Club Infinite', issuer: 'Chase' },
]
```

### CSR credits (2026)

> Source: scraped from public Chase benefit guides + 2026 product changes. **Verify against the live cardmember agreement before launch.**

| Name | Amount | Deadline | Type | Notes |
|---|---|---|---|---|
| StubHub / viagogo credit | $150 | Jun 30 | biannual_h1 | activation required |
| StubHub / viagogo credit | $150 | Dec 31 | biannual_h2 | resets Jul 1 |
| Exclusive Tables dining | $150 | Jun 30 | biannual_h1 | OpenTable only, curated list |
| Exclusive Tables dining | $150 | Dec 31 | biannual_h2 | |
| The Edit hotel credit | $500 | Dec 31 | annual | flexible all year in 2026, prepaid 2+ night Chase Travel |
| Select Hotels credit | $250 | Dec 31 | one_time | **2026 only — `expires_after_year: 2026`**, IHG/Montage/Pendry/Omni/Virgin/Minor/Pan Pacific |
| Travel credit | $300 | anniversary | annual | needs `users.anniversary_csr` set |
| DoorDash restaurant promo | $5 | end of each month | monthly | low priority — consider skipping for v1 SMS noise |
| DoorDash non-restaurant promos (×2) | $10 each | end of each month | monthly | same |
| Lyft credit | $10 | end of each month | monthly | same |
| Peloton credit | $10 | end of each month | monthly | activation required |

**Recommendation for v1:** seed all of the above but mark monthly credits with a flag `low_priority: true`. Default user preference: only send SMS for credits ≥ $50. Add a toggle later for the keeners.

### United Club Infinite credits

> **Verify these against current Chase docs before launch — these benefits change.** Confidence is lower here than CSR.

| Name | Amount | Deadline | Type | Notes |
|---|---|---|---|---|
| Global Entry / TSA PreCheck credit | $120 | every 4 years on anniversary | anniversary | needs anniversary date |
| Annual United travel credit | varies | anniversary | annual | check current value (was $100 in past years) |
| Inflight purchase rebate | 25% | rolling | n/a | not a deadline credit, skip |
| United Club membership | n/a | annual | n/a | core benefit, no reminder needed |
| IHG One Rewards Platinum status | n/a | through end of 2027 | n/a | one-time enrollment reminder |
| Marriott Bonvoy Gold | n/a | annual | n/a | one-time enrollment reminder |

**v1 ship rule:** if you're unsure about a United Club credit, leave `active: false` in the seed and surface it from `/admin/credits` once verified. Better to under-promise than send wrong dates.

---

## 9. Twilio + compliance setup

**Required before sending any SMS to real users:**

1. **A2P 10DLC registration** — register a brand and campaign with The Campaign Registry. Approval can take 1-3 weeks. Use case: "Account Notification." This is non-negotiable in the US; unregistered traffic gets blocked.
2. **Twilio toll-free number** as a fallback — easier to provision while 10DLC is pending, but rate-limited.
3. **Opt-in language** on `/signup`: small print under phone field — *"By signing up I agree to receive SMS reminders from claim.app. Msg & data rates may apply. Reply STOP to cancel."* Required for TCPA.
4. **Privacy policy + terms at `/privacy` and `/terms`** before sending traffic. Use a generator template, customize for SMS.
5. **STOP/HELP keyword handling** — Twilio Advanced Opt-Out handles this if enabled on the messaging service. Verify it's on.
6. **Quiet hours** — don't send between 9pm and 8am in user's local timezone. Hard rule, FCC-adjacent.

---

## 10. File structure

```
/app
  /(marketing)
    page.tsx                  # landing
    /privacy/page.tsx
    /terms/page.tsx
  /(auth)
    /signup/page.tsx
    /verify/page.tsx
  /onboarding
    /cards/page.tsx
    /anniversary/page.tsx
    /done/page.tsx
  /dashboard
    page.tsx                  # logged-in view: list of upcoming reminders
  /admin
    /credits/page.tsx         # gated by ADMIN_PHONE env
  /api
    /auth/send-code/route.ts
    /auth/verify-code/route.ts
    /onboarding/cards/route.ts
    /webhooks/twilio-inbound/route.ts
    /cron/send-reminders/route.ts
/lib
  /db/schema.ts               # drizzle schema
  /db/index.ts                # drizzle client
  /sms/twilio.ts              # send wrapper
  /sms/templates.ts
  /reminders/engine.ts        # the core algorithm
  /reminders/cycle-keys.ts
  /seeds/cards.ts
  /seeds/credits.csr.ts
  /seeds/credits.united.ts
/scripts
  seed.ts                     # npx tsx scripts/seed.ts
vercel.json                   # cron config
.env.example
README.md
```

**`vercel.json`:**
```json
{
  "crons": [
    { "path": "/api/cron/send-reminders", "schedule": "0 14 * * *" }
  ]
}
```

---

## 11. Environment variables

```
DATABASE_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_FROM_NUMBER=             # fallback if not using messaging service
CRON_SECRET=                    # to lock down /api/cron/*
ADMIN_PHONE=                    # E.164, gates /admin
NEXT_PUBLIC_APP_URL=
```

Cron route should check `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron sends this when configured).

---

## 12. Build phases

**Phase 1 — local working loop (1-2 days):**
- DB + schema + seeds
- Reminder engine with unit tests against fake "today" dates
- Twilio send wrapper with a `DRY_RUN` flag
- Confirm a fake user with a credit at T-30 generates the right SMS body

**Phase 2 — signup + verify (1 day):**
- Twilio Verify integration
- Onboarding flow
- Welcome SMS on success

**Phase 3 — production (1 day):**
- Deploy to Vercel
- Wire cron with `CRON_SECRET`
- Inbound webhook handler (`DONE` / `STOP` / `HELP`)
- Smoke test with own phone number

**Phase 4 — admin + polish (half day):**
- `/admin/credits` to add/edit credits
- `/dashboard` showing user's upcoming reminders
- Privacy + terms pages

**Phase 5 — A2P registration (parallel, 1-3 weeks wall-clock):**
- Submit brand + campaign
- Use toll-free Twilio number for testing in the meantime

---

## 13. Open questions for the builder

1. **Monthly credit noise.** DoorDash + Lyft + Peloton fire 12 reminders/year each per user. Recommend defaulting them off and adding a "send me everything" toggle later. Confirm.
2. **Anniversary date entry.** Asking for it during onboarding adds friction. Alternative: skip it, only remind for calendar credits in v1, add anniversary later. Confirm whether the $300 CSR travel credit is worth the onboarding step.
3. **Pricing.** Spec says free for v1. The earlier business plan was $36/year after a free tier. Decide whether to wire Stripe in Phase 4 or punt entirely.
4. **Auth on the dashboard.** Phone OTP each login is annoying. Use a long-lived signed session cookie (30 days) or magic link?
5. **Seed-data trust.** CSR data is from late April 2026 research and should be re-checked against the official Chase benefits guide before launch. United Club Infinite is lower-confidence — verify every line.

---

## 14. Definition of done for v1

- I can sign up at the deployed URL with my real phone, verify, pick both cards, set my CSR anniversary, and get a welcome SMS.
- A test user seeded with a credit deadline 30 days out triggers exactly one SMS when the cron runs.
- Replying `DONE` suppresses the 7-day reminder for that cycle.
- Replying `STOP` halts all future SMS to that number.
- The admin page lets me edit a credit's deadline without a redeploy.
- 10DLC registration is in flight (doesn't have to be approved yet).
