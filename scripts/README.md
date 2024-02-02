# scripts

Scripts for building, testing, deploying the packages of this monorepo, or for general development. If not otherwise specified, run these scripts from the monorepo root.

## Docs

Build the docs for each package:

```sh
npm run build:docs --workspaces --if-present
```

Build the index page for the docs:

```sh
./scripts/docs-index.mjs
```

Serve the docs:

```sh
npx http-server ./docs/ --port 8090
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

## Generate fixtures for tests

Generate the audio files used in tests:

```sh
npx tsm scripts/generate-audio-fixtures.ts
```
