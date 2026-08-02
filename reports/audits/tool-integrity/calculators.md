# Calculator and Converter Product-Integrity Audit

Audit date: 2026-08-01

Repository state: `codex/tool-integrity-audit` at `a3bff45`

Scope: all 66 registered tools with `category: 'calc'` in `lib/tools.ts`

Production changes: none

## Outcome

- All 66 registered calculator routes rendered and reacted to an input in desktop Chromium.
- Eight tools have independently reproducible P1 correctness defects: Poker Calculator, Age Calculator, Date Difference, Take-Home Pay Calculator, Amortization Calculator, Paycheck Calculator, Body Fat Calculator, and Pace Calculator.
- No P0 calculator defect was found. This is not a security assessment, and the shape-only browser smoke tests do not prove every displayed number.
- Thirty other tools are `PARTIAL`: their normal arithmetic is sound, but an assumption, stale data source, boundary, label, or sensitive-domain limitation prevents a full pass. The remaining 28 are `PASS` for the tested functional scope.
- Demonstrated demand is `UNKNOWN` for every row. No GSC or equivalent demand export was supplied, so demand is excluded from the known-score subtotal rather than scored as zero.
- Discovery, sitemap, indexability, and search/category discoverability are intentionally left for the route/discovery workstream. All rows here are confirmed `LIVE_REGISTERED` in `lib/tools.ts`.

## Evidence and test method

### Direct browser execution

The audit ran the production-style Playwright server and Chromium against the checked-out application:

| Command | Result | What it establishes |
|---|---:|---|
| `npm run test:e2e -- tests/e2e/tool-audit/functional-smoke.spec.ts --grep /calc/ --workers=4` | 35 passed | Every non-converter calculator route loaded, accepted its fixture input, and produced the expected *shape* of result. This is `PARTIAL` evidence unless paired with independent arithmetic. |
| `npm run test:e2e -- tests/e2e/tool-audit/unit-converter-smoke.spec.ts --workers=4` | 32 passed | The 31 converter-family routes rendered finite From/To values and changed the result after entering `10`; the 32nd test is registry coverage. This is route/interaction evidence, not an independent exact-value oracle. |

The first sandboxed server attempt could not bind `0.0.0.0:3101` (`EPERM`). The same commands passed outside that port-bind restriction; the initial failure is environmental, not a product defect.

### Independent validation

- Formula results were independently recomputed for representative normal, zero, decimal, boundary, and very large inputs. Exact anchors are named in the matrices below.
- Source inspection covered parsing, range enforcement, display rounding, date construction, iteration caps, unit factors, privacy behavior, and visible disclosures.
- Current tax values were checked against the IRS and SSA primary sources listed under “Authoritative references.”
- The body-composition equation was checked against official Navy measurement guidance and independently evaluated in its required inch domain.
- Poker starting-hand figures were checked with a seeded 250,000-deal heads-up Texas Hold'em Monte Carlo using an independent seven-card evaluator. Sampling uncertainty is approximately ±0.2 percentage points at 95% confidence; the discrepancies are far larger than that uncertainty.

### Shared matrix fields

Unless a row says otherwise:

- `registry_status=LIVE_REGISTERED`; route is present in `lib/tools.ts`.
- `desktop_status=PASS` for route rendering and fixture interaction, not necessarily numerical correctness.
- `mobile_status=UNVERIFIED`; responsive class use was inspected, but this worker did not run all 66 routes at a mobile viewport.
- `accessibility_status=PARTIAL`; core labels are usually associated, but this was source inspection rather than a full keyboard/screen-reader audit. Known examples include unlabeled per-course GPA grade selects, generic `X` remove buttons in list calculators, and unlabeled minute/second pace inputs.
- `privacy_model=browser-local/no upload`; no calculator input persistence, analytics payload construction, or calculator-specific runtime network dependency was found in the components.
- `external_dependencies=none at runtime`; tax tables, state-rate presets, MET values, clinical equations, and calendar assumptions are maintenance dependencies even when embedded locally.
- `gsc_impressions`, `gsc_clicks`, `gsc_position`, and `demand_score=UNKNOWN`.
- `indexable`, `sitemap_included`, `navigation_discoverable`, `category_discoverable`, `search_discoverable`, and `recommended_seo_action=DEFER_TO_ROUTE_AUDIT`.
- `output_verified=true` only where the named expected and actual values were independently compared. A browser text-pattern match alone is not marked as an exact output pass.
- Score notation is `correctness / demand / differentiation / strategic fit / maintainability`; the subtotal is out of 75 known points because demand is unknown.

## P1 defects requiring repair before promotion

### 1. Take-Home Pay Calculator and Paycheck Calculator — stale and incomplete 2026 tax model

`components/tools/TakeHomePayCalculator.tsx:19-53` and `components/tools/PaycheckCalculator.tsx:20-54` embed 2025 federal deductions and brackets. Both cap Social Security wages at `$176,100` (`TakeHomePayCalculator.tsx:156`, `PaycheckCalculator.tsx:158`) instead of the 2026 `$184,500` wage base, and neither applies the 0.9% Additional Medicare Tax above the statutory threshold.

- Input: single filer, Texas, no pre-tax deductions, `$75,000` annual salary.
- Correct 2026 model: deductions `$13,407.50`; annual net `$61,592.50`; biweekly `$2,368.94`.
- Actual embedded model: deductions `$13,851.50`; annual net `$61,148.50`; biweekly `$2,351.87`.
- Error: net pay understated `$444.00` per year.
- High-income boundary: at `$1,000,000`, correct 2026 net is `$646,860.75`; actual is `$653,111.55`, an overstatement of `$6,250.80` because stale thresholds and omitted Additional Medicare interact.
- Paycheck default (`$3,000` biweekly = `$78,000` annual): correct `$2,450.12` per check; actual `$2,433.04`.

The flat “effective” state rates are also too coarse for a paycheck estimator and omit local taxes, credits, dependents, and Form W-4 details. The visible approximation disclaimer reduces advice risk but does not cure wrong current-year federal outputs.

### 2. Body Fat Calculator — Navy constants applied to centimeters

`components/tools/BodyFatCalculator.tsx:76-87` converts imperial measurements to centimeters, then `:103-115` applies the U.S. Navy equations whose published constants require inches. Logarithmic scaling does not cancel.

- Male input: 5 ft 10 in, waist 34 in, neck 15 in. Expected `17.5%`; actual `24.0%` (+6.5 percentage points).
- Female input: 5 ft 10 in, waist 34 in, neck 15 in, hip 38 in. Expected `27.9%`; actual `54.5%` (+26.6 percentage points).

This is sensitive health output. Keep the calculator unpublished from any flagship surface until the unit defect is fixed and the equations, measurement protocol, category labels, populations, and disclaimer receive qualified clinical/fitness review.

### 3. Age Calculator and Date Difference — invalid calendar decomposition

Both tools borrow days only once and can leave a negative day component across short-month boundaries.

- Input: `2026-01-31` to `2026-03-01`.
- Expected: 29 elapsed days and a non-negative calendar decomposition (for example `0 years, 0 months, 29 days`, depending on the stated convention).
- Age actual: `0 years, 1 months, -2 days` while also showing 29 total days (`components/tools/AgeCalculator.tsx:136-154`).
- Date Difference actual: `0 years, 1 months, -2 days` while its primary elapsed total is 29 days (`components/tools/DateDifference.tsx:90-107`).

Age also floors local-midnight millisecond differences: in `America/Los_Angeles`, `2026-03-08` to `2026-03-09` spans 23 hours and can display zero total days. Date Difference uses `Math.round`, which masks that one-day case, but its “today” shortcuts mix `Date.now()` with UTC `toISOString()` and remain timezone-sensitive near local-day boundaries.

### 4. Poker Calculator — starting-hand “win rates” are heuristic, not simulations

`components/tools/PokerCalculator.tsx:130-149` generates percentages from a short heuristic, despite presenting them as approximate heads-up win rates. Representative UI/source outputs versus the independent simulation:

| Hand | Actual | Independent heads-up equity |
|---|---:|---:|
| 7-2 offsuit | 58% | 34.48% |
| 7-2 suited | 61% | 38.28% |
| A-2 offsuit | 65% | 55.07% |
| A-K suited | 80% | 67.12% |

The odds/outs, pot-odds, payout, and implied-probability arithmetic is sound; the P1 is confined to a prominently displayed decision aid that can materially mislead play.

### 5. Amortization Calculator — overstates the final payment with extra principal

`components/tools/AmortizationCalculator.tsx:63-83` correctly caps principal and extra principal but always adds the full base payment to `totalPaidWith` and to the schedule's last payment.

- Input: `$300,000`, 6.5%, 30 years, `$100` extra monthly.
- Payoff month: expected and actual 312.
- Expected final payment: `$819.21`; actual `$1,896.20`.
- Expected total paid: `$621,638.68`; actual `$622,715.67`.
- Overstatement: `$1,076.99`.

Interest and months saved remain internally sound for this case; the displayed payment/total fields are not.

### 6. Pace Calculator — seconds can render as `60`

`components/tools/PaceCalculator.tsx:18-30` floors minutes/hours but independently rounds the residual seconds without carrying a rounded 60.

- Input: 3 miles in `00:17:59`.
- Exact pace: 359.667 seconds/mile; correctly rounded display: `6:00`.
- Actual: `5:60`.

The same defect affects predicted finish times and split rows at `.5`-second boundaries.

## Per-tool functional matrix — calculators

`Output` records `expected → actual`. `✓` means independently verified; `shape` means the browser only proved a plausible result region. Severity is blank where no actionable defect was found.

| Tool and route | Inputs and edge cases | Output / validation | Verification; output verified | Recommendation; severity | Score C/D/Df/F/M |
|---|---|---|---|---|---|
| Percentage Calculator — `/calc/percentage` | `15% of 200`; `30 is ?% of 200`; zero denominator; negative baseline; decimal | `30 → 30`; `15% → 15%`; division by zero is handled. Change from `-100` to `-50` is labeled as a decrease although sign-sensitive semantics are ambiguous. Copy is present. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 15 / 15 / 9 = 67/75` |
| Odds Calculator — `/calc/odds-calculator` | American `+150`, `-110`; decimal `1`; two-leg `+100/+100`; `$100` stake | `+150 → 2.50, 40%, $150 profit`; `-110 → 1.9091, 52.38%`; parlay `4.00`; decimal `≤1` rejected. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 15 / 13 / 9 = 67/75` |
| Poker Calculator — `/calc/poker` | Pot odds; 9 outs; starting hands 72o/72s/A2o/AKs; empty amounts | Pot-odds and outs formulas match independent math; starting-hand table differs by 10-24 points from simulation. | `FAIL`; ✓ | `FIX`; P1 | `10 / ? / 16 / 13 / 6 = 45/75` |
| Age Calculator — `/calc/age` | `1990-06-15` normal; `2026-01-31→2026-03-01`; equal dates; future DOB; DST transition | Month-end expected non-negative decomposition → `0y 1m -2d`; total days can undercount across spring DST. Empty/future states are handled. | `FAIL`; ✓ | `FIX`; P1 | `12 / ? / 16 / 15 / 6 = 49/75` |
| Date Difference — `/calc/date-difference` | normal 90-day shortcut; reverse dates; equal dates; month-end; DST/timezone | 29 elapsed days is correct, but expected non-negative decomposition → `0y 1m -2d`. Reverse-direction total works. | `FAIL`; ✓ | `FIX`; P1 | `13 / ? / 15 / 15 / 6 = 49/75` |
| BMI Calculator — `/calc/bmi` | 5 ft 10 in / 160 lb; metric equivalent; zero/empty; adult category boundaries | Expected `22.96` → displayed about `23.0`; imperial and metric agree. Adult bands are correct as a screening convention, not a diagnosis. Child, pregnancy, athlete, and ethnicity limitations require qualified review and stronger scoping. | `PARTIAL`; ✓ | `KEEP`; P2 | `26 / ? / 13 / 13 / 8 = 60/75` |
| Mortgage Calculator — `/calc/mortgage` | `$400k`, 20%, 6.5%, 30y; zero interest; tax/insurance; <20% down | Principal-and-interest formula and zero-rate branch pass (`$320k` loan → about `$2,022.62/mo`). “Total Cost” excludes the down payment, property tax, insurance, and PMI; PMI is charged for the entire term rather than ending at an LTV threshold. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 15 / 14 / 7 = 60/75` |
| Tip Calculator — `/calc/tip` | `$85.50`, 18%, split 1/2; decimal split `2.9`; zero/empty | `$15.39` tip, `$100.89` total, `$50.45` each for 2 → same. Split uses `parseInt`, so `2.9` silently becomes 2; HTML max is not enforced in logic. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 10 / 14 / 9 = 62/75` |
| Discount Calculator — `/calc/discount` | `$100` at 20%; stacked discounts; reverse mode; 0/100%; decimals | `$80.00 → $80.00`; stacked discounts multiply rather than add; discounts clamp to 0-100. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 12 / 14 / 9 = 65/75` |
| Compound Interest Calculator — `/calc/compound-interest` | `$10k`, `$500/mo`, 7%, 10y; 0%; negative contribution/rate; decimal years | Monthly end-of-period contribution simulation matches independent recurrence. Negative principal/contribution clamp to zero; negative rate is accepted. Compounding timing is disclosed in code/UI context but fees, tax, and volatility are outside scope. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 14 / 14 / 8 = 64/75` |
| GPA Calculator — `/calc/gpa` | A with 3 credits; A/B equal credits; prior GPA; >4 direct input; empty row | `A, 3 credits → 4.00`; A/B equal credits `→ 3.50`. Fixed U.S. 4.0 mapping is coherent, but prior GPA can exceed 4 through direct entry and course grade selects lack individual accessible names. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 13 / 13 / 8 = 62/75` |
| Salary Calculator — `/calc/salary` | `$50/hr`, 40 h/week, 52 weeks; 0; decimals | `$104,000/year → $104,000.00`; hourly/weekly/monthly conversions are arithmetically consistent under the entered workweek. USD and five-day daily convention only. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 12 / 14 / 9 = 65/75` |
| Take-Home Pay Calculator — `/calc/take-home-pay` | `$75k`, single, TX, no deductions; `$1m` Additional Medicare boundary; state presets | 2026 expected `$61,592.50` annual net → `$61,148.50`; `$1m` expected `$646,860.75` → `$653,111.55`. | `FAIL`; ✓ | `FIX`; P1 | `8 / ? / 15 / 15 / 5 = 43/75` |
| Loan Calculator — `/calc/loan` | `$25k`, 6.5%, 5y; `$1,200`, 0%, 1y; negative rate; decimal term | Zero-rate expected `$100/mo → $100.00`; standard amortization matches independent formula. Typed negative rates are not rejected in calculation. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 12 / 14 / 9 = 63/75` |
| Auto Loan Calculator — `/calc/auto-loan` | price/down/trade/rate/term; 0%; negative equity scenario; zero financed | Standard payment on `price - down - trade` is correct. It omits sales tax/fees and trade loan payoff, despite adjacent copy implying negative equity is addressed. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 13 / 14 / 7 = 58/75` |
| Credit Card Payoff Calculator — `/calc/credit-card-payoff` | `$1,000`, 0%, `$100`; default interest; payment at/below interest; just above interest; >600 months | 0% payoff `10 months → 10 months`; normal simulation passes. `$5,000`, 22%, `$91.6667` still owes about `$4,901.46` after 600 months, but returns `ok` at the hard cap as if paid off. | `PARTIAL`; ✓ | `FIX`; P2 | `23 / ? / 15 / 15 / 7 = 60/75` |
| Savings Goal Calculator — `/calc/savings-goal` | target `$1,200`, current 0, 0%, 12 months; positive rate; negative entries | 0% expected `$100/mo → $100.00`; ordinary-annuity result matches end-of-month contribution recurrence. Interest timing is an assumption; negative inputs are not consistently rejected. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 13 / 14 / 8 = 63/75` |
| Retirement Calculator — `/calc/retirement` | current age/retirement age; 0% return; inflation on/off; 4% withdrawal | Projection recurrence and 4% arithmetic are internally correct under nominal, constant-return assumptions. No fees, taxes, sequence risk, pensions, or probabilistic range; visible estimate/not-advice language is helpful. Qualified financial review required. | `PARTIAL`; ✓ | `KEEP`; P2 | `25 / ? / 15 / 15 / 7 = 62/75` |
| Investment Return Calculator — `/calc/investment-return` | `$1,000`, 0 contribution, 0%, 10y; monthly contribution; negative return | 0% expected `$1,000 → $1,000`; monthly recurrence passes. Constant return, end-of-month deposits, no fees/taxes/volatility. Qualified financial review required. | `PARTIAL`; ✓ | `KEEP`; P2 | `26 / ? / 13 / 14 / 8 = 61/75` |
| Debt-to-Income Calculator — `/calc/debt-to-income` | `$6,000` income and `$2,200` listed obligations; zero income; negative debt | `36.67% → 36.7%`; arithmetic passes. It treats rent and mortgage interchangeably and presents lender bands as universal; underwriting conventions vary by loan and geography. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 13 / 14 / 8 = 60/75` |
| Net Worth Calculator — `/calc/net-worth` | assets `$1,000`; liabilities `$250`; add/remove; negatives; empty | `$750 → $750`; sum/subtraction passes. Negative values can invert an item’s meaning, and repeated remove controls have generic accessible names. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 11 / 14 / 8 = 61/75` |
| Sales Tax Calculator — `/calc/sales-tax` | `$100` at 8%; reverse `$108`; 0%; state preset; local/product cases | Forward `$108 → $108`; reverse `$100 pre-tax → $100`. Presets are state base rates only and are presented as 2025 data; local, product, holiday, and nexus rules are omitted. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 14 / 14 / 6 = 58/75` |
| Amortization Calculator — `/calc/amortization` | `$300k`, 6.5%, 30y, `$100` extra; 0%; no extra; payoff month | Final expected `$819.21 → $1,896.20`; total expected `$621,638.68 → $622,715.67`. | `FAIL`; ✓ | `FIX`; P1 | `14 / ? / 13 / 14 / 6 = 47/75` |
| Car Payment Calculator — `/calc/car-payment` | standard amount/rate/term/down payment; 0%; compare Auto Loan | Core payment formula works, with the same tax/fee limitations and less capability than Auto Loan. Duplicates the same intent and should redirect/converge on Auto Loan after parity review. | `PARTIAL`; ✓ | `CONSOLIDATE`; P2 | `25 / ? / 5 / 12 / 6 = 48/75` |
| Paycheck Calculator — `/calc/paycheck` | `$3,000` biweekly, single, TX; `$1m` annualized boundary; per-period pre-tax | 2026 expected `$2,450.12/check → $2,433.04`; shares stale tables and missing Additional Medicare with Take-Home Pay. | `FAIL`; ✓ | `FIX`; P1 | `8 / ? / 8 / 14 / 4 = 34/75` |
| Down Payment Calculator — `/calc/down-payment` | `$400k` at 20%; current savings; 0 months; <20% | `$80,000 → $80,000`; linear savings arithmetic passes. Savings growth is excluded and PMI message is a U.S. rule-of-thumb, not a lender quote. | `PARTIAL`; ✓ | `KEEP`; P3 | `28 / ? / 11 / 13 / 8 = 60/75` |
| Calorie Calculator (TDEE) — `/calc/calorie` | Mifflin-St Jeor male/female; lb/kg; activity presets; gain/loss; min values | BMR/TDEE formulas and unit conversion match independent arithmetic for normal adults. Fixed ±500 targets can become clinically inappropriate or negative at accepted boundaries; adult scope and population limits need qualified nutrition review. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 15 / 14 / 7 = 60/75` |
| Macro Calculator — `/calc/macro` | `2,000 kcal`, 30/40/30; presets; custom sum ≠100; negative percentages | Expected protein `150g`, carbs `200g`, fat `66.7g` → same. Custom percentages are silently normalized, and typed negatives can produce negative grams. Keto/high-protein guidance needs qualified nutrition review. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 14 / 14 / 7 = 59/75` |
| Body Fat Calculator — `/calc/body-fat` | male/female Navy examples; imperial/metric parity; BMI method; waist≤neck | Male expected `17.5% → 24.0%`; female `27.9% → 54.5%`. | `FAIL`; ✓ | `FIX`; P1 | `5 / ? / 15 / 14 / 5 = 39/75` |
| Due Date Calculator — `/calc/due-date` | LMP `2026-01-01`; cycle length 28/longer; conception; IVF day 3/5; future/past | LMP expected `2026-10-08 → 2026-10-08`; conception +266 and IVF +263/+261 arithmetic is sound. Current gestational day is local-time/DST-sensitive; cycle and eligibility assumptions need qualified obstetric review. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 16 / 14 / 7 = 62/75` |
| Ovulation Calculator — `/calc/ovulation` | LMP `2026-06-01`, 28-day cycle; 21/35 boundaries; irregular cycle | Expected ovulation `2026-06-15` and fertile window `2026-06-10..15` → same. Calendar prediction is not contraception and is unreliable for irregular cycles; qualified review and explicit birth-control warning are required. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 15 / 13 / 7 = 60/75` |
| Ideal Weight Calculator — `/calc/ideal-weight` | male/female at 5 ft and 6 ft; metric parity; <5 ft; frame adjustment | Devine/Robinson/Miller/Hamwi formulas reproduce their historical equations. The “ideal” framing and arbitrary ±10% frame adjustment are not clinical targets; retain only with qualified review and clearer purpose limits. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 13 / 12 / 7 = 56/75` |
| Calories Burned Calculator — `/calc/calories-burned` | 70 kg, MET 8, 60 min; lb/kg; zero duration; activity presets | Expected `560 kcal → 560 kcal`; `MET × kg × hours` gross-energy estimate passes. Embedded MET labels/rates are broad and unversioned; individual variation and net-vs-gross distinction need review. | `PARTIAL`; ✓ | `KEEP`; P2 | `26 / ? / 14 / 13 / 7 = 60/75` |
| Sleep Calculator — `/calc/sleep` | wake-time and bedtime modes; cycle count; midnight crossing; DST | 90-minute cycle arithmetic is internally consistent, including midnight wrap. Treating fixed 90-minute cycles as recommended timing overstates biological precision; age, sleep need, and sleep-disorder boundaries need qualified review. | `PARTIAL`; ✓ | `FIX`; P2 | `23 / ? / 14 / 13 / 7 = 57/75` |
| Pace Calculator — `/calc/pace` | 3 mi in `17:59`; preset distances; time/distance modes; zero; decimals | Expected `6:00/mi → 5:60/mi`; normal non-boundary division works. | `FAIL`; ✓ | `FIX`; P1 | `18 / ? / 15 / 14 / 7 = 54/75` |

## Per-tool functional matrix — converter family

All converter rows were exercised in the browser with a finite default and `From=10`. The named exact anchor was also independently checked against `lib/conversions.ts`, `components/tools/UnitConverter.tsx`, or the pair route's configured units. Shared limitations: empty values clear the result; ordinary decimals and negatives calculate; HTML constraints are not a robust domain validator; sufficiently huge values can reach `Infinity`; and mobile remains unverified. The standalone converter has Copy; generic/pair pages have Reset. Generic Swap changes unit direction but deliberately leaves the numeric input in place.

| Tool and route | Exact anchor: expected → actual | Boundary / limitation | Verification; output verified | Recommendation; severity | Score C/D/Df/F/M |
|---|---|---|---|---|---|
| Unit Converter — `/calc/unit-converter` | `1 m → 3.28084 ft` | Seven categories; binary storage is described. No physical-domain rejection. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 16 / 15 / 9 = 70/75` |
| Length Converter — `/calc/convert/length` | `1 m → 3.28084 ft` | Negative length and overflow are accepted/displayable. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Weight Converter — `/calc/convert/weight` | `1 kg → 2.20462 lb` | Negative mass and overflow are accepted/displayable. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Temperature Converter — `/calc/convert/temperature` | `32°F → 0°C` | Values below absolute zero are accepted; Kelvin can be negative. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 12 / 14 / 8 = 59/75` |
| Volume Converter — `/calc/convert/volume` | `1 L → 0.264172 US gal` | Negative physical volume and overflow accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Area Converter — `/calc/convert/area` | `1 m² → 10.7639 ft²` | Negative physical area and overflow accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Speed Converter — `/calc/convert/speed` | `60 mph → 96.5606 km/h` | Negative physical speed accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Time Converter — `/calc/convert/time` | `1 hour → 60 minutes` | Month is labeled average (30.4375 d); year uses 365.25 d. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 11 / 14 / 9 = 64/75` |
| Data Size Converter — `/calc/convert/data` | `1024 MB → 1 GB` | Uses binary 1024 factors while labeling units MB/GB rather than MiB/GiB; this conflicts with SI meanings even though site copy discloses the choice. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 12 / 15 / 7 = 59/75` |
| Pressure Converter — `/calc/convert/pressure` | `1 psi → 0.0689476 bar` | Negative gauge/absolute context is not distinguished. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 12 / 14 / 9 = 64/75` |
| Energy Converter — `/calc/convert/energy` | `1 kcal → 4.184 kJ` | kcal is correctly treated as food kilocalorie; no nutritional advice. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 12 / 14 / 9 = 65/75` |
| Frequency Converter — `/calc/convert/frequency` | `1000 MHz → 1 GHz` | Negative frequency accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 11 / 14 / 9 = 63/75` |
| Fuel Economy Converter — `/calc/convert/fuel-economy` | `30 mpg (US) → 7.8405 L/100 km` | Inverse conversions map zero to zero rather than undefined/infinite; UK/US gallon choice otherwise explicit. | `PARTIAL`; ✓ | `FIX`; P2 | `24 / ? / 14 / 14 / 7 = 59/75` |
| Angle Converter — `/calc/convert/angle` | `180° → 3.14159 rad` | Negative angles are mathematically valid; huge-value precision is limited by IEEE-754. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 11 / 14 / 9 = 64/75` |
| Power Converter — `/calc/convert/power` | `1 hp → 0.7457 kW` | Horsepower convention should remain labeled; implementation uses mechanical hp. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 12 / 14 / 9 = 64/75` |
| Force Converter — `/calc/convert/force` | `1 N → 0.224809 lbf` | Negative force is valid as direction but direction/sign context is unstated. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 11 / 14 / 9 = 64/75` |
| Cooking Converter — `/calc/convert/cooking` | `1 US cup → 236.588 mL` | Cup/tablespoon conventions are U.S. customary; density-based weight conversion is correctly excluded. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 13 / 14 / 9 = 65/75` |
| CM to Inches Converter — `/calc/convert/cm-to-inches` | `10 cm → 3.93701 in` | Exact factor derives from 1 in = 2.54 cm; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| KG to Pounds Converter — `/calc/convert/kg-to-lbs` | `10 kg → 22.0462 lb` | Normal factor passes; negative mass accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Miles to Kilometers Converter — `/calc/convert/miles-to-km` | `10 mi → 16.09344 km` | Defined factor passes; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Fahrenheit to Celsius Converter — `/calc/convert/fahrenheit-to-celsius` | `32°F → 0°C` | Below-absolute-zero inputs are accepted. | `PARTIAL`; ✓ | `FIX`; P2 | `25 / ? / 8 / 13 / 8 = 54/75` |
| Feet to Meters Converter — `/calc/convert/feet-to-meters` | `10 ft → 3.048 m` | Defined factor passes; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Ounces to Grams Converter — `/calc/convert/oz-to-grams` | `10 oz → 283.495 g` | Avoirdupois ounce is explicit in context; negative mass accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Liters to Gallons Converter — `/calc/convert/liters-to-gallons` | `10 L → 2.64172 US gal` | U.S. gallon is stated; negative volume accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Inches to Feet Converter — `/calc/convert/inches-to-feet` | `12 in → 1 ft` | Defined ratio passes; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `30 / ? / 6 / 13 / 9 = 58/75` |
| Meters to Feet Converter — `/calc/convert/meters-to-feet` | `10 m → 32.8084 ft` | Defined factor passes; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `29 / ? / 7 / 13 / 9 = 58/75` |
| Cups to Milliliters Converter — `/calc/convert/cups-to-ml` | `1 US cup → 236.588 mL` | US cup is stated; metric/Australian and imperial cups are different. | `PASS`; ✓ | `KEEP`;  | `30 / ? / 8 / 13 / 9 = 60/75` |
| Pounds to KG Converter — `/calc/convert/lbs-to-kg` | `10 lb → 4.53592 kg` | Normal factor passes; copy mentions medical dosing, where this generic converter should not substitute for clinical verification. | `PARTIAL`; ✓ | `KEEP`; P2 | `28 / ? / 7 / 12 / 9 = 56/75` |
| Millimeters to Inches Converter — `/calc/convert/mm-to-inches` | `25.4 mm → 1 in` | Exact definition passes; negative length accepted. | `PASS`; ✓ | `KEEP`; P3 | `30 / ? / 7 / 13 / 9 = 59/75` |
| Acres to Square Feet Converter — `/calc/convert/acres-to-sq-ft` | `1 acre → 43,560 ft²` | Config precision can show a tiny approximation around the exact target; use the exact 43,560 factor. | `PARTIAL`; ✓ | `FIX`; P3 | `28 / ? / 8 / 13 / 8 = 57/75` |
| Mbps to Gbps Converter — `/calc/convert/mbps-to-gbps` | `1000 Mbit/s → 1 Gbit/s` | Ratio is correct, but input/select symbols are `Mbit`/`Gbit` and omit `/s`, weakening the route's rate semantics. | `PARTIAL`; ✓ | `FIX`; P2 | `27 / ? / 8 / 14 / 8 = 57/75` |

## Input, output, mobile, accessibility, privacy, and dependency observations

### Inputs and state transitions

- Normal and decimal inputs generally work because the components use `parseFloat`; count-like fields sometimes use `parseInt`, causing silent truncation (Tip split is the clearest example).
- Empty/zero states generally use `CalculatorEmptyState` and avoid `NaN` output.
- Browser `min`, `max`, and `required` attributes are frequently the only range guard. Directly typed values can remain out of domain because calculations do not consistently clamp or reject them.
- Negative financial/physical values are inconsistently handled. Some tools clamp, some return an empty state, and many calculate a formally finite but nonsensical result.
- Huge finite inputs can overflow formulas or formatted output; no shared `Number.isFinite` policy was found.
- Copy exists on Percentage Calculator and the standalone Unit Converter. Reset exists on generic/pair converters. Other calculators do not advertise copy/reset; absence was treated as not applicable, not a broken control.

### Responsive/mobile

Most calculator layouts use responsive `sm:`/`lg:` grids and flexible wrapping. That is promising source evidence, not proof. Mobile remains `UNVERIFIED` for every row until the shared viewport audit runs interactive checks for clipped tables, keyboard overlap, horizontal scrolling, and sticky controls.

### Accessibility

Associated labels cover most primary inputs, and the browser fixtures intentionally use accessible-label locators. Remaining concerns include repeated controls without item-specific names, mode buttons without consistent `aria-pressed`, input groups where only the first control owns the visible label, table controls with header-only labels, and result changes without confirmed live-region behavior. These are `PARTIAL`, not WCAG conformance claims.

### Privacy and dependencies

All reviewed calculations execute inside React client components. No calculator sends entered salary, health, pregnancy, debt, or betting inputs to an external service. The highest maintenance risk is embedded reference data rather than network uptime: annual tax tables, state presets, clinical equations/categories, activity METs, and fixed rule-of-thumb assumptions need owners, source links, and review dates.

## Sensitive-tool review requirements

The following tools must not be described as personalized professional advice and need a named, qualified reviewer before flagship treatment:

| Domain | Tools | Assumptions / scope to publish | Staleness control |
|---|---|---|---|
| Tax/payroll | Take-Home Pay, Paycheck, Sales Tax | U.S. only; tax year; filing-status coverage; federal vs state/local; credits/dependents/W-4 exclusions | Version tables by tax year, link IRS/SSA sources, add automated threshold fixtures, assign annual owner |
| Lending/personal finance | Mortgage, Loan, Auto Loan, Credit Card Payoff, Savings Goal, Retirement, Investment Return, DTI, Down Payment, Amortization | Estimate only; timing convention; fees/taxes/insurance/PMI; underwriting variability; market/sequence risk | Source assumptions beside results; review at least annually and when law/rate conventions change |
| Health/nutrition | BMI, Calorie, Macro, Body Fat, Ideal Weight, Calories Burned | Adult/population limits; screening vs diagnosis; equation provenance; contraindications; measurement protocol | Qualified clinical/nutrition review, source/version labels, conservative bounds and escalation language |
| Reproductive health | Due Date, Ovulation | Cycle regularity; gestational convention; IVF method; prediction uncertainty; not contraception | Qualified obstetric review; explicit non-contraception warning; date/timezone regression tests |
| Sleep | Sleep Calculator | 90-minute cycle is an approximation; age and sleep-need variation; not treatment | Qualified sleep review; avoid “optimal”/“recommended” certainty |
| Gambling | Odds, Poker | Probability assumptions; no guaranteed returns; jurisdiction/age/responsible gambling | Source/model label, simulation version/seed, responsible-gambling language |

## Recommended remediation order

1. Correct or temporarily de-emphasize the eight P1 tools. Add exact regression tests before changing implementation.
2. Centralize tax-year data and share one payroll engine between Take-Home Pay and Paycheck. Surface tax year in the UI and fail closed when data is stale.
3. Replace Poker's heuristic table with a versioned precomputed simulation/exhaustive dataset, or remove the percentages and keep categorical hand guidance.
4. Replace ad hoc calendar borrowing with an explicitly documented calendar-difference algorithm and date-only/UTC-day arithmetic.
5. Add a shared calculator input policy: finite checks, explicit domain validation, consistent empty/error states, and rounding carry.
6. Correct finance labels/assumptions: Mortgage “Total principal + interest,” payoff-cap detection, tax/geography qualifiers, PMI handling, fees, and negative-equity scope.
7. Complete qualified review for sensitive health/reproductive/sleep tools, then add source links and “last reviewed” metadata.
8. Resolve converter semantics: absolute-zero guards, fuel inverse zero, SI-vs-IEC data labels, exact acre factor, and `/s` labels on network speed.
9. Consolidate Car Payment into Auto Loan after preserving any distinct query intent through route/content strategy.

## Explicitly unverified gaps

- No GSC, analytics, conversion, or revenue data was available; all demand remains `UNKNOWN`.
- Mobile interaction, assistive-technology output announcements, full keyboard operation, dark mode, localization, and reduced-motion behavior were not exhaustively run per route.
- Browser smoke fixtures often assert a regex rather than an exact number. They prove the route responds, not that every result is correct.
- State/local tax rules, clinical recommendations, MET tables, reproductive-health advice, “ideal weight” framing, sleep claims, and gambling disclosures have not been signed off by a qualified professional.
- No exhaustive pairwise/unit-space test was run for every conversion direction; exact anchors plus source-factor inspection cover representative paths.
- Date tests were independently evaluated for `America/Los_Angeles`; all world time zones and historical calendar anomalies were not enumerated.

## Authoritative references

- [IRS: tax inflation adjustments for tax year 2026](https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill) — 2026 standard deductions and federal brackets.
- [IRS Publication 15 (2026)](https://www.irs.gov/publications/p15) — Social Security and Medicare withholding rates and the 2026 wage base.
- [SSA contribution and benefit base](https://www.ssa.gov/OACT/cola/cbb.html) — confirms the 2026 Social Security wage base of `$184,500`.
- [IRS Topic 751](https://www.irs.gov/taxtopics/tc751) — Additional Medicare Tax withholding threshold and rate.
- [U.S. Navy body-composition guide (2025)](https://www.mynavyhr.navy.mil/Portals/55/Support/Culture%20Resilience/Physical/Guide-4%20Body%20Composition%20Assessment%20FEB25.pdf?ver=ToWreGbK4Bpkgmwcd8zRtA%3D%3D) — official circumference measurement protocol in inches.

## Repository evidence

- Registry: `lib/tools.ts`
- Browser fixtures and runner: `tests/e2e/tool-audit/fixtures.ts`, `tests/e2e/tool-audit/functional-smoke.spec.ts`, `tests/e2e/tool-audit/unit-converter-smoke.spec.ts`
- Shared conversions: `lib/conversions.ts`, `components/tools/UnitConverter.tsx`, `components/tools/UnitConverterPage.tsx`
- P1 source locations: `components/tools/TakeHomePayCalculator.tsx:19-67,145-164`; `components/tools/PaycheckCalculator.tsx:20-68,144-170`; `components/tools/BodyFatCalculator.tsx:71-119`; `components/tools/AgeCalculator.tsx:123-154`; `components/tools/DateDifference.tsx:72-107`; `components/tools/PokerCalculator.tsx:130-149`; `components/tools/AmortizationCalculator.tsx:33-103`; `components/tools/PaceCalculator.tsx:18-30`.
