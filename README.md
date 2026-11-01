# Vishnu Priyan — motion portfolio

A cinematic portfolio for an independent SaaS motion designer, built with React, TypeScript, Vite and GSAP. Includes a scroll-driven studio opening, layered approach chapters, services, selected films and an email-draft enquiry flow.

## Development

```sh
npm ci
npm run dev
```

## Production verification

```sh
npm run build
npm test
```

The static website is emitted into `dist/client/`. The build also preserves the optional Sites packaging in `dist/server/` and `dist/.openai/`.

## Vercel deployment

Connect this repository to a Vercel project using the Vite framework preset. `vercel.json` sets the install command, runs the production build and tests, and selects `dist/client` as the output. No environment variables or backend service are required. Production builds use the `main` branch; other branches can receive preview deployments through Vercel's Git integration.

## Accessibility and media

System reduced-motion preferences are respected. A static reading layout is also available at `/?motion=reduce`, and the site menu offers a motion toggle. The opening uses supplied media with native seek-based scroll choreography; actual work films retain their original colors and use native player controls.

Enquiries prepare a draft in the visitor's email app. Nothing is submitted to a server or sent automatically. The personal showcase is a silent preview.

Runtime artwork and provenance are in `public/assets/redesign-v1/manifest.json`. Instrument Serif is self-hosted with its license in `public/assets/fonts/`; Manrope is bundled through its font package. Selected studio imagery still uses its original warm/red grade while the interface uses sky blue, white and hot pink.
