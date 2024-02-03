import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  image,
  // licenseLink,
  link,
  list,
  compactEmptyLines,
  toc,
  transcludeFile
} from '@thi.ng/transclude'
import { REPO_ROOT } from '@jackdbd/eleventy-test-utils'
import { overridesCallout } from './ui-components.js'
import makeDebug from 'debug'

const debug = makeDebug(`script:monorepo-readme`)

// parsed package.json
type PackageJson = any

interface ReadmeConfig {
  pkg: PackageJson
  root_repo: string
  table: string
  year_now: number
  year_started: number
}

const readme = ({
  pkg,
  root_repo,
  table,
  year_now,
  year_started
}: ReadmeConfig) => {
  debug(`generating README.md for ${pkg.name}`)

  return transcludeFile(join(root_repo, 'tpl.readme.md'), {
    user: pkg.author,

    templates: {
      'engines.node': () => {
        const lines = [
          `This project is tested on Node.js ${pkg.engines.node}.`,
          '\n\n',
          `You can use a Node.js version manager like ${link('nvm', 'https://github.com/nvm-sh/nvm')}, ${link('asdf', 'https://github.com/asdf-vm/asdf')} or ${link('volta', 'https://github.com/volta-cli/volta')} to manage your Node.js versions.`
        ]
        return lines.join('')
      },

      'git.hooks': () => {
        const keys = Object.keys(pkg['simple-git-hooks'])
        const lines = [
          `### Git hooks`,
          '\n\n',
          `This project uses ${link('simple-git-hooks', 'https://github.com/toplenboren/simple-git-hooks')} to run the following git hooks:`,
          '\n\n',
          `${list(keys)}`,
          '\n\n',
          `Don't forget to run this command whenever you need to setup/update any git hook:`,
          '\n\n',
          `\`\`\`sh`,
          '\n',
          `npx simple-git-hooks`,
          '\n',
          `\`\`\``
        ]
        return lines.join('')
      },

      'pkg.description': pkg.description,

      'pkg.devDependencies': () => {
        const keys = Object.keys(pkg.devDependencies)
        return `This project has **${keys.length} dev dependencies**: ${keys.join(', ')}.`
        // return `This project has **${keys.length} dev dependencies**.`
      },

      // 'pkg.license': ({ user }) => {
      //   const copyright =
      //     year_now > year_started
      //       ? `&copy; ${year_started} - ${year_now}`
      //       : `&copy; ${year_now}`

      //   const lines = [
      //     `## License`,
      //     '\n\n',
      //     `${copyright} ${link(user.name, 'https://www.giacomodebidda.com/')} // ${licenseLink(pkg.license)}`
      //   ]
      //   return lines.join('')
      // },

      'pkg.overrides': () => {
        if (pkg.overrides) {
          return overridesCallout(pkg.overrides)
        } else {
          return ''
        }
      },

      table
    },

    post: [toc(), compactEmptyLines]
  })
}

interface Config {
  excluded: string[]
  github_username: string
  npm_scope: string
  output: string
  package_names: string[]
  pkg: PackageJson
  root_repo: string
  year_now: number
  year_started: number
}

const main = async ({
  excluded,
  github_username,
  npm_scope,
  output,
  package_names,
  pkg,
  root_repo,
  year_now,
  year_started
}: Config) => {
  // badges and other links
  const items = package_names
    .filter((s) => !excluded.includes(s))
    .map((unscoped_pkg_name) => {
      const pkg_href = `https://github.com/${github_username}/undici/tree/main/packages/${unscoped_pkg_name}`
      const scoped_pkg_name = `${npm_scope}/${unscoped_pkg_name}`
      const home = link(scoped_pkg_name, pkg_href)

      // The docs/ directory is published to GitHub pages. Each package of this
      // monorepo is under a subdirectory of the docs/ directory.
      const typedoc = link('Docs', `./${unscoped_pkg_name}/index.html`)

      const npm_version = link(
        image(
          `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}.svg`,
          'npm version'
        ),
        `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}`
        // `https://www.npmjs.com/package/${npm_scope}/${unscoped_pkg_name}`
      )

      const install_size = link(
        image(
          `https://packagephobia.com/badge?p=${npm_scope}/${unscoped_pkg_name}`,
          'install size'
        ),
        `https://packagephobia.com/result?p=${npm_scope}/${unscoped_pkg_name}`
      )

      return {
        docs: typedoc,
        home,
        install_size,
        version: npm_version
      }
    })

  debug(`create table with ${items.length} rows`)
  const rows = items.map((d) => {
    const row = [d.home, d.version, d.install_size, d.docs].join(' | ')
    return `| ${row} |`
  })

  const table = [
    `| Package | Version | Install size | Docs |`,
    '|---|---|---|---|',
    rows.join('\n')
  ].join('\n')

  const transcluded = readme({ pkg, root_repo, table, year_now, year_started })

  writeFileSync(output, transcluded.src)
  debug(`wrote ${output}`)
}

await main({
  excluded: ['demo-site', 'eleventy-test-utils', 'text-to-audio-asset'],
  github_username: 'jackdbd',
  npm_scope: '@jackdbd',
  output: join(REPO_ROOT, 'README.md'),
  package_names: readdirSync(join(REPO_ROOT, 'packages')),
  pkg: JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8')),
  root_repo: REPO_ROOT,
  year_now: new Date().getFullYear(),
  year_started: 2022
})
