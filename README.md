# undici 🕚

![CI workflow](https://github.com/jackdbd/undici/actions/workflows/ci.yaml/badge.svg)
![Release to npmjs.com workflow](https://github.com/jackdbd/undici/actions/workflows/release-to-npmjs.yaml/badge.svg)
[![codecov](https://codecov.io/gh/jackdbd/undici/branch/main/graph/badge.svg?token=P5uJ3doRer)](https://codecov.io/gh/jackdbd/undici)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

Monorepo for my [Eleventy](https://www.11ty.dev/) plugins.

> 📦 **CJS only:**
> 
> All libraries of this monorepo are published to npmjs as CommonJS.
>
> At the moment none of these packages has a ESM build.
>
> See also:
>
> - [Eleventy issue #836](https://github.com/11ty/eleventy/issues/836)

## Installation

Clone the repo:

```shell
git clone git@github.com:jackdbd/undici.git

cd undici
```

Install all dependencies from npm.js and setup git hooks with [husky](https://typicode.github.io/husky/):

```sh
npm install
```

## Development

This monorepo uses [Typescript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to build all of its libraries.

Build all libraries (i.e. 11ty plugins):

```sh
npm run build:libs
```

Build the demo 11ty site:

```sh
npm run build:site
```

Build all libraries and the demo site:

```sh
npm run build
```

Serve the demo site:

```sh
npm run serve:site
```

Build all libraries and the demo site, both in watch mode, and serve the demo site:

```sh
npm run dev
```

Note: you will still need to refresh the browser (this might change when [Eleventy 2.0 will add a dev server](https://www.11ty.dev/docs/watch-serve/)).

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
npm run test -w packages/eleventy-plugin-webmention
```

## Demo

See these plugins configured for the [demo Eleventy site](./packages/demo-site/README.md) that you can find in this monorepo. Live at: https://undici.pages.dev/

## Monorepo management

See [scripts](./scripts/README.md).
