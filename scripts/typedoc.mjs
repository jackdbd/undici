#!/usr/bin/env zx

import { debuglog } from 'node:util'
// import 'zx/globals'
import {
  throwIfInvokedFromMonorepoRoot,
  unscopedPackageName
} from './utils.mjs'

const debug = debuglog('script:typedoc')

// Usage (from a package root):
// ../../scripts/typedoc.mjs

throwIfInvokedFromMonorepoRoot(process.env.PWD)

const unscoped_name = await unscopedPackageName(process.env.PWD)

const package_root = process.env.PWD
const monorepo_root = path.join(package_root, '..', '..')
const library_entrypoint = path.join(package_root, 'src', 'index.ts')
const docs_out = path.join(monorepo_root, 'docs', unscoped_name)

debug(`running typedoc on entrypoint %s`, library_entrypoint)
await $`npx typedoc ${library_entrypoint} \
--excludeInternal \
--excludePrivate \
--out ${docs_out} \
--plugin typedoc-plugin-zod \
--theme default`
