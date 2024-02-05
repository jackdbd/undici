#!/usr/bin/env zx

import defDebug from 'debug'
import { throwIfInvokedFromMonorepoRoot } from './utils.mjs'

const debug = defDebug('script:format')

// Usage (from a package root):
// ../../scripts/format.mjs

throwIfInvokedFromMonorepoRoot(process.env.PWD)

const package_root = process.env.PWD
const monorepo_root = path.join(package_root, '..', '..')
const config = path.join(monorepo_root, 'config', 'prettier.cjs')
const glob_pattern = `${package_root}/{src,test}/**/*.{cjs,js,mjs,ts}`

debug(`running prettier on glob pattern %s`, glob_pattern)
await $`npx prettier --config ${config} --write ${glob_pattern}`
