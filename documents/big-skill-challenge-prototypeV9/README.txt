Big Skill Challenge™ — Interactive UX Prototype
================================================
Client proposal prototype · Mobile-first 390×844px · Dark Figma theme · WCAG 2.2 AA

SCREENS (open 01-landing.html to start):
  01-landing.html        Landing — BIG WIN badge, countdown, ENTER NOW CTA
  02-register.html       Create Account / Log In (tabbed, consent checkboxes)
  03-email-verify.html   Email OTP verification (6-digit, auto-advance)
  04-eligibility.html    Entry eligibility confirmations (3 checkboxes)
  05-payment.html        Secure payment form — £2.99 entry fee
  06-payment-success.html Payment confirmed + quiz briefing
  07-quiz.html           Timed quiz (30-sec countdown per question)
  08-quiz-incorrect.html Incorrect answer — attempt ended
  08-quiz-timeout.html   Time expired — attempt ended
  09-quiz-success.html   Quiz passed — creative submission unlocked
  10-creative.html       25-word timed creative entry (120-sec, paste blocked)
  11-entry-accepted.html Entry submitted and recorded confirmation
  12-dashboard.html      My Dashboard — 3-tab nav (Dashboard / Entries / Account)
  13-result.html         AI evaluation result, rubric breakdown, audit trail

NAVIGATION FLOW:
  01 → 02 → 03 → 04 → 05 → 06 → 07 →┬→ 08-incorrect  → 01
                                       ├→ 08-timeout    → 01
                                       └→ 09 → 10 → 11 → 12 → 13 → 12

KEY BEHAVIOURS:
  • Live countdown timer — landing page, dashboard, quiz per-question, creative
  • Quiz: Select A = incorrect (08-incorrect); B/C/D = advance (09-success)
  • Word count: exactly 25 words required to enable submit button
  • Paste is blocked on creative entry with visible toast alert
  • All consent checkboxes must be ticked to enable registration CTA
  • Immutable audit trail accordion on result screen
  • Score ring SVG (94/100) with rubric breakdown bars on result screen

DESIGN SYSTEM:
  Background  linear-gradient(180deg, #08002E, #12006E, #1A0A7C)
  Glass cards rgba(255,255,255, .07) · border rgba(255,255,255, .12)
  CTA buttons linear-gradient(90deg, #F59E0B, #EA580C) · border-radius: 50px
  Inputs      rgba(255,255,255, .08) · focus glow #F59E0B
  Stars       CSS radial-gradient on ::before pseudo-element
  Green       #4ADE80 (success) · Red #F87171 (error) · Purple #C4B5FD

PLATFORM NOTES:
  The evaluation system uses a deterministic rubric-based process (not generative AI).
  Entry fees held in a designated competition trust account.
  Final prize decisions made exclusively by 3 independent human judges.
  Prize winner verified by an independent scrutineer.

No internet connection required. All 14 files are self-contained.
