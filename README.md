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

| Package | Version | Socket | Docs |
| --- | --- | --- | --- |
| [@jackdbd/eleventy-plugin-content-security-policy](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-content-security-policy) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy) | [![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-content-security-policy)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-content-security-policy) | [docs](https://jackdbd.github.io/undici/eleventy-plugin-content-security-policy/index.html) |
| [@jackdbd/eleventy-plugin-ensure-env-vars](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-ensure-env-vars) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars) | [![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-ensure-env-vars)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-ensure-env-vars) | [docs](https://jackdbd.github.io/undici/eleventy-plugin-ensure-env-vars/index.html) |
| [@jackdbd/eleventy-plugin-permissions-policy](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-permissions-policy) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy) | [![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-permissions-policy)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-permissions-policy) | [docs](https://jackdbd.github.io/undici/eleventy-plugin-permissions-policy/index.html) |
| [@jackdbd/eleventy-plugin-telegram](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-telegram) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram) | [![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-telegram)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-telegram) | [docs](https://jackdbd.github.io/undici/eleventy-plugin-telegram/index.html) |
| [@jackdbd/eleventy-plugin-text-to-speech](https://github.com/jackdbd/undici/tree/main/packages/eleventy-plugin-text-to-speech) | [![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech) | [![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-text-to-speech)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-text-to-speech) | [docs](https://jackdbd.github.io/undici/eleventy-plugin-text-to-speech/index.html) |

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

Ensure you have a Node.js version supported by this project (look at the `engines` field in the `package.json` of the library you want to install). You can use a Node.js version manager like [nvm](https://github.com/nvm-sh/nvm), [asdf](https://github.com/asdf-vm/asdf-nodejs) or [volta](https://volta.sh/).

Install all dependencies from npm.js:

```sh
npm install --include dev
```

> :information_source: by passing `--include dev` we can be sure that we are installing `devDependencies` even when `NODE_ENV` is set to `production`. This is important because [we should **always**](https://youtu.be/HMM7GJC5E2o?si=RaVgw65WMOXDpHT2) set `NODE_ENV=production`.

Setup/update `./git/hooks` with [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks).

```sh
npx simple-git-hooks
```

## Development

This monorepo uses [Typescript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to build all of its libraries.

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

### Demo site

Build the demo 11ty site:

```sh
npm run build:site
```

> :warning: Before building the demo site, be sure to build all other packages first.

Build all libraries and the demo site:

```sh
npm run build
```

Build all libraries and the demo site, both in watch mode, and use the [Eleventy dev server](https://www.11ty.dev/docs/dev-server/) to serve the demo site:

```sh
npm run dev
```

Watch only the demo site and serve it using the Eleventy dev server:

```sh
npm run dev -w packages/demo-site
```

Serve the production build of the demo site:

```sh
npm run serve -w packages/demo-site
```

## Test

Run all tests on all packages:

```sh
npm run test
```

Run tests on a single package:

```sh
npm run test -w packages/eleventy-plugin-content-security-policy

npm run test -w packages/eleventy-plugin-ensure-env-vars

npm run test -w packages/eleventy-plugin-permissions-policy

npm run test -w packages/eleventy-plugin-plausible

npm run test -w packages/eleventy-plugin-telegram

npm run test -w packages/eleventy-plugin-text-to-speech
```

## Demo

See these plugins configured for the [demo Eleventy site](./packages/demo-site/README.md) that you can find in this monorepo.

The website is deployed to Cloudflare Pages and available at https://undici.pages.dev/

## Monorepo management

### Scripts

See also [scripts](./scripts/README.md).

### Environment variables and secrets

For local development I rely on some environment variables and secrets. They are all set using a `.envrc` file. In my case this `.envrc` file **can** be tracked in git because the environment variables I use are non-sensitive configuration, and the secrets exist only on my filesystem. See also [nix-config](https://github.com/jackdbd/nix-config/) to learn how I encrypt my secrets.
