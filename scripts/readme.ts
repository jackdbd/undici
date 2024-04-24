import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  image,
  licenseLink,
  link,
  list,
  toc,
  compactEmptyLines,
  transcludeFile
} from '@thi.ng/transclude'
import { REPO_ROOT } from '@jackdbd/eleventy-test-utils'
import {
  markdownTableFromZodSchema,
  stringsFromZodAnyType
} from '@jackdbd/zod-to-doc/lib'
import defDebug from 'debug'
import {
  feature,
  options as pp_options
} from '../packages/permissions-policy/lib/index.js'
import { config as eev_config } from '../packages/eleventy-plugin-ensure-env-vars/lib/schemas.js'
import { options as plausible_options } from '../packages/eleventy-plugin-plausible/lib/schemas.js'
import { options as telegram_options } from '../packages/eleventy-plugin-telegram/lib/schemas.js'
import { config as tts_config } from '../packages/eleventy-plugin-text-to-speech/lib/eleventy/plugin.js'
// import { config as tts_config } from '../packages/eleventy-plugin-text-to-speech/src/eleventy/plugin.js'
// import { config as tts_config } from '@jackdbd/eleventy-plugin-text-to-speech'
import { rule as tts_rule } from '../packages/eleventy-plugin-text-to-speech/lib/schemas/rule.js'
import { callout } from './ui-components.js'

const debug = defDebug(`script:readme`)

const permissionsPolicyFeaturesMarkdown = () => {
  const arr = stringsFromZodAnyType(feature)

  const links = arr.map((s) => {
    const feature = (s as any).replaceAll('`', '').replaceAll('"', '')
    return link(
      feature,
      `https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/${feature}`
    )
  })

  const lines: string[] = []
  lines.push('\n\n')
  lines.push(`### Features`)
  lines.push('\n\n')
  lines.push(
    `This library defines ${arr.length} \`Permissions-Policy\` features:`
  )
  lines.push('\n\n')
  lines.push(links.join(', '))
  return lines.join('')
}

const permissionsPolicyAllowlistMarkdown = () => {
  // const arr = stringsFromZodAnyType(allow_item)

  const lines: string[] = []
  lines.push('\n\n')
  lines.push(`### Allowlist`)
  lines.push('\n\n')
  lines.push(
    `An ${link(
      'allowlist',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#allowlists'
    )} is a list containing specific origins or special values.`
  )

  return lines.join('')
}

interface ReadmeConfig {
  configuration: string
  current_year: number
  pkg_root: string
  project_started_in_year: number
  repo_name: string
}

const readme = ({
  configuration,
  current_year,
  pkg_root,
  project_started_in_year,
  repo_name
}: ReadmeConfig) => {
  const pkg = JSON.parse(
    readFileSync(path.join(pkg_root, 'package.json'), { encoding: 'utf-8' })
  )
  debug(`generating README.md for ${pkg.name}`)

  const [npm_scope, unscoped_pkg_name] = pkg.name.split('/')
  const github_username = npm_scope.replace('@', '') as string

  return transcludeFile(path.join(pkg_root, 'tpl.readme.md'), {
    user: pkg.author,
    templates: {
      badges: () => {
        // https://shields.io/badges/npm-downloads
        // https://shields.io/badges/npm-downloads-by-package-author

        const npm_package = link(
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

        const socket = link(
          image(
            `https://socket.dev/api/badge/npm/package/${npm_scope}/${unscoped_pkg_name}`,
            'Socket Badge'
          ),
          `https://socket.dev/npm/package/${npm_scope}/${unscoped_pkg_name}`
        )

        // https://app.codecov.io/gh/jackdbd/undici?flags%5B0%5D=eleventy-plugin-telegram
        const codecov = link(
          image(
            `https://codecov.io/gh/${github_username}/${repo_name}/graph/badge.svg?token=BpFF8tmBYS`,
            'CodeCov badge'
          ),
          `https://app.codecov.io/gh/${github_username}/${repo_name}?flags%5B0%5D=${unscoped_pkg_name}`
        )

        return [npm_package, install_size, codecov, socket].join('\n')
      },

      configuration,

      'engines.node': () => {
        const lines = [
          `This project is tested on Node.js ${pkg.engines.node}.`,
          '\n\n',
          `You can use a Node.js version manager like ${link('nvm', 'https://github.com/nvm-sh/nvm')}, ${link('asdf', 'https://github.com/asdf-vm/asdf')} or ${link('volta', 'https://github.com/volta-cli/volta')} to manage your Node.js versions.`
        ]
        return lines.join('')
      },

      'pkg.deps': () => {
        const entries = Object.entries(pkg.dependencies)

        const rows = entries.map(
          ([name, version]) =>
            `| ${link(name, `https://www.npmjs.com/package/${name}`)} | \`${version}\` |`
        )
        const table = [
          `| Package | Version |`,
          '|---|---|',
          rows.join('\n')
        ].join('\n')

        return [`## Dependencies`, '\n\n', table].join('')
      },

      'pkg.description': pkg.description,

      'pkg.docs': () => {
        const lines = [
          `## Docs`,
          '\n\n',
          `[Docs generated by TypeDoc](https://${github_username}.github.io/${repo_name}/${unscoped_pkg_name}/)`,
          '\n\n',
          callout({
            emoji: ':open_book:', // open_book, page_facing_up, page_with_curl
            title: 'API Docs',
            message: `This project uses [API Extractor](https://api-extractor.com/) and [api-documenter markdown](https://api-extractor.com/pages/commands/api-documenter_markdown/) to generate a bunch of markdown files and a \`.d.ts\` rollup file containing all type definitions consolidated into a single file. I don't find this \`.d.ts\` rollup file particularly useful. On the other hand, the markdown files that api-documenter generates are quite handy when reviewing the public API of this project.\n\n*See [Generating API docs](https://api-extractor.com/pages/setup/generating_docs/) if you want to know more*.`
          })
        ]
        return lines.join('')
      },

      'pkg.installation': () => {
        const lines = [`## Installation`]

        lines.push('\n\n')
        lines.push(`\`\`\`sh`)
        lines.push('\n')
        lines.push(`npm install ${pkg.name}`)
        lines.push('\n')
        lines.push(`\`\`\``)

        if (pkg.engines && pkg.engines.node) {
          lines.push('\n\n')
          lines.push(
            `**Note**: this library was tested on Node.js ${pkg.engines.node}. It might work on other Node.js versions though.`
          )
        }

        return lines.join('')
      },

      'pkg.license': ({ user }) => {
        const copyright =
          current_year > project_started_in_year
            ? `&copy; ${project_started_in_year} - ${current_year}`
            : `&copy; ${current_year}`

        const lines = [
          `## License`,
          '\n\n',
          `${copyright} ${link(user.name, 'https://www.giacomodebidda.com/')} // ${licenseLink(pkg.license)}`
        ]
        return lines.join('')
      },

      'pkg.name': pkg.name,

      'pkg.peerDependencies': () => {
        if (pkg.peerDependencies) {
          const entries = Object.entries(pkg.peerDependencies)
          const what =
            entries.length === 1 ? `peer dependency` : `peer dependencies`

          const rows = entries.map(([name, version]) => {
            const s = (version as any).replaceAll('||', 'or')
            return `| \`${name}\` | \`${s}\` |`
          })

          const table = [
            `| Peer | Version range |`,
            '|---|---|',
            rows.join('\n')
          ].join('\n')

          const strings = [
            callout({
              // emoji: ':warning:',
              emoji: '⚠️',
              title: `Peer Dependencies`,
              message: `This package defines ${entries.length} ${what}.`
            }),
            '\n\n',
            table
          ]
          return strings.join('')
        } else {
          return ''
        }
      },

      troubleshooting: ({ user }) => {
        const lines = [
          `## Troubleshooting`,
          '\n',
          `This plugin uses the [debug](https://github.com/debug-js/debug) library for logging.`,
          `You can control what's logged using the \`DEBUG\` environment variable.`,
          '\n',
          `For example, if you set your environment variables in a \`.envrc\` file, you can do:`,
          '\n',
          `\`\`\`sh`,
          `# print all logging statements`,
          `export DEBUG=11ty-plugin:*`,
          `\`\`\``
        ]
        return lines.join('\n')
      }
    },
    post: [toc(), compactEmptyLines]
  })
}

interface Config {
  current_year: number
  packages_root: string
  project_started_in_year: number
  repo_name: string
  unscoped_pkg_name: string
}

const main = async ({
  current_year,
  packages_root,
  project_started_in_year,
  repo_name,
  unscoped_pkg_name
}: Config) => {
  const pkg_root = path.join(packages_root, unscoped_pkg_name)

  const errors: Error[] = []
  const warnings: string[] = []
  const configurations: string[] = [`## Configuration`, '\n\n']

  if (unscoped_pkg_name === 'eleventy-plugin-content-security-policy') {
    configurations.push('\n\n')
    configurations.push(
      `Refer also to the library ${link('@jackdbd/content-security-policy', 'https://www.npmjs.com/package/@jackdbd/content-security-policy')} for the configuration.`
    )
  } else if (unscoped_pkg_name === 'eleventy-plugin-ensure-env-vars') {
    const res = markdownTableFromZodSchema(eev_config as any)
    if (res.error) {
      errors.push(res.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res.value)
    }
  } else if (unscoped_pkg_name === 'eleventy-plugin-plausible') {
    const res = markdownTableFromZodSchema(plausible_options as any)
    if (res.error) {
      errors.push(res.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res.value)
    }
  } else if (unscoped_pkg_name === 'eleventy-plugin-telegram') {
    // This table shows `undefined` for the Telegram chat ID and bot token,
    // which is technically correct, given there isn't a default in this Zod
    // schema. However, I would rather have `process.env.TELEGRAM_CHAT_ID` and
    // `process.env.TELEGRAM_BOT_TOKEN` in the table.
    // const res = markdownTableFromZodSchema(telegram_options)
    // if (res.error) {
    //   errors.push(res.error)
    // } else {
    //   configurations.push(`### Plugin options`)
    //   configurations.push('\n\n')
    //   configurations.push(res.value)
    // }
  } else if (unscoped_pkg_name === 'eleventy-plugin-text-to-speech') {
    const res_a = markdownTableFromZodSchema(tts_config as any)
    if (res_a.error) {
      errors.push(res_a.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res_a.value)
    }
    const res_b = markdownTableFromZodSchema(tts_rule as any)
    if (res_b.error) {
      errors.push(res_b.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Rule`)
      configurations.push('\n\n')
      configurations.push(res_b.value)
    }
  } else if (unscoped_pkg_name === 'hosting-utils') {
    configurations.push(
      'Read these resources to understand how to configure `_headers`, `serve.json`, `vercel.json`.'
    )

    const links = [
      link(
        'Attach headers to Cloudflare Pages responses',
        'https://developers.cloudflare.com/pages/configuration/headers/'
      ),
      link('serve', 'https://github.com/vercel/serve'),
      link(
        'serve-handler options',
        'https://github.com/vercel/serve-handler#options'
      ),
      link(
        'Configure headers in `vercel.json`',
        'https://vercel.com/docs/projects/project-configuration#headers'
      )
    ]

    configurations.push('\n\n')
    configurations.push(list(links))
  } else if (unscoped_pkg_name === 'permissions-policy') {
    configurations.push(
      `Read these resources to understand how to configure the \`Permissions-Policy\` and the \`Feature-Policy\` HTTP response headers.`
    )

    const links = [
      link(
        'A new security header: Feature Policy',
        'https://scotthelme.co.uk/a-new-security-header-feature-policy/'
      ),
      link(
        'Goodbye Feature Policy and hello Permissions Policy!',
        'https://scotthelme.co.uk/goodbye-feature-policy-and-hello-permissions-policy/'
      ),
      link(
        'Permissions Policy Explainer',
        'https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md'
      ),
      link(
        'Policy Controlled Features',
        'https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md'
      ),
      link(
        'Controlling browser features with Permissions Policy',
        'https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy/'
      )
    ]

    configurations.push('\n\n')
    configurations.push(list(links))

    const res_a = markdownTableFromZodSchema(pp_options as any)
    if (res_a.error) {
      errors.push(res_a.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Options`)
      configurations.push('\n\n')
      configurations.push(res_a.value)
    }

    configurations.push(permissionsPolicyFeaturesMarkdown())
    configurations.push(permissionsPolicyAllowlistMarkdown())
  } else if (unscoped_pkg_name === 'text-to-audio-asset') {
    configurations.push(`TODO`)
  } else {
    const messages = [
      `Automatic README generation not implemented for package ${unscoped_pkg_name}.`,
      `Create a tpl.readme.md file in ${pkg_root}, update this script, then run it again.`
    ]
    errors.push(new Error(messages.join('\n')))
  }

  warnings.forEach((w) => {
    console.warn(`⚠️ ${w}`)
  })

  if (errors.length > 0) {
    throw new Error(
      `Error generating README: ${errors.map((e) => e.message).join('\n')}`
    )
  }

  const transcluded = readme({
    configuration: configurations.join(''),
    current_year,
    pkg_root,
    project_started_in_year,
    repo_name
  })

  const outdoc = 'README.md'
  // console.log(`=== ${outdoc} BEGIN ===`)
  // console.log(transcluded.src)
  // console.log(`=== ${outdoc} END ===`)
  writeFileSync(path.join(pkg_root, outdoc), transcluded.src)
}

await main({
  current_year: new Date().getFullYear(),
  packages_root: path.join(REPO_ROOT, 'packages'),
  repo_name: 'undici',
  unscoped_pkg_name: process.argv[2],
  project_started_in_year: 2022
})
