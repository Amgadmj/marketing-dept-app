# Marketing Dept

An AI marketing department for small businesses, built brand-first: instead of generating generic copy from a prompt, it builds a structured, evidence-backed **brand brain** for each client and only ever writes from what that brain can actually prove.

## The idea

Most AI content tools skip straight to generation. Marketing Dept inserts a knowledge layer in between, encoded as data rather than prose, so the model can't quietly make things up:

- **Evidence grading** — every claim about an audience carries a confidence level (`high` / `medium` / `low`) and a source. Generation refuses to lean on `low`-confidence claims.
- **Zero-new-belief offers** — every offer names the belief a buyer must already hold for it to be purchasable, and links to evidence the audience actually holds it. No evidence, no offer.
- **Never invent numbers** — every figure is either `confirmed` with a source or flagged as unusable. Unconfirmed numbers never make it into customer-facing output.

That brain is reusable: once built, it drives on-brand copy and video generation for a client without re-deriving voice, audience, and offers every time.

## Product flow

1. **Welcome** — the pitch, told as a scroll-driven transformation from an inferred, low-confidence draft into a confirmed, evidence-backed brand brain.
2. **Intake** — onboard a new tenant (business) and start building their brain.
3. **Brain** (`/brain/[tenant]`) — the structured profile: voice and brand rules, layered audiences (never blended together in one piece of content), offers scored against the zero-new-belief test, and a sales engine (angles, funnel, posting rhythm).
4. **Compose** / **Video** (`/compose/[tenant]`, `/video/[tenant]`) — generate on-brand content and video from a tenant's brain.
5. **Campaigns** — where composed and video content lives once created.
6. **Settings** — workspace configuration.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- GSAP + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering/) for the scroll-driven welcome page
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Project structure

```
app/
  welcome/            marketing landing / pitch page
  (app)/
    page.tsx          dashboard
    intake/           new tenant onboarding
    brain/[tenant]/   brand brain viewer/editor
    compose/[tenant]/ content composition
    video/[tenant]/   video generation
    campaigns/        campaign/content library
    settings/         workspace settings
lib/
  types.ts            the brain schema — evidence, audience layers, offers, sales engine
  compose.ts           content composition logic
  video.ts             video generation logic
  tenants.ts            tenant/workspace data
```
