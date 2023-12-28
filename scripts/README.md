# scripts

Scripts for building, testing, deploying the packages of this monorepo, or for general development. If not otherwise specified, run these scripts from the monorepo root.

## Docs

Build the docs ([doctoc](https://github.com/thlorenz/doctoc) + [API extractor](https://api-extractor.com/) + [API documenter](https://www.npmjs.com/package/@microsoft/api-documenter) + [TypeDoc](https://typedoc.org/)) of each package:

```sh
npm run build:docs --workspaces --if-present
```

Build the index page for the docs:

```sh
./scripts/docs-index.mjs
```

## Upgrade dependencies

Upgrade dependencies all packages, interactively:

```sh
npx ncu --dep 'dev,prod' --deep --interactive --upgrade --loglevel info
```

## Linting

Run the linter on all packages:

```sh
npm run lint --workspaces --if-present
```

## Formatting

Run the formatter on all packages:

```sh
npm run format --workspaces --if-present
```
