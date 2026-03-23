## Design Context

### Users
General consumers, non-technical. They arrive from search with a specific task — convert a PDF, compress an image, merge files. Mindset is urgent and transactional: get in, do the thing, get out. Secondary audience is small business owners and students who return repeatedly and may bookmark. These people have been burned by sketchy free tool sites before — cluttered, ad-riddled, slow. They need to feel safe and oriented within seconds.

### Brand Personality
**Trustworthy, effortless, warm.**

A tool that respects your time and your files, but doesn't take itself too seriously. Quietly confident with a human touch — not cold and techy, not bouncy and childish. The kind of site where someone thinks "oh, this is nice" before they even use a tool.

### Aesthetic Direction
**Warm precision.** Clean and structured, but with color confidence, softer surfaces, and enough personality that it doesn't feel like a template.

- **Color**: Emerald green used boldly, not just as an accent. Warm, confident palette.
- **Depth**: Subtle shadows and layering rather than heavy glassmorphism.
- **Motion**: Micro-interactions that feel responsive and satisfying — confirming actions, not decorating them. Tools should feel alive when you use them, calm when you're not.
- **Tone**: Prioritize warmth over coolness, clarity over cleverness, personality over trend.

**References** (what to learn from):
- TinyPNG / CloudConvert — utility and speed
- Stripe marketing pages — warmth and color confidence
- Raycast — spatial clarity, but softened for a general audience

**Anti-references** (what to avoid):
- iLovePDF — cluttered, ad-heavy, dated
- SaaS dashboards — no accounts, no onboarding flows
- Generic glass/gradient AI-generated UIs that all look the same

### Design Principles

1. **Instant orientation.** Every page answers "what does this do?" and "how do I start?" within seconds. No hunting, no guessing. The primary action is always obvious.

2. **Earned trust.** Privacy-first messaging is structural, not decorative. "Files stay in your browser" isn't a tagline — it's a contract. Visual cleanliness reinforces safety: no clutter, no dark patterns, no surprises.

3. **Warm precision.** Clean layout and tight typography paired with confident color, soft surfaces, and human touches. The interface should feel crafted, not generated. Emerald green is the signature — use it with intention.

4. **Responsive feel.** Micro-interactions confirm actions instantly — file accepted, compression complete, download ready. Motion serves function: it tells users something happened, not that something is pretty. Respect `prefers-reduced-motion`.

5. **Universal access.** WCAG AA minimum. Performance is accessibility — optimize for older hardware and slower connections. Every tool works for everyone, on every device.

### Technical Design Tokens (current)
- **Font**: Inter (variable), tight heading tracking (`-0.02em` to `-0.04em`), `0.875rem` body
- **Primary**: `#10b981` (emerald) — light mode; `#6ee7b7` — dark mode
- **Surfaces**: Material Design 3-inspired container hierarchy (lowest → highest)
- **Radius**: `1rem` base, generous rounding throughout (`1.35rem` nav, `1.75rem` cards, `2rem` hero)
- **Shadows**: Custom ambient shadows (`--ambient-shadow`, `--shadow-sm`) over default box-shadows
- **Dark mode**: Deep navy (`#060e20`) base, not pure black
- **Icons**: Lucide React, 16–24px range
- **UI components**: shadcn/ui (zinc base, Tailwind v4 compatible)
