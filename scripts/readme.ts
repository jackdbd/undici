import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
import { markdownTableFromZodSchema } from '@jackdbd/zod-to-doc/lib'
import { config as eev_config } from '../packages/eleventy-plugin-ensure-env-vars/lib/schemas.js'
import {
  directive as pp_directive,
  options as pp_options
} from '../packages/eleventy-plugin-permissions-policy/lib/schemas.js'
import { options as telegram_options } from '../packages/eleventy-plugin-telegram/lib/schemas.js'
import { config as tts_config } from '../packages/eleventy-plugin-text-to-speech/lib/eleventy/plugin.js'
// import { config as tts_config } from '../packages/eleventy-plugin-text-to-speech/src/eleventy/plugin.js'
// import { config as tts_config } from '@jackdbd/eleventy-plugin-text-to-speech'
import { rule as tts_rule } from '../packages/eleventy-plugin-text-to-speech/lib/schemas/rule.js'

interface CalloutConfig {
  // https://github.com/ikatyang/emoji-cheat-sheet
  emoji: string
  title: string
  message: string
}

const callout = (cfg: CalloutConfig) => {
  const paragraphs = cfg.message.split('\n\n')
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')

  const lines = [`> ${cfg.emoji} **${cfg.title}**`, '\n', `>`, '\n', body]
  return lines.join('')
}

interface ReadmeConfig {
  configuration: string
  current_year: number
  pkg_root: string
  project_started_in_year: number
}

const readme = ({
  configuration,
  current_year,
  pkg_root,
  project_started_in_year
}: ReadmeConfig) => {
  const pkg = JSON.parse(readFileSync(join(pkg_root, 'package.json'), 'utf-8'))
  console.log(`generating README.md for ${pkg.name}`)

  const [npm_scope, unscoped_pkg_name] = pkg.name.split('/')
  const github_username = npm_scope.replace('@', '') as string

  return transcludeFile(join(pkg_root, 'tpl.readme.md'), {
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

        // const ci_workflow = link(
        //   image(
        //     `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml/badge.svg`,
        //     'CI'
        //   ),
        //   `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml`
        // )

        // const release_workflow = link(
        //   image(
        //     `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/release-to-npmjs.yaml/badge.svg`,
        //     'Release to npmjs.com'
        //   ),
        //   `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/release-to-npmjs.yaml`
        // )

        // const codecov = link(
        //   image(
        //     `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}/graph/badge.svg?token=9jddzo5Dt3`,
        //     'CodeCov badge'
        //   ),
        //   `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}`
        // )

        // const conventional_commits = link(
        //   image(
        //     `https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white`,
        //     'Conventional Commits'
        //   ),
        //   'https://conventionalcommits.org'
        // )

        return [
          npm_package,
          install_size,
          // codecov,
          // ci_workflow,
          // release_workflow,
          socket
          // conventional_commits
        ].join('\n')
      },

      configuration,

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
          `[Docs generated by TypeDoc](https://${github_username}.github.io/undici/${unscoped_pkg_name}/)`,
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
        const lines = [
          `## Installation`,
          '\n\n',
          `\`\`\`sh`,
          '\n',
          `npm install ${pkg.name}`,
          '\n',
          `\`\`\``
        ]
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
  pkg_root: string
  project_started_in_year: number
}

const main = async ({
  current_year,
  pkg_root,
  project_started_in_year
}: Config) => {
  const errors: Error[] = []
  const configurations: string[] = [`## Configuration`, '\n\n']

  if (unscoped_pkg_name === 'eleventy-plugin-content-security-policy') {
    configurations.push('\n\n')
    configurations.push(
      `Refer also to the library ${link('@jackdbd/content-security-policy', 'https://www.npmjs.com/package/@jackdbd/content-security-policy')} for the configuration.`
    )
  } else if (unscoped_pkg_name === 'eleventy-plugin-ensure-env-vars') {
    const res = markdownTableFromZodSchema(eev_config)
    if (res.error) {
      errors.push(res.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res.value)
    }
  } else if (unscoped_pkg_name === 'eleventy-plugin-permissions-policy') {
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
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res_a.value)
    }
    const res_b = markdownTableFromZodSchema(pp_directive)
    if (res_b.error) {
      errors.push(res_b.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Permissions-Policy directive`)
      configurations.push('\n\n')
      configurations.push(res_b.value)
    }
  } else if (unscoped_pkg_name === 'eleventy-plugin-plausible') {
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
    const res_a = markdownTableFromZodSchema(tts_config)
    if (res_a.error) {
      errors.push(res_a.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Plugin options`)
      configurations.push('\n\n')
      configurations.push(res_a.value)
    }
    const res_b = markdownTableFromZodSchema(tts_rule)
    if (res_b.error) {
      errors.push(res_b.error)
    } else {
      configurations.push('\n\n')
      configurations.push(`### Rule`)
      configurations.push('\n\n')
      configurations.push(res_b.value)
    }
  } else if (unscoped_pkg_name === 'text-to-audio-asset') {
    configurations.push(`TODO`)
  } else {
    const messages = [
      `Automatic README generation not implemented for package ${unscoped_pkg_name}.`,
      `Create a tpl.readme.md file in ${pkg_root}, update this script, then run it again.`
    ]
    errors.push(new Error(messages.join('\n')))
  }

  if (errors.length > 0) {
    throw new Error(
      `Error generating README: ${errors.map((e) => e.message).join('\n')}`
    )
  }

  const transcluded = readme({
    configuration: configurations.join(''),
    current_year,
    pkg_root,
    project_started_in_year
  })

  const outdoc = 'README.md'
  // console.log(`=== ${outdoc} BEGIN ===`)
  // console.log(transcluded.src)
  // console.log(`=== ${outdoc} END ===`)
  writeFileSync(join(pkg_root, outdoc), transcluded.src)
}

// const PACKAGES_ROOT = join(REPO_ROOT, 'packages')
const unscoped_pkg_name = process.argv[2]
const now = new Date()
const current_year = now.getFullYear()

await main({
  current_year,
  pkg_root: join(REPO_ROOT, 'packages', unscoped_pkg_name),
  project_started_in_year: 2022
})
