# undici

![CI workflow](https://github.com/jackdbd/undici/actions/workflows/ci.yaml/badge.svg)
![release workflow](https://github.com/jackdbd/undici/actions/workflows/release.yaml/badge.svg)

Monorepo for my [Eleventy](https://www.11ty.dev/) plugins.

> 📦 **CJS only:**
> 
> All libraries of this monorepo are published to npmjs as CommonJS.
>
> At the moment no one of these packages has a ESM build.
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
Note: you will still need to refresh the browser.

## Test

Run all tests on all packages:

```sh
npm run test
```

## Monorepo management

See [scripts](./scripts/README.md).
