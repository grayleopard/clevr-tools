# Backlog

Deferred items surfaced during the polish sprint. Not urgent, not forgotten.

## Numble game-page stale static countdown

`/play/numble` is statically generated (confirmed via `next build` output — `○ /play/numble`).
`components/numble/NumbleGame.tsx:300` computes `countdownSec: getSecondsUntilMidnight()`
inside `createInitialSession()`, which runs during `useMemo(() => createInitialSession(), [])`
at render time — same class of bug the homepage `DailyChallengeBanner` had before the
Phase 2 follow-up fix (`components/numble/DailyChallengeBanner.tsx`): a build-time clock
value gets baked into the prerendered HTML and is stale for anyone visiting after build time,
until client JS corrects it.

Apply the same fix: literal `"--:--:--"` (or better, a skeleton pulse) as the initial SSR
value, corrected via `useLayoutEffect` after mount — not a `setTimeout(0)`. See the banner
fix for the exact pattern (`useIsomorphicLayoutEffect`, `sr-only` loading label).

Lower priority than the banner was — this is the full game page, not homepage-critical path —
but same bug, same fix, worth doing in one pass.

## Server-known TOC headings for the 25 rich calculators

`components/tool/OnThisPageNav.tsx` renders the "On this page" sidebar. Headings from each
tool's `seoContent` (registry HTML string) get ids injected server-side (`lib/seo/toc.ts`) —
fully SSR'd, no JS required, confirmed via `curl` in Phase 2.

But 25 calculator components embed their own extra topical headings directly in JSX
(e.g. `LoanCalculator.tsx`: "How Loan Payments Are Calculated", "Tips for Getting a Lower
Interest Rate") using the shared pattern `className="text-lg font-semibold text-foreground mb-3"`.
These aren't derivable server-side without per-tool authoring, so `OnThisPageNav` picks them
up via a client-side DOM scan after mount and appends them to the seeded list — progressive
enhancement, not primary render. Full list of affected files:

```
CalorieCalculator, AutoLoanCalculator, CaloriesBurnedCalculator, AmortizationCalculator,
BodyFatCalculator, BmiCalculator, CarPaymentCalculator, DebtToIncomeCalculator,
CreditCardPayoffCalculator, DueDateCalculator, DownPaymentCalculator, IdealWeightCalculator,
LoanCalculator, MacroCalculator, InvestmentReturnCalculator, PaceCalculator,
NetWorthCalculator, RetirementCalculator, PaycheckCalculator, SavingsGoalCalculator,
OvulationCalculator, TakeHomePayCalculator, SleepCalculator, SalaryCalculator,
SalesTaxCalculator
```

Practical effect today: on these 25 pages, a shared link to `/calc/loan#how-loan-payments-are-calculated`
won't resolve until JS runs (the id doesn't exist in the initial HTML), and the sidebar can grow
by a few items after mount (measured CLS was 0 in testing, but it's still not fully server-known).

Fix: add a `pageSections?: string[]` field to `Tool` in `lib/tools.ts` for these 25 entries,
matching each heading's exact text, and have `ToolLayout.tsx` seed `OnThisPageNav` with those
too (same `slugify` used in `lib/seo/toc.ts`) — eliminates the client-side DOM scan entirely
for these pages. ~25 mechanical entries; no design decisions required, just data entry.

## AdSense integration

`components/tool/AdSlot.tsx` is currently a no-op stub:

```tsx
// Ad slots removed — placeholder kept so existing imports compile without changes.
export default function AdSlot({ className }: { className?: string }) {
  void className;
  return null;
}
```

The Privacy page (`app/privacy/page.tsx`, "Advertising" section) already describes AdSense in
future tense, correctly matching this stub state. When ready to actually run ads:

- Wire real ad units into `AdSlot.tsx` (currently every call site still exists — grep for
  `<AdSlot` to find placements).
- Add the AdSense script tag + `ads.txt`.
- EU/UK visitors need a consent mechanism (Google's Funding Choices, or a custom CMP) before
  any personalized-ads cookie gets set — this is a legal requirement (GDPR/UK-GDPR + Google's
  own EU consent policy for publishers), not optional polish.
- Flip the Privacy page's Advertising section from future to present tense as part of the same
  change (explicitly called out in that section's copy: "If we add Google AdSense in the
  future, this page will be updated first").
