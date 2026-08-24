# CODE CONSISTENCY AUDIT — 2026-08-24

## Scope

Static audit of `main` at commit `28c6ca393f4422b55c6bfe95aaf0a6d616114714`.

Areas reviewed:

- package/dependency consistency
- TypeScript configuration
- Vite/build pipeline
- Express/serverless boundary
- Vercel routing
- frontend routing
- Neon database bootstrap
- WhatsApp CTA / GA4 implementation requested in the current work order

## Executive verdict

**STATUS: YELLOW — no confirmed P0 production blocker found in the reviewed baseline, but the repository is not yet eligible for a CLEAN/APPROVED consistency status.**

The latest GitHub/Vercel status for the audited commit is successful.

## Findings

### P0

None confirmed from static inspection.

### P1

#### P1-01 — WhatsApp CTA implementation is absent from `main`

The requested CTA implementation was not found in the audited branch. Searches for:

- `WhatsApp`
- `https://wa.me`
- `Hablar con un asesor`
- `gtag`
- `analytics`

returned no implementation evidence.

Required target:

- CTA label: `Hablar con un asesor`
- destination number: `+54 9 2617 50-0100`
- prefilled message: `Hola, escribo desde la web, quiero hablar con un asesor.`
- GA4 event: `whatsapp_advisor_click`

This work must be implemented and then re-audited; it must not be assumed complete from the order alone.

#### P1-02 — Dual API entrypoints require explicit ownership documentation

The repository contains both:

- `api/[...path].ts`
- `api/index.ts`

`vercel.json` explicitly routes `/api/(.*)` to `api/[...path].ts`, making the catch-all the effective API entrypoint for routed API traffic. `api/index.ts` remains as a parallel entrypoint and should either be documented as intentionally retained for compatibility or removed in a dedicated cleanup change after confirming no external invocation depends on it.

No deletion is performed by this audit.

#### P1-03 — Neon connection normalization has infrastructure coupling

`api/[...path].ts` normalizes a Neon connection hostname to the `-pooler` endpoint before loading the bundled server. The application bootstrap then initializes the database through `createApp()` / `initDatabase()`.

The behavior is currently coherent, but the responsibility for connection normalization should remain centralized and documented to avoid divergence between local and Vercel runtimes.

### P2

#### P2-01 — `lint` script is a typecheck, not a linter

`package.json` defines:

`lint = tsc --noEmit`

This is useful and strict, but the script name is semantically misleading because no ESLint/static-style linter is configured. Rename only if the project adopts a real linting step; otherwise document the intentional convention.

#### P2-02 — Two package managers are present

The repository contains both `package-lock.json` and `bun.lock`. The current production synchronization work was performed against npm's lockfile. This creates a potential source of dependency drift if Bun is also treated as an supported installation path.

Recommendation: declare one canonical package manager for CI/deployment and keep the secondary lockfile only if Bun support is intentional and continuously synchronized.

## Positive checks

- TypeScript is configured with `strict: true`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- `package.json` and `package-lock.json` contain the Neon serverless dependency/alias introduced by the latest synchronization commit.
- Vercel routes API traffic before the SPA fallback and includes `dist/server.cjs` in the serverless function bundle.
- `server.ts` avoids starting a local HTTP listener when `VERCEL` is present.
- Public and dashboard routes are explicitly declared in `src/App.tsx`.

## Validation limitation

A local `npm ci` / build execution could not be run from the audit environment because outbound DNS/network access to GitHub was unavailable. Therefore this audit does **not** claim a fresh local build/typecheck result.

The audited commit does have a successful Vercel status in GitHub.

## Required next sequence

1. Implement the WhatsApp CTA + GA4 event.
2. Run CI/Vercel build and typecheck.
3. Validate the WhatsApp URL and event wiring.
4. Decide ownership of `api/index.ts`.
5. Declare the canonical package manager.
6. Re-run the complete consistency audit.
7. Only then mark the repository `CODEBASE CLEAN / APPROVED`.
