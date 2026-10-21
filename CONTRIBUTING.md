# Contributing to SorobanLard Frontend

Thanks for helping build SorobanLard. This guide covers local setup, the conventions we use for
branches, commits and pull requests, and what we expect before a PR is reviewed.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/<your-username>/SLFrontend.git
cd SLFrontend
cp .env.example .env.local   # fill in contract ID + backend URL
npm install
npm run dev                  # http://localhost:3001
```

Install [Freighter](https://freighter.app) and switch it to Testnet to use wallet login.

Keep your fork in sync with upstream before starting new work:

```bash
git remote add upstream https://github.com/SorobanLard/SLFrontend.git
git fetch upstream
git checkout -b fix/<short-topic>-<issue-number> upstream/main
```

## Picking up an issue

1. Comment on the issue and wait to be assigned before you start.
2. Keep one PR focused on one issue, or a small group of closely related issues.

## Branch naming

`<type>/<short-topic>-<issue-number>`, for example `fix/middleware-public-paths-140` or
`docs/contributing-145`. Use the same types as commits (below).

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <lowercase summary>
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`. Keep the summary under 72
characters and reference issues in the body (`Closes #140`).

## Linting and formatting

```bash
npm run lint      # ESLint (next lint, includes jsx-a11y rules)
npm run format    # Prettier with the Tailwind class-sorting plugin, writes src/**/*.{ts,tsx,css}
```

Run both before pushing. Do not mix large formatting-only changes into a feature PR; if a file
needs reformatting, do it in a separate `style:` commit.

## Tests

| Command | What it runs |
|---|---|
| `npm run test` | Vitest unit and component tests (jsdom) |
| `npx vitest run path/to/file.test.tsx` | A single test file |
| `npm run test:e2e` | Playwright end-to-end tests (Chromium, Firefox, WebKit) |
| `npx playwright test --project=visual` | Visual regression tests only |

Expectations:

- Bug fixes come with a regression test that fails without the fix.
- New components and hooks come with tests next to them (`Component.test.tsx` or `__tests__/`).
- Prefer queries by role and label (`getByRole`, `getByLabelText`) over class names.
- If you change the UI on purpose, update the visual baselines with
  `npx playwright test --update-snapshots` on Linux and commit the new files in `e2e/screenshots/`.
- New color tokens need a contrast assertion in `src/test/tokens-contrast.test.ts`; see
  [Adding new tokens](design-system-tokens.md#adding-new-tokens).

## Storybook

Component stories live next to their components as `*.stories.tsx` (see
`src/components/ui/Button.stories.tsx`). Storybook is configured in `.storybook/` with the
`@storybook/nextjs` framework and loads every story under `src/components/`.

```bash
npx storybook dev -p 6006   # http://localhost:6006
```

If Storybook reports a missing framework or addon, install the packages referenced in
`.storybook/main.ts` locally: `npm install -D @storybook/nextjs @storybook/addon-links @storybook/addon-actions`.
Do not commit that change unless your PR is about the Storybook setup.

When you add or change a reusable component in `src/components/ui/`, add or update its story so
reviewers can check every state (default, hover/focus, disabled, error, loading).

## Dependency updates

Dependabot checks npm dependencies every week (`.github/dependabot.yml`). It groups minor and
patch updates into one PR, and opens each major update as its own PR. Dependabot commits use the
`chore(deps)` prefix.

When you review a dependency PR:

- Check that `package-lock.json` changed along with `package.json`. The lockfile is committed.
- Wait for CI to pass: lint, unit tests, production build, and E2E.
- For `@stellar/*` and `@stripe/*` bumps, read the release notes and walk through the wallet
  login and checkout flows on testnet. These packages handle signing and payments.
- For major bumps, read the migration guide. Next.js, React, and Zod upgrades usually need code
  changes, so expect a larger diff and reply to review comments on the same branch.

## Pull requests

Open the PR against `main` and fill in:

- **Title**: a conventional commit summary, e.g. `fix(middleware): match public paths by segment`.
- **Description**: what changed and why, `Closes #<issue>` for each issue, and screenshots or a
  short recording for visual changes.

### PR checklist

- [ ] Branch is up to date with `upstream/main`
- [ ] `npm run lint` passes
- [ ] `npm run format` has been run
- [ ] `npm run test` passes, and new behaviour has tests
- [ ] E2E / visual tests updated if the UI changed
- [ ] Stories added or updated for new or changed `ui/` components
- [ ] No unrelated changes, secrets or `.env.local` files committed
- [ ] Docs (README, `design-system-tokens.md`) updated if behaviour or conventions changed

### Review process

A maintainer reviews each PR. Reply to review comments by pushing new commits to the same branch
rather than opening a new PR. Once a PR is approved and its checks pass, a maintainer merges it.
