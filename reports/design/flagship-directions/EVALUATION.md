# Flagship direction evaluation

## Scope

These are isolated, self-contained HTML prototypes only. They retain the current clevr.tools file-tool contract: direct browser-local Image Compressor flow; JPG, PNG, and WebP input; 50 MB maximum; quality and output-format controls; before/after inspection; and an actual-result-only readout. They do not create accounts, storage, dashboards, advertisements, made-up metrics, testimonials, or capabilities.

- [Industrial Precision](industrial-precision.html) — operational ledger and inspection-bench direction.
- [Editorial Utility](editorial-utility.html) — calm, publication-like direction that makes each file task feel understandable.
- [Playful Instrument](playful-instrument.html) — personable tool-cabinet direction with more expressive wayfinding.

Each prototype contains hash-addressable views for Home, Files, Image Compressor empty state, settings state, and result state. The same file responds at desktop and mobile widths and has a working light/dark theme switch, responsive mobile navigation, working state controls, range-value feedback, and keyboard-visible focus styles.

## Scorecard

Scores are out of 10. For generic/vibe-coded risk, lower is better.

| Direction | Trust | Clarity | Distinctiveness | Mobile | Accessibility | Memorability | 100+ tool extensibility | Performance | Generic/vibe-coded risk |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Industrial Precision | 9.4 | 9.6 | 8.6 | 9.2 | 9.2 | 8.4 | 9.8 | 9.7 | 1.5 |
| Editorial Utility | 9.2 | 8.8 | 9.3 | 8.9 | 9.0 | 9.4 | 8.8 | 9.8 | 1.3 |
| Playful Instrument | 8.5 | 8.9 | 9.5 | 8.9 | 8.8 | 9.6 | 9.1 | 9.6 | 2.4 |

### Rationale

**Industrial Precision** is the strongest search-arrival experience. It makes the next action obvious, treats privacy as a specific feature contract rather than empty brand copy, and gives a 100+ tool catalogue a reusable, scannable ledger pattern. Its deliberate rules, square edges, and one strong emerald signal make it feel trustworthy without becoming sterile.

**Editorial Utility** has the richest calm and the most premium long-form voice. It makes files feel less intimidating, and its ruled lists scale well. The tradeoff is that urgent visitors may take a beat longer to parse its typographic hierarchy, especially on a small screen.

**Playful Instrument** is the most memorable and emotionally warm. Its cabinet/drawer language gives the tool family a genuine personality without creating a dashboard. The tradeoff is moderation: repeated use of the playful language would need a firm design-system cadence so a serious document task never feels toy-like.

## Recommendation

Select **Industrial Precision** as the flagship direction.

It best serves a nontechnical visitor who lands from search with one urgent file task: the first action is immediate, the privacy cue is concrete and scoped to the local image workflow, and the same page grammar can support a large, mixed tool catalogue without visual fatigue. If implemented later, borrow Editorial Utility’s prose restraint and guide-list treatment for informational sections—not its primary interaction hierarchy.

## Validation completed

Playwright rendered each static HTML file directly and checked all five views at:

- Desktop: 1440 × 900/1040.
- Mobile: 390 × 844.

For every direction, the checks passed:

- Every Home, Files, empty, settings, and results hash view activated correctly.
- No horizontal overflow at either viewport.
- Every navigation hash link resolved to a valid prototype view; skip links target their main-content anchors.
- The quality control updates from 80% to 95%.
- Light/dark toggle enters dark mode while preserving the active result view.
- Rendered copy has no universal “nothing is sent/leaves” claim; browser-local wording is scoped to the featured Image Compressor.
- Rendered PDF Compressor copy is neutral: “Rewrite a PDF locally; file size can vary by source.”
- No runtime page or console errors were observed during the final QA pass.

30 representative screenshots were rendered under `/tmp/clevr-p2-readiness/design-renders`: desktop and mobile Home, Files, Image Compressor empty, settings, and dark results for all three directions. The four Editorial/Playful dark result captures were regenerated after fixing a theme-selector issue and were visually inspected; their sizes range from 139 KB to 224 KB with 5,002–7,006 colors, rather than blank one-color output.

## Selection decision

On 2026-08-02, the user authorized the team to do what was necessary to reach the stated North Star. **Industrial Precision** was selected as the production direction, with **Editorial Utility's prose restraint** applied to explanatory copy.

The implementation preserves the existing product contract and functionality while replacing the generic rounded-card shell with a warm, ruled, square-edged inspection-bench grammar. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for scope, evidence, and the remaining production-promotion gate.
