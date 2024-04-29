# undici 🕚

![CI workflow](https://github.com/jackdbd/undici/actions/workflows/ci.yaml/badge.svg)
![Release to npmjs.com workflow](https://github.com/jackdbd/undici/actions/workflows/release-to-npmjs.yaml/badge.svg)
[![codecov](https://codecov.io/gh/jackdbd/undici/graph/badge.svg?token=BpFF8tmBYS)](https://codecov.io/gh/jackdbd/undici)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

{{pkg.description}}

> 📌 **Note to self**
>
> When Eleventy 3 becomes available as a regular release and is no longer in [alpha](https://www.zachleat.com/web/eleventy-v3-alpha/), update the `peerDependencies` of all packages from:
>
> ```txt
> "@11ty/eleventy": ">=2.0.0 || 3.0.0-alpha.6"
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

<!-- toc -->

{{table}}

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

{{pkg.overrides}}

{{engines.node}}

Install all dependencies from npm.js:

```sh
npm install --include dev
```

> :information_source: by passing `--include dev` we can be sure that we are installing `devDependencies` even when `NODE_ENV` is set to `production`. This is important because [we should **always**](https://youtu.be/HMM7GJC5E2o?si=RaVgw65WMOXDpHT2) set `NODE_ENV=production`.

{{git.hooks}}

## Development

This monorepo uses [Typescript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to build all of its libraries.

{{pkg.devDependencies}}

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
