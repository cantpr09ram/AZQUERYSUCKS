# AGENTS
This guide is for agentic coding assistants working in this repo.
It captures how to build, test, lint, and the coding style used here.

## Quick Context
- App: TanStack Start + Vite + React 19
- Language: TypeScript (strict)
- Styling: Tailwind CSS
- Tooling: Biome (lint/format), Vitest (tests)
- Package manager: pnpm
- Path alias: `@/*` -> `src/*`

## Build / Lint / Test Commands
Use pnpm unless a script explicitly says otherwise.

### Install
```bash
pnpm install
```
### Dev Server
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
```

### Preview Build
```bash
pnpm start
```

### Lint
```bash
pnpm lint
```

### Format
```bash
pnpm format
```

### Run All Tests (CI style)
```bash
pnpm test
```

### Watch Tests
```bash
pnpm test:watch
```

### Coverage
```bash
pnpm test:coverage
```

### Run a Single Test File
Vitest supports passing a file path after `--`.

```bash
pnpm test -- src/utils/__tests__/parse-times.test.ts
```

### Run a Single Test by Name
```bash
pnpm test -- -t "parses single range"
```

### Run a Single Test File in Watch Mode
```bash
pnpm test:watch -- src/utils/__tests__/course-filters.test.ts
```

## Environment Variables
- `VITE_COURSES_URL` (preferred)
- `NEXT_PUBLIC_COURSES_URL` (also supported by Vite env prefix)

If neither is set, the app falls back to the public GitHub JSON URL in
`src/components/course-scheduler-content.tsx`.

## Code Style and Conventions

### Formatting and Linting
- Use Biome for formatting and linting.
- Indentation: 2 spaces (configured in `biome.json`).
- Use double quotes and semicolons (existing files follow this style).
- Imports are organized by Biome (`organizeImports` is on).

### Imports
- Prefer `import type` for type-only imports.
- Order: external packages first, then internal `@/` imports, then relative.
- Use the `@/` alias for `src/*` instead of long relative paths.

### TypeScript
- `strict` mode is enabled; do not introduce `any`.
- Use `interface` for object shapes that may be extended; use `type` for unions
  and utility compositions (see `src/types/course.ts`).
- Favor explicit return types when a function has complex logic or is exported
  from a shared utility.

### React Components
- Function components only; no class components.
- Prefer named exports for shared components (e.g. `export function X`).
- Default exports exist in a few files; preserve existing style per file.
- Use hooks and local helpers defined above the component where appropriate.
- Add `"use client"` in TanStack Start components that rely on client-only APIs.

### State and Data Fetching
- Data fetching uses React Query (`useQuery`).
- Always check `res.ok` and throw a descriptive error on failure.
- Normalize/transform server data in `select` when possible (see
  `src/components/course-scheduler-content.tsx`).

### Error Handling
- Prefer early returns/guards for invalid data.
- Throw `Error` with a clear message for failed network calls.
- Avoid silent failures; if a value is optional, handle the empty case
  explicitly (see `parseTimes`).

### Naming
- Use `camelCase` for variables and functions.
- Use `PascalCase` for components and exported types.
- Use `UPPER_SNAKE_CASE` for constants (e.g. `DAY_OPTIONS`).
- Files with hooks should be `use-*.ts(x)`.

### Tests
- Tests live in `src/**/__tests__` and use Vitest.
- Use `describe` and `it` with clear, behavior-focused names.
- Keep test input/expected values explicit; prefer `toEqual` for arrays/objects.

### Tailwind / UI
- Use `cn` from `src/lib/utils.ts` for conditional class name merging when
  needed.
- Keep long class lists readable; line-wrap JSX props where needed.

## Tooling Notes
- Vite is configured with `envPrefix: ["VITE_", "NEXT_PUBLIC_"]`.
- Vitest runs in Node environment and only includes `src/**/*.test.ts`.
- Coverage targets utilities in `src/utils/**/*.{ts,tsx}` with 80% thresholds.
