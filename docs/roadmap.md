# Swell — Roadmap & Planning

Living plan for the frontend/product. Backend contract lives in `docs/api-spec.json`.
Build order is the discipline: ship the core loop honest first, growth/monetization after it works.

---

## Status snapshot (Sep 2026)

| Area | State |
|------|-------|
| Monorepo (engine + swell + api stub) | Done |
| Core loop: Home → BlockStack → Victory | Done (1 tap to game) |
| Subtle dark UI (count hero, coral CTA only) | Done |
| Home stats | **Hardcoded** — needs real/mock data |
| Cravings count | **Local only** (resets on restart) |
| Progress tab | **Dead** (`onTabPress` no-op) |
| Onboarding | **Missing** |
| Reflection (voice/text) | UI shell only |
| Auth / persistence | **Missing** |
| Store listing / ASO | **Not started** |

---

## Guiding principles

1. **Make it honest before making it grow** — real numbers before social features.
2. **Rewards ≠ payment.** People pay because the app *helped*, not because they earned points. No crypto/token rewards (store-policy risk + wrong audience).
3. **Motivation without a moderation burden** — aggregate social proof + curated quotes first; open UGC only if data demands it.
4. **Paywall after a felt win**, never on install.
5. **Keep the calm brand** — subtle gamification (ocean fills up), no leaderboards/competitive social in v1.

---

## Phase 2 — Make the app real (NEXT)

Turns the demo into something usable daily and screenshot-worthy for the store.
Backend can be mocked against `docs/api-spec.json` until APIs ship.

### 2A — Honest Home (do first)
- [ ] TanStack Query hooks: `useDashboard()` / `useCravingStats()`
- [ ] Replace hardcoded stats (4 days / ₹520 / 8h) with API or mock
- [ ] Animate the count up when a craving is beaten
- [ ] Wire BottomNav → real navigation
- [ ] Loading + empty states on Home
- **Done when:** open app → real/mock stats; beat craving → number updates.

### 2B — Progress screen ("Your Ocean")
- [ ] Money reclaimed (hero) from `derived.money_reclaimed`
- [ ] Constellation/ocean fills with each craving beaten (cap density ~50)
- [ ] Health timeline from `health_timeline`
- [ ] Insight card (placeholder until AI live)
- [ ] **Personal best streak** ("Longest smoke-free: 12 days")
- [ ] **Money-in-real-terms** ("₹520 = 2 weeks of chai")
- **Done when:** Progress tab shows the journey, not a dead icon.

### 2C — Onboarding
- [ ] Welcome ("A craving lasts 3 minutes.")
- [ ] Reason (text)
- [ ] Setup: cigs/day, cost/pack, quit date
- [ ] `PUT /profile`; local flag until auth exists
- **Done when:** first launch is guided; stats computable from profile.

---

## Phase 2.5 — Motivation & belonging (safe, low-cost)

Gives the "we're in this together" feeling with **no moderation burden**.

### Ship now (zero UGC risk)
- [ ] **Curated quotes / encouragement** — rotating message on Home, Victory, craving-time notifications. Add a `motivation` block to `NicheConfig` (per-niche, editable).
- [ ] **Aggregate social proof** — "You + 800 others beat a craving today." Single backend number (`GET /community/pulse`). Belonging without a feed.

### Phase 3+ (opt-in, still low risk)
- [ ] **Private photo milestones** — "Day 2" selfie stored privately in the user's own Progress. No feed, no strangers. (Candidate premium feature.)
- [ ] **Shareable milestone cards** — opt-in "share this win" exports an image to the user's *own* Instagram/WhatsApp. Growth loop without hosting a social network.

### Later — only if data shows demand (heavy, needs moderation)
- [ ] Read-only curated inspiration wall (approved stories, not open posting)
- [ ] Reactions before comments (❤️/respect, no text box to abuse)
- [ ] Moderated text posts (report + block + auto-filter required)
- [ ] Public photo posting **last** (needs image moderation) — high risk, may never ship

---

## Phase 3 — Reflection + AI (after 2A–2C, needs backend)
- [ ] `ReflectScreen` after Victory: `expo-av` record → upload → transcribe
- [ ] Skip stays equally easy (no guilt UX)
- [ ] Optional text note fallback
- [ ] Weekly AI insight ("you crave most at 4pm") → the paid hook

---

## Phase 4 — Pre-store polish (parallel with ASO)
- [ ] Haptics on line clear + victory
- [ ] BlockStack: rotate piece, game-over when stack fills
- [ ] Offline: queue `POST /cravings`, sync later (important for India networks)
- [ ] Settings: quit date, craving-time reminder notifications
- [ ] App icon + splash matching subtle brand (not neon ocean)
- [ ] Test on a low-end Android device

---

## Phase 5 — Monetization & ship

### Paywall model (free core + paid depth)
| Free | Premium (~₹49–99/mo) |
|------|----------------------|
| Fight loop (Home → game → victory) | AI trigger insights |
| Basic count + days free | Full history & patterns |
| One game (BlockStack) | All games |
| — | Voice reflections + transcripts |
| — | Private photo journey + custom reminders |

- [ ] RevenueCat integration (`react-native-purchases`)
- [ ] `/revenuecat-webhook` + `GET /subscription` (see api-spec)
- [ ] **Paywall trigger after Nth win** (e.g. 5th craving beaten), not on install
- [ ] EAS build → internal testing → store submission

### ASO (this is the discovery lever — not web SEO)
- [ ] Play title: `Swell: Beat Smoking Cravings` / Apple subtitle: `Win the 3-minute craving`
- [ ] Keyword-rich descriptions (quit smoking, craving, urge, nicotine, smoke free) — no medical claims
- [ ] Screenshots: Home count → in-game cooling → Victory → Progress/money saved
- [ ] Category: Health & Fitness / Lifestyle (not Medical)
- [ ] Privacy policy URL + support email (required)
- [ ] Stable package `com.swell.quit`
- [ ] Ask for rating after 3rd craving beaten
- [ ] Optional: one-page site (what it is + privacy) — for trust/policy URL, not an SEO campaign

---

## New backend endpoints implied by these ideas
(To add to `docs/api-spec.json` when we build Phase 2.5)
- `GET /community/pulse?app_id=swell` → `{ "cravings_beaten_today": 803, "active_users_today": 210 }`
- `GET /quotes?app_id=swell` → curated list (or bundle client-side, no API needed for v1)
- `POST /storage/upload-url` (already spec'd) reused for private milestone photos

---

## Recommended order

```
Sprint 1 (Week 1):   2A — honest Home + nav + count animation
Sprint 2 (Week 2):   2B — Progress ("Your Ocean") + 2C — onboarding
                     + 2.5 quotes & social proof (cheap, ships alongside)
Sprint 3 (Week 3):   Device testing + ASO assets + EAS internal build
                     (backend ships P0 APIs in parallel)
Sprint 4+ :          Phase 3 reflection/AI → Phase 5 paywall → submit
```

**Next pick: Phase 2A** — mock `useDashboard()`, wire Home to it, hook up bottom nav, scaffold Progress. Highest leverage: makes the app feel real and unblocks store screenshots. Quotes + social proof (2.5) can piggyback since they're mostly client-side.
