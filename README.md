# undici 🕚

![CI workflow](https://github.com/jackdbd/undici/actions/workflows/ci.yaml/badge.svg)
![Release to npmjs.com workflow](https://github.com/jackdbd/undici/actions/workflows/release-to-npmjs.yaml/badge.svg)
[![codecov](https://codecov.io/gh/jackdbd/undici/branch/main/graph/badge.svg?token=P5uJ3doRer)](https://codecov.io/gh/jackdbd/undici)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

Monorepo for my [Eleventy](https://www.11ty.dev/) plugins.

> 📌 **Note to self**
>
> When Eleventy 3 becomes available as a regular release and is no longer in [alpha](https://www.zachleat.com/web/eleventy-v3-alpha/), update the `peerDependencies` of all packages from:
>
> ```txt
> "@11ty/eleventy": ">=2.0.0 || 3.0.0-alpha.4"
> ```
>
> to:
>
> ```txt
> "@11ty/eleventy": ">=3.0.0"
> ```
>
> Also, don't forget to update the GitHub workflows.
>
> **Note:** Eleventy supports **both** CJS and ESM [from version 3 onwards](https://github.com/11ty/eleventy/pull/3074). However, I plan to publish **only** ESM packages for my Eleventy plugins. This means that each one of my plugins should declare `>=3.0.0` in its `peerDependencies`.

- [Installation](#installation)
  - [Git hooks](#git-hooks)
- [Development](#development)
  - [Packages](#packages)
- [Demo site](#demo-site)
- [Monorepo management](#monorepo-management)
  - [Environment variables and secrets](#environment-variables-and-secrets)
  - [Scripts](#scripts)

| Package | Version | Install size | Docs |
|---|---|---|---|
| [@jackdbd/eleventy-plugin-content-security-policy](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-content-security-policy) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-content-security-policy)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-content-security-policy) | [Docs](./eleventy-plugin-content-security-policy/index.html) |
| [@jackdbd/eleventy-plugin-ensure-env-vars](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-ensure-env-vars) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-ensure-env-vars)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-ensure-env-vars) | [Docs](./eleventy-plugin-ensure-env-vars/index.html) |
| [@jackdbd/eleventy-plugin-permissions-policy](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-permissions-policy) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-permissions-policy)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-permissions-policy) | [Docs](./eleventy-plugin-permissions-policy/index.html) |
| [@jackdbd/eleventy-plugin-plausible](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-plausible) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-plausible)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-plausible) | [Docs](./eleventy-plugin-plausible/index.html) |
| [@jackdbd/eleventy-plugin-telegram](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-telegram) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-telegram)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-telegram) | [Docs](./eleventy-plugin-telegram/index.html) |
| [@jackdbd/eleventy-plugin-text-to-speech](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-text-to-speech) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech) | [![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-text-to-speech)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-text-to-speech) | [Docs](./eleventy-plugin-text-to-speech/index.html) |

> 📦 **ESM only:**
>
> All libraries of this monorepo are published to npmjs as ECMAScript modules.
>
> See also:
>
> - [Eleventy issue #836](https://github.com/11ty/eleventy/issues/836)
> - [ELEVENTY V3 WITH ESM SUPPORT NOW ON THE CANARY CHANNEL](https://www.zachleat.com/web/eleventy-v3-alpha/)
> - [CALLING ALL COURAGEOUS CANARY TESTERS FOR ELEVENTY V3.0](https://www.11ty.dev/blog/canary-eleventy-v3/)

## Installation

Clone the repo:

```sh
git clone git@github.com:jackdbd/undici.git

cd undici
```

This project is tested on Node.js >=18.0.0.

You can use a Node.js version manager like [nvm](https://github.com/nvm-sh/nvm), [asdf](https://github.com/asdf-vm/asdf) or [volta](https://github.com/volta-cli/volta) to manage your Node.js versions.

Install all dependencies from npm.js:

```sh
npm install --include dev
```

> :information_source: by passing `--include dev` we can be sure that we are installing `devDependencies` even when `NODE_ENV` is set to `production`. This is important because [we should **always**](https://youtu.be/HMM7GJC5E2o?si=RaVgw65WMOXDpHT2) set `NODE_ENV=production`.

### Git hooks

This project uses [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) to run the following git hooks:

- pre-commit
- pre-push

Don't forget to run this command whenever you need to setup/update any git hook:

```sh
npx simple-git-hooks
```

## Development

This monorepo uses [Typescript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to build all of its libraries.

This project has **43 dev dependencies**: @11ty/eleventy, @11ty/eleventy-fetch, @aws-sdk/client-s3, @aws-sdk/lib-storage, @commitlint/cli, @commitlint/config-conventional, @google-cloud/storage, @google-cloud/text-to-speech, @jackdbd/checks, @jackdbd/zod-to-doc, @microsoft/api-documenter, @microsoft/api-extractor, @qiwi/multi-semantic-release, @semantic-release/changelog, @semantic-release/git, @thi.ng/transclude, @types/debug, @types/html-to-text, @types/jsdom, @types/yargs, @typescript-eslint/eslint-plugin, debug, eslint, eslint-config-prettier, eslint-plugin-prettier, http-server, lint-staged, micromark, npm-check-updates, npm-run-all, pkg-size, prettier, pretty-error, rimraf, semantic-release, simple-git-hooks, specificity, tsm, typedoc, typedoc-plugin-zod, typescript, yargs, zx.

### Packages

Build all libraries (i.e. 11ty plugins) in watch mode:

```sh
npm run dev:libs
```

You can also run `build` / `dev` / `test` on a single package. For example:

```sh
npm run build -w packages/eleventy-plugin-telegram
npm run dev -w packages/eleventy-plugin-telegram
npm run test -w packages/eleventy-plugin-telegram
```

## Demo site

See these Eleventy plugins configured for the [demo site](./packages/demo-site/README.md) that you can find in this monorepo.

The website is deployed to Cloudflare Pages and available at https://undici.pages.dev/

## Monorepo management

### Environment variables and secrets

For local development I rely on some environment variables and secrets. They are all set using a `.envrc` file. In my case this `.envrc` file **can** be tracked in git because the environment variables I use are non-sensitive configuration, and the secrets exist only on my filesystem. See also [nix-config](https://github.com/jackdbd/nix-config/) to learn how I encrypt my secrets.

### Scripts

See [scripts](./scripts/README.md).
