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
> At the moment none of these packages has an ESM build. It wouldn't make sense to build 11ty plugins as ECMA Script Modules until 11ty [allows to return a promise for its configuration](https://github.com/11ty/eleventy/issues/614#issuecomment-1696207457). And this feature is tied to ESM support, which will land in Eleventy v3.0.0.
>
> See also:
>
> - [Eleventy issue #836](https://github.com/11ty/eleventy/issues/836)

## Installation

Clone the repo:

```shell
git clone git@github.com:jackdbd/undici.git
```

This project defines a virtual environment with all the necessary dependencies. This environment is declared by the `mkShell` function in the `flake.nix` file you can find in the root directory of this monorepo. Thanks to nix, direnv and the `.envrc` file, you can activate this environment just by entering this monorepo (e.g. with `cd undici`).

If you don't use nix, ensure you have a Node.js version supported by this project. You could use a Node.js version manager like [nvm](https://github.com/nvm-sh/nvm), [asdf](https://github.com/asdf-vm/asdf-nodejs) or [volta](https://volta.sh/).

Install all dependencies from npm.js (by passing `--include dev` we can be sure that we are installing `devDependencies` even when `NODE_ENV` is set to `production`):

```sh
npm install --include dev --include prod
```

If you don't use nix, install [zx](https://github.com/google/zx) globally.

```sh
npm install --global zx
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

If you want to [update your git hooks](https://github.com/toplenboren/simple-git-hooks?tab=readme-ov-file#update-git-hooks-command) edit the `simple-git-hooks` section in `package.json`, then run:

```sh
npx simple-git-hooks
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

See these plugins configured for the [demo Eleventy site](./packages/demo-site/README.md) that you can find in this monorepo. Live at: https://undici.pages.dev/

## Monorepo management

See [scripts](./scripts/README.md).
