# AGENTS.md

Argus Eye: Node.js (ESM) pipeline that crawls football news sites, digests them with Gemini, and posts Cantonese reports to a Telegram channel. Entry: `index.mjs`.

## Current state (do not miss)

- `npm start` is **broken right now**: `src/digestingAgent.mjs` has unmerged conflict markers (lines 25–265, `<<<<<<< Updated upstream` … `>>>>>>> Stashed changes`) → SyntaxError. `src/prompt.mjs` is also unmerged; `git stash` holds the `WIP on uat` alternative. Resolve the merge before touching digesting logic.
- `git status` is mid-merge: `src/constants.mjs` and `src/util/LlmClient.mjs` show "deleted by us" but exist on disk (re-added by one side). Verify what's actually staged before committing.

## Commands

- `npm start` / `node index.mjs` — full run (currently SyntaxErrors until the merge is resolved)
- No test framework. `npm test` is a stub that exits 1. Manual scripts: `node tests/digest.mjs` (needs `GEMINI_API_KEY` + an existing `debug/<YYYY-MM-DD>/cleanedFeeds.json`, which you get from a `NODE_ENV=UAT` run first).
- `node tests/playwright.mjs` is currently broken — it imports `src/webCrawlingFunction.mjs`, which no longer exists. `npm run kyc` references `kyc.mjs`, which is also missing.
- Local runs need a Playwright Chromium: `npx playwright install chromium`. CI runs in the `mcr.microsoft.com/playwright` container with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, so it won't catch missing-browser problems.
- CI: `.github/workflows/argus-eye.yml` — schedule is commented out; triggered by `workflow_dispatch` or `repository_dispatch: ios-trigger`. Secrets come from GitHub vars/secrets, not `.env`.

## Env & NODE_ENV

- `.env` (gitignored, template `.env.example`) via dotenv. Required: `GEMINI_API_KEY`, `RESEARCH_TOPIC`, `RESEARCH_URLS` (comma-separated, split + trimmed), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- `RESEARCH_URLS` are dispatched per URL in `src/webCrawlingAgent.mjs:149 getType()`. **Match order matters**: `marca.com/rss` must be checked before `marca.com`.
- `NODE_ENV=PROD`: Gemini digesting + StatusTracker (Supabase) + PerformanceLogger (Google Sheets) + Telegram sends, headless browser. Any other value: crawling only, **headed** browser, no sends/persistence.
- PerformanceLogger and StatusTracker are constructed and `init()`ed regardless of NODE_ENV (`webCrawlingAgent.mjs:42-52`), so `GOOGLE_SPREAD_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` are required even for a local UAT run.
- X crawling needs `X_AUTH_TOKEN`, injected as an `auth_token` cookie (`src/contextInjector.mjs`).

## Architecture

- `index.mjs` flow: crawl → clean feeds with temp ids `feed_<i>` → `DigestingAgent.digest()` → back-fill `source_url`/`media_urls` from `related_feed_ids` → `Telegram.sendTransferReport`.
- Contract: `digest()` must return a JSON **string** parseable as `{ transfers }`; each entry carries `related_feed_ids`. `index.mjs:72` does `JSON.parse(rawDigestingResults)`.
- `DigestingAgent` has two competing implementations in the conflict: the one-shot `ai.models.generateContent` path (what index.mjs expects) and the staged `LlmClient` (raw axios → Gemini REST, retry/backoff) + `DisgestingStages` pipeline. Pick one; keep the string-return contract.
- Crawlers in `src/crawler/`, all extend `BaseCrawler`; feeds are `{ time, title, desc, source_url, media_urls }`.
- `OutputChecker` snapshots each stage to `debug/<YYYY-MM-DD>/<step>.json` (new dir per day). CI uploads `debug/` as an artifact. `tests/digest.mjs` feeds off `debug/2026-06-23/cleanedFeeds.json` as fixture data.
- `StatusTracker` "fuses" a source after 3 consecutive failures for 7 days (Supabase `scraper_status` table).

## Style / language

- ESM `.mjs`, `import` with explicit `export class`. Semicolons are inconsistent across files — match the file you're editing.
- Prompts, comments, and Telegram copy are Hong Kong Cantonese / Traditional Chinese. Keep them that way; don't translate or "clean up".