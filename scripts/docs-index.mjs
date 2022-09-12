#!/usr/bin/env zx

import { fs, path } from 'zx'
import 'zx/globals'
import { throwIfNotInvokedFromMonorepoRoot } from './utils.mjs'

// Usage (from the monorepo root):
// ../../scripts/docs-index.mjs

throwIfNotInvokedFromMonorepoRoot(process.env.PWD)

const PACKAGES_EXCLUDED_FROM_INDEX = ['demo-site']

const script_name = path.basename(__filename)

const monorepo_root = process.env.PWD
const output = path.join(monorepo_root, 'docs', 'README.md')

const PREFIX = 'https://github.com/jackdbd/undici/tree/main'
const API_DOCS_DIR = 'api-docs'

const package_names = fs.readdirSync(path.join(monorepo_root, 'packages'))

const items = package_names
  .filter((s) => !PACKAGES_EXCLUDED_FROM_INDEX.includes(s))
  .map((name) => {
    // TypeDoc publishes the docs/ directory to GitHub pages.
    const typedoc_link = `[${name}](./${name}/index.html)`

    // at the moment I am not hosting on GitHub Pages the API docs generated by
    // api-documenter, so I just put a relative path to the markdown files of this
    // GitHub repo.
    const api_documenter_link = `[API docs](${PREFIX}/packages/${name}/${API_DOCS_DIR}/index.md)`

    return `${typedoc_link} (and ${api_documenter_link})`
  })

const intro = `
# Docs

The **documentation** for each package is automatically generated by [TypeDoc](https://typedoc.org/).

The **API docs** are generated by [api-extractor](https://api-extractor.com/) + [api-documenter](https://api-extractor.com/pages/setup/generating_docs/).

:warning: Do **not** edit this file manually. This file is generated by \`${script_name}\` (see [scripts](${PREFIX}/scripts/README.md)).
`

const ul = items.map((item) => `- ${item}`).join('\n')

const md = `${intro}\n${ul}`

await fs.writeFile(output, md, { encoding: 'utf8' })
