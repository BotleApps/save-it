## Observability / Crash Reporting

- **Sentry**: planned via `@sentry/expo`. Added `lib/sentry.ts` initializer and local shim to avoid runtime/tsc break when package or DSN missing.

### Sentry installation & CI validation

- **Local install**: run:

```bash
npm install @sentry/expo --save
```

- **CI (recommended)**: create a GitHub Actions secret `NPM_TOKEN` (scoped to your publish account) and set `SENTRY_DSN` in EAS/GitHub/Vercel environments.

- **Validate**: a workflow `.github/workflows/sentry-validate.yml` was added that:
  - checks out the repo
  - sets up Node
  - writes `//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}` into `~/.npmrc`
  - runs `npm ci` and `npx tsc --noEmit` and then executes the compiled `scripts/sentry-smoke.ts` script

- **Notes**:
  - If `npm install` fails locally with `404` or `need auth`, authenticate with `npm login` or set an npm token in your environment.
  - The repository includes a local shim at `lib/sentry-shim.ts` to avoid crashes when the package or DSN is unavailable.

### CI / Builder reliability

- **Problem**: Cloud builders sometimes pick up `bun` or alternative installers which can cause unexpected behavior and failed installs.
- **Findings**: workflows call `npm ci --legacy-peer-deps` and `npm install` in multiple places. `.npmrc` exists in project root with `legacy-peer-deps=true`, `use-lockfile=true`, and `engine-strict=false` to mitigate some issues.
- **Recommendations**:
  - Explicitly set `registry` and write a workflow step to create `~/.npmrc` with `//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}` before running `npm ci`.
  - Avoid running global `npm install -g` commands unless necessary; prefer local installs.
  - If bun detection continues, add a step to run `npm config get registry` and `node -v` for debugging in CI logs.
  - Consider pinning Node/NPM versions in workflows using `actions/setup-node` with `node-version` and `cache: 'npm'` already present.

### Action Items (CI)

- Add `NPM_TOKEN` secret to repository and EAS environments.
- Trigger `sentry-validate` workflow to verify installation in CI.
- Run an EAS preview build to confirm `.npmrc` mitigations prevent bun/alternate installers from being used.
# Save It — Project Audit Report

Date: 2026-01-03

Author: Automated audit (assistant)

---

## Scope
This document summarizes the current repository status, missing items for production readiness, prioritized remediation plan, and concrete, actionable steps (commands and files to change) to get the app to a productive, deployable state.

## Summary of findings
- Project is an Expo app (SDK 53), supports Web (PWA), iOS and Android.
- Basic workflows exist: GitHub Actions for web deploys and mobile builds via EAS.
- PWA service worker and web transform scripts present.
- WebView-based content extraction implemented in `app/link/[id].tsx` (requires device testing and robustness improvements).
- TypeScript issues were present and mitigated with `types/service-worker.d.ts` and `types/jest-shim.d.ts` to help local type-checking.

## High-priority missing items
1. Backend sync (user accounts, multi-device sync, backup).
2. Crash reporting / error monitoring (Sentry or similar) across platforms.
3. Analytics / usage telemetry (Amplitude/Segment/GA4).
4. CI robustness: ensure cloud EAS uses `npm` and reproducible installs; confirm no bun usage.
5. Data export/import and backup features.
6. App store signing automation and submission pipelines.

## Medium-priority items
- E2E tests for main user flows.
- Telemetry consent & privacy policy text + in-app consent flow.
- Performance profiling and storage management (pruning large content, image caching strategy).

## Low priority / future
- Browser extension, paid features, localization.

## Recommended remediation plan (prioritized)

### Phase 1 — Stability & observability (1 week)
- Add Sentry for crash reporting (web + native using `@sentry/expo`).
- Add analytics (Amplitude or Segment) with an initial event schema.
- Add privacy policy and opt-in consent screen for analytics.

### Phase 2 — Release pipeline & CI (1 week)
- Harden GitHub Actions: ensure `npm ci --legacy-peer-deps` runs and caches; add retry logic for EAS builds.
- Run EAS preview build and validate artifacts. Fix bun issues if they reappear (ensure `.npmrc` is committed and respected by EAS builder).
- Add automated code signing (EAS credentials / fastlane) and `eas submit` flows.

### Phase 3 — Sync & Backups (2+ weeks)
- Decide on backend approach (Firebase vs custom server). Implement minimal API to persist user links per account and a migration plan.
- Implement export/import feature for JSON backup.

### Phase 4 — Testing & quality
- Add E2E tests (Detox for mobile, Playwright for web).
- Add performance tests and memory profiling reports.

## Actionable tasks with commands
- Sentry install & init (example):
  ```bash
  npm install @sentry/expo
  # Add SENTRY_DSN to GitHub/EAS secrets
  ```
  Edit main app entry (e.g., `app/_layout.tsx` or `app/index.tsx`) and add:
  ```js
  import * as Sentry from '@sentry/expo';
  Sentry.init({ dsn: process.env.SENTRY_DSN, enableInExpoDevelopment: false });
  ```

- Trigger an EAS preview build to validate cloud builder:
  ```bash
  eas build --platform android --profile preview --non-interactive
  ```

- Add JSON export UI: implement `stores/export.ts` that serializes the Zustand store and a UI `Settings -> Export Data` that saves a `.json` file.

## Owners & Notes
- Observability and CI: Owner = Devops / Engineering Lead.
- Sync Backend & Auth: Owner = Backend Engineer.
- Feature dev (export/import, extraction improvements): Owner = Frontend Engineer.

---

## Audit details (full crawl)
(See full analysis in the repository — includes references to files changed during this audit.)

- `app.json` and `app.config.js` reviewed: expo updates endpoint present; `EXPO_PREBUILD_TOKEN` placeholder used in `eas.json`.
- `public/service-worker.js` contains background sync handling for `sync-links`.
- `app/link/[id].tsx` contains the WebView-based extraction code (needs device testing).
- GitHub Actions workflows: `build-android.yml` and `deploy-production.yml` present.

---

If you approve this audit doc, I will:
- Commit `AUDIT_REPORT.md` and open a PR with the next small change (Sentry integration), then run tests and type-check.
- Continue the repository audit to produce a more detailed developer onboarding doc covering CI secrets and release steps.

Update: I added a lightweight Sentry initializer at `lib/sentry.ts` and wired it into the native app entry (`app/_layout.tsx`). To enable Sentry in builds, set the `SENTRY_DSN` secret in your CI/EAS and Vercel environments. This initialization is gated so it won't run on web or when no DSN is provided.

Please confirm and tell me which remediation task you'd like me to implement first (Sentry, EAS build verification, or a minimal sync prototype).