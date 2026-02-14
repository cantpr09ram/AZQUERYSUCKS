# AZQUERYSUCKS

Course scheduling helper app for Tamkang University course data.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment

- `VITE_COURSES_URL` (preferred)

If neither is set, the app uses the public GitHub JSON fallback in `src/components/course-scheduler-content.tsx`.

## Scripts

- `pnpm dev` - Run TanStack Start in development mode
- `pnpm build` - Build production assets
- `pnpm start` - Preview the production build
- `pnpm test` - Run unit tests
- `pnpm lint` - Run Biome checks
- `pnpm test:e2e` - Run Playwright end-to-end tests

## Static Assets

- `public/manifest.webmanifest`
- `public/robots.txt`
- `public/og.svg`
- `public/favicon.ico`

## Deployment (GitHub Pages)

Deployment is handled directly by GitHub Actions on pushes to `main`, publishing
`dist` to GitHub Pages at `https://cantpr09ram.github.io/AZQUERYSUCKS/`.
