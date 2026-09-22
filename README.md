# respondio-flow-creator

This template should help get you started developing with Vue 3 in Vite.

## CI and merging into main

Push changes to `dev`, then open a pull request with base `main` and compare `dev`.
CI runs on pushes to `dev` and `main`, and on pull requests targeting either branch.
The `CI checks` job runs lint without fixing files, unit tests, type checking, a
production build, and Playwright tests in Chromium, Firefox, and WebKit.
The push run provides feedback before opening a PR; the PR run tests the proposed merge.

The workflow alone does not prevent direct pushes. A repository administrator must
configure GitHub's server-side rules:

1. Push this workflow to `dev` and let it run so `CI checks` appears in GitHub.
2. Open **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
3. Name it `Protect main`, set enforcement to **Active**, and target `main`.
4. Leave the bypass list empty, including administrators and apps.
5. Enable **Require a pull request before merging**. Required approvals can stay
   at zero for a solo project; use one or more if another reviewer is required.
6. Enable **Require status checks to pass**, add the exact check `CI checks`,
   and select GitHub Actions as its expected source.
7. Enable **Require branches to be up to date before merging**.
8. Enable **Restrict deletions** and **Block force pushes**, then save.

Open the `dev` → `main` PR, wait for `CI checks` to pass, and merge through GitHub.
With the active rule, direct pushes (including locally merged commits) to `main`
are rejected. Failed or pending CI blocks PR merges. Administrators can still edit
or disable the rule, so repository admin access remains trusted.

See [GitHub's ruleset documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository).

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
